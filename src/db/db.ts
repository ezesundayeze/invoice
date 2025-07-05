import Dexie, { Table } from 'dexie';
import { Invoice } from '../types/invoice';

class InvoiceDatabase extends Dexie {
  invoices!: Table<Invoice, string>;

  constructor() {
    super('InvoiceDatabase');
    this.version(1).stores({
      invoices: 'id, invoiceNumber, date, dueDate, status, createdAt, updatedAt'
    });
  }
}

export const db = new InvoiceDatabase();
