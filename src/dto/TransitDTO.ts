export interface TransitFilterDTO {
  plates?: string[];      
  from?: Date;
  to?: Date;
  userId: string;         
  userRole: string;       
  format?: 'json' | 'pdf';
}