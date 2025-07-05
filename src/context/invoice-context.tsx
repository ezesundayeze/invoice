import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/db';
import { Invoice, InvoiceFormData } from '../types/invoice';
import { format } from 'date-fns';

interface InvoiceContextType {
  invoices: Invoice[] | undefined;
  isLoading: boolean;
  createInvoice: (data: InvoiceFormData) => Promise<string>;
  updateInvoice: (id: string, data: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  getInvoice: (id: string) => Promise<Invoice | undefined>;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => Promise<void>;
}

export const InvoiceContext = React.createContext<InvoiceContextType>({
  invoices: [],
  isLoading: true,
  createInvoice: async () => '',
  updateInvoice: async () => {},
  deleteInvoice: async () => {},
  getInvoice: async () => undefined,
  updateInvoiceStatus: async () => {},
});

export const InvoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const invoices = useLiveQuery(() => db.invoices.orderBy('createdAt').reverse().toArray());
  const isLoading = invoices === undefined;

  const createInvoice = async (data: InvoiceFormData): Promise<string> => {
    const now = new Date().toISOString();
    const id = uuidv4();
    
    const invoice: Invoice = {
      id,
      ...data,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    };
    
    await db.invoices.add(invoice);
    return id;
  };

  const updateInvoice = async (id: string, data: Partial<Invoice>): Promise<void> => {
    await db.invoices.update(id, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  };

  const deleteInvoice = async (id: string): Promise<void> => {
    await db.invoices.delete(id);
  };

  const getInvoice = async (id: string): Promise<Invoice | undefined> => {
    return await db.invoices.get(id);
  };

  const updateInvoiceStatus = async (id: string, status: Invoice['status']): Promise<void> => {
    await db.invoices.update(id, {
      status,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <InvoiceContext.Provider
      value={{
        invoices,
        isLoading,
        createInvoice,
        updateInvoice,
        deleteInvoice,
        getInvoice,
        updateInvoiceStatus,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
};

export const useInvoice = () => React.useContext(InvoiceContext);