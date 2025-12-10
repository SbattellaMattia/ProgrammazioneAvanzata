export interface TransitFilterDTO {
  // 🔹 Campi usati come FILTRI in ingresso (controller → service)
  plates?: string[];
  from?: Date;
  to?: Date;
  userId?: string;
  userRole?: string;       // "DRIVER" | "OPERATOR"
  type?: string;           // filtro per tipo veicolo (car, motorcycle, truck, ...)
  format?: "json" | "pdf";
}

export interface TransitReportDTO {
  date: Date;
  vehicleId: string;
  gateId: string;
  transitType: string;    
  vehicleType: string;    
}