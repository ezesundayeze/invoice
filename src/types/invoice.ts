export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate?: string;
  from: {
    name: string;
    email: string;
    address: string;
    phone?: string;
  };
  to: {
    name: string;
    email?: string;
    address: string;
    phone?: string;
  };
  items: InvoiceItem[];
  notes?: string;
  terms?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceFormData {
  invoiceNumber: string;
  date: string;
  dueDate?: string;
  from: {
    name: string;
    email: string;
    address: string;
    phone: string;
  };
  to: {
    name: string;
    email?: string;
    address: string;
    phone: string;
  };
  items: InvoiceItem[];
  notes: string;
  terms: string;
}
