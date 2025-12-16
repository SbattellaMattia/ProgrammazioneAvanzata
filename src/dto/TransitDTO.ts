/** DTO per i filtri di ricerca dei transiti
 * @interface TransitFilterDTO
 */
export interface TransitFilterDTO {
  plates?: string[];
  from?: Date;
  to?: Date;
  userId?: string;
  userRole?: string;       
  format?: "json" | "pdf";
}

/** DTO per il report dei transiti
 * @interface TransitReportDTO
 */
export interface TransitReportDTO {
  date: Date;
  vehicleId: string;
  gateId: string;
  transitType: string;    
  vehicleType: string;    
}