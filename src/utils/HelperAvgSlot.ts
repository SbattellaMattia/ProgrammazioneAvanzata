/**
 * Ritorna la “fascia” di 2 ore in cui cade la data.
 * Esempio: 09:xx -> "08-10", 21:xx -> "20-22"
 */
const getSlot = (d: Date): string => {
  const h = d.getHours();
  const startHour = Math.floor(h / 2) * 2;
  const endHour = startHour + 2;

  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(startHour)}-${pad(endHour)}`;
};


/**
 * Limita un numero dentro un intervallo (min..max).
 * Utile per evitare valori negativi o oltre la capacità.
 */
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Dato un momento qualsiasi, calcola inizio e fine dello slot di 2 ore
 * in cui quel momento cade.
 */
function slotStartEnd(d: Date): { start: Date; end: Date } {
  const start = new Date(d);
  start.setMinutes(0, 0, 0);
  const h = start.getHours();
  const startHour = Math.floor(h / 2) * 2;
  start.setHours(startHour, 0, 0, 0);

  const end = new Date(start);
  end.setHours(end.getHours() + 2);
  return { start, end };
}

type SlotAccum = { freeTime: number; dur: number };

/**
 * Calcola la media dei posti liberi (totali) per slot di 2 ore.
 *
 * Idea generale:
 * - consideriamo gli eventi di ingresso/uscita ordinati nel tempo
 * - tra un evento e l’altro l’occupazione rimane costante
 * - per ogni pezzo di tempo, aggiorniamo lo slot corretto
 * - alla fine facciamo una media “pesata sul tempo” (non una semplice media)
 *
 */
export function calculateAvgFreeSlotsTotal(params: {
  transits: Array<{ date: Date; type: "in" | "out" }>;
  totalCapacity: number;
  startDate: Date;
  endDate: Date;
}) {
  const { transits, totalCapacity, startDate, endDate } = params;

  const slotMap = new Map<string, SlotAccum>();
  const ensureSlot = (slot: string) => {
    if (!slotMap.has(slot)) slotMap.set(slot, { freeTime: 0, dur: 0 });
    return slotMap.get(slot)!;
  };

  let occ = 0;

  const events = transits
    .filter(t => t.date >= startDate && t.date <= endDate)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const addInterval = (a: Date, b: Date) => {
    if (b <= a) return;

    let cur = new Date(a);
    while (cur < b) {
      const { end: slotEnd } = slotStartEnd(cur);
      const chunkEnd = slotEnd < b ? slotEnd : b;

      const dt = chunkEnd.getTime() - cur.getTime();
      const slotKey = getSlot(cur);
      const acc = ensureSlot(slotKey);

      const free = clamp(totalCapacity - occ, 0, totalCapacity);
      acc.freeTime += free * dt;
      acc.dur += dt;

      cur = new Date(chunkEnd);
    }
  };

  let prev = new Date(startDate);

  for (const ev of events) {
    addInterval(prev, ev.date);

    if (ev.type === "in") occ = clamp(occ + 1, 0, totalCapacity);
    else occ = clamp(occ - 1, 0, totalCapacity);

    prev = new Date(ev.date);
  }

  addInterval(prev, endDate);

  const bySlot = Array.from(slotMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([slot, acc]) => ({
      slot,
      avgFreeSlots: acc.dur ? Number((acc.freeTime / acc.dur).toFixed(2)) : 0,
    }));

  const totalFreeTime = Array.from(slotMap.values()).reduce((s, a) => s + a.freeTime, 0);
  const totalDur = Array.from(slotMap.values()).reduce((s, a) => s + a.dur, 0);

  const overall = totalDur ? Number((totalFreeTime / totalDur).toFixed(2)) : 0;

  return { bySlot, overall };
}