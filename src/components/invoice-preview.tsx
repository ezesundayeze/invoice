import React from "react";
import { format, parseISO } from "date-fns";
import { Button, Spinner, Divider, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useInvoice } from "../context/invoice-context";
import { Invoice } from "../types/invoice";
import { exportToPdf } from "../utils/export-utils";

interface InvoicePreviewProps {
  invoiceId: string;
}

const statusColorMap = {
  draft: "default",
  sent: "primary",
  paid: "success",
  overdue: "danger",
} as const;

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoiceId }) => {
  const { getInvoice } = useInvoice();
  const [invoice, setInvoice] = React.useState<Invoice | null>(null);
  const [loading, setLoading] = React.useState(true);
  const invoiceRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const data = await getInvoice(invoiceId);
        if (data) {
          setInvoice(data);
        }
      } catch (error) {
        console.error("Error fetching invoice:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId, getInvoice]);

  const calculateSubtotal = () => {
    if (!invoice) return 0;
    return invoice.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );
  };

  const handleExportPdf = () => {
    if (invoiceRef.current && invoice) {
      exportToPdf(invoiceRef.current, `Invoice-${invoice.invoiceNumber}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!invoice) {
    return <div className="text-center py-8">Invoice not found</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          color="primary"
          variant="flat"
          startContent={<Icon icon="lucide:download" />}
          onPress={handleExportPdf}
        >
          Export PDF
        </Button>
      </div>
      
      <div ref={invoiceRef} className="bg-white p-6 rounded-lg">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">INVOICE</h1>
            <div className="mt-1">
              <Chip
                className="capitalize"
                color={statusColorMap[invoice.status]}
                size="sm"
                variant="flat"
              >
                {invoice.status}
              </Chip>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-semibold text-gray-800">{invoice.invoiceNumber}</p>
            <p className="text-gray-600 text-sm">
              Date: {format(parseISO(invoice.date), 'MMMM dd, yyyy')}
            </p>
            {invoice.dueDate && (
              <p className="text-gray-600 text-sm">
                Due Date: {format(parseISO(invoice.dueDate), 'MMMM dd, yyyy')}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-gray-500 font-medium mb-2 text-sm">FROM</h2>
            <p className="font-semibold">{invoice.from.name}</p>
            <p className="text-gray-600 whitespace-pre-line">{invoice.from.address}</p>
            <p className="text-gray-600">{invoice.from.email}</p>
            {invoice.from.phone && <p className="text-gray-600">{invoice.from.phone}</p>}
          </div>
          
          <div>
            <h2 className="text-gray-500 font-medium mb-2 text-sm">TO</h2>
            <p className="font-semibold">{invoice.to.name}</p>
            <p className="text-gray-600 whitespace-pre-line">{invoice.to.address}</p>
            {invoice.to.email && <p className="text-gray-600">{invoice.to.email}</p>}
            {invoice.to.phone && <p className="text-gray-600">{invoice.to.phone}</p>}
          </div>
        </div>

        <div className="mb-8">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-2 text-gray-500 font-medium text-sm">DESCRIPTION</th>
                <th className="py-3 px-2 text-gray-500 font-medium text-sm text-right">QTY</th>
                <th className="py-3 px-2 text-gray-500 font-medium text-sm text-right">PRICE</th>
                <th className="py-3 px-2 text-gray-500 font-medium text-sm text-right">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-4 px-2">{item.description}</td>
                  <td className="py-4 px-2 text-right">{item.quantity}</td>
                  <td className="py-4 px-2 text-right">${item.price.toFixed(2)}</td>
                  <td className="py-4 px-2 text-right">
                    ${(item.quantity * item.price).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
            </div>
            <Divider className="my-2" />
            <div className="flex justify-between py-2">
              <span className="font-semibold">Total</span>
              <span className="font-bold">${calculateSubtotal().toFixed(2)}</span>
            </div>
          </div>
        </div>

        {(invoice.notes || invoice.terms) && (
          <div className="border-t border-gray-200 pt-4 space-y-4">
            {invoice.notes && (
              <div>
                <h2 className="text-gray-500 font-medium mb-1 text-sm">NOTES</h2>
                <p className="text-gray-600">{invoice.notes}</p>
              </div>
            )}
            
            {invoice.terms && (
              <div>
                <h2 className="text-gray-500 font-medium mb-1 text-sm">TERMS & CONDITIONS</h2>
                <p className="text-gray-600">{invoice.terms}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};