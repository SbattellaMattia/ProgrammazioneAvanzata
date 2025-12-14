export interface ParkingTransitsBySlot {
  slot: string;
  total: number;
  in: number;
  out: number;
}

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

export interface AvgFreeSlotsDTO {
  overall?: number;
  bySlot: Array<{
    slot: string;
    avgFreeSlots: number;
  }>;
}

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