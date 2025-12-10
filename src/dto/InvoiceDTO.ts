import { Role } from "../enum/Role";

export interface InvoiceDTO {
  userId: string;
  user: string;
  invoiceId: string;
  amount: number;
  parkingName: string;
  dueDate: Date;
}

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