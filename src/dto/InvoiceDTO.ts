import { Role } from "../enum/Role";

/**
 * DTO per le informazioni di una fattura
 * @interface InvoiceDTO
 */
export interface InvoiceDTO {
  userId: string;
  user: string;
  invoiceId: string;
  amount: number;
  parkingName: string;
  dueDate: Date;
}

/**
 * DTO per i filtri di ricerca delle fatture
 * @interface InvoiceFilterDTO
 */
export interface InvoiceFilterDTO {
  plates?: string[];           // targhe opzionali
  status?: 'PAID' | 'UNPAID' | 'OVERDUE'; 
  fromEntry?: Date;
  toEntry?: Date;
  fromExit?: Date;
  toExit?: Date;
  userId: string;              
  userRole: Role;
}