export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface InvoiceBranding {
  logo?: string; // data URL of the uploaded logo image
  accentColor?: string; // hex color used for headings/accents
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
  currency: string;
  branding?: InvoiceBranding;
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
  currency: string;
  branding?: InvoiceBranding;
  notes: string;
  terms: string;
}
