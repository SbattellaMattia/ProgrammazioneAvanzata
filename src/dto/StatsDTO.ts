/**
 * DTO per le statistiche del parcheggio
 * @interface ParkingStatsDTO
 */
export interface ParkingTransitsBySlot {
  slot: string;
  total: number;
  in: number;
  out: number;
}

/**
 * DTO per le statistiche dei transiti
 * @interface ParkingTransitsStats
 */
export interface ParkingTransitsStats {
  total: number;
  byType: {
    in: number;
    out: number;
  };
  byVehicleType: Record<string, number>;
  bySlot: ParkingTransitsBySlot[];
  list: any[]; 
}

/** DTO per le statistiche di un parcheggio
 * @interface ParkingStatsDTO
 */
export interface ParkingStatsDTO {
  parkingId: string;
  parkingName: string;
  from: Date;
  to: Date;
  totalRevenue: number;
  paidRevenue: number;
  invoiceCount: number;
  invoiceCountByStatus: {
    paid: number;
    unpaid: number;
    expired: number;
  };
  transits: ParkingTransitsStats;
}

/** DTO per le medie dei posti liberi
 * @interface AvgFreeSlotsDTO
 */
export interface AvgFreeSlotsDTO {
  overall?: number;
  bySlot: Array<{
    slot: string;
    avgFreeSlots: number;
  }>;
}

/** DTO per le statistiche globali dei parcheggi
 * @interface GlobalParkingStatsDTO
 */
export interface GlobalParkingStatsDTO {
  parkingId: string;
  parkingName: string;
  from: Date;
  to: Date;
  totalRevenue: number;
  paidRevenue: number;
  capacity: {
    total: number;
  };
  avgFreeSlots: AvgFreeSlotsDTO;
}