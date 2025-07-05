import React from "react";
import { 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell, 
  Button, 
  Chip,
  Spinner,
  Pagination,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  addToast
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { format, parseISO } from "date-fns";
import { useInvoice } from "../context/invoice-context";
import { Invoice } from "../types/invoice";
import { InvoicePreview } from "./invoice-preview";

const statusColorMap = {
  draft: "default",
  sent: "primary",
  paid: "success",
  overdue: "danger",
} as const;

export const InvoiceList: React.FC = () => {
  const { invoices, isLoading, deleteInvoice, updateInvoiceStatus } = useInvoice();
  const [selectedInvoice, setSelectedInvoice] = React.useState<string | null>(null);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [page, setPage] = React.useState(1);
  const rowsPerPage = 10;

  const handleViewInvoice = (id: string) => {
    setSelectedInvoice(id);
    onOpen();
  };

  const handleDeleteInvoice = async (id: string) => {
    try {
      await deleteInvoice(id);
      addToast({
        title: "Invoice Deleted",
        description: "Invoice has been deleted successfully.",
        color: "success",
      });
    } catch (error) {
      console.error("Error deleting invoice:", error);
      addToast({
        title: "Error",
        description: "Failed to delete invoice. Please try again.",
        color: "danger",
      });
    }
  };

  const handleStatusChange = async (id: string, status: Invoice['status']) => {
    try {
      await updateInvoiceStatus(id, status);
      addToast({
        title: "Status Updated",
        description: `Invoice status changed to ${status}.`,
        color: "success",
      });
    } catch (error) {
      console.error("Error updating invoice status:", error);
      addToast({
        title: "Error",
        description: "Failed to update invoice status. Please try again.",
        color: "danger",
      });
    }
  };

  const pages = Math.ceil((invoices?.length || 0) / rowsPerPage);
  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return invoices?.slice(start, end) || [];
  }, [invoices, page, rowsPerPage]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!invoices || invoices.length === 0) {
    return (
      <div className="text-center py-12">
        <Icon icon="lucide:file-text" className="mx-auto h-12 w-12 text-foreground-300" />
        <h3 className="mt-4 text-lg font-medium text-foreground">No invoices found</h3>
        <p className="mt-1 text-foreground-500">Get started by creating your first invoice.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table 
        aria-label="Invoices table"
        removeWrapper
        bottomContent={
          pages > 1 ? (
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                showControls
                showShadow
                color="primary"
                page={page}
                total={pages}
                onChange={setPage}
              />
            </div>
          ) : null
        }
      >
        <TableHeader>
          <TableColumn>INVOICE #</TableColumn>
          <TableColumn>DATE</TableColumn>
          <TableColumn>CLIENT</TableColumn>
          <TableColumn>AMOUNT</TableColumn>
          <TableColumn>STATUS</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody>
          {items.map((invoice) => {
            const total = invoice.items.reduce(
              (sum, item) => sum + item.quantity * item.price,
              0
            );
            
            return (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.invoiceNumber}</TableCell>
                <TableCell>{format(parseISO(invoice.date), 'MMM dd, yyyy')}</TableCell>
                <TableCell>{invoice.to.name}</TableCell>
                <TableCell>${total.toFixed(2)}</TableCell>
                <TableCell>
                  <Chip
                    className="capitalize"
                    color={statusColorMap[invoice.status]}
                    size="sm"
                    variant="flat"
                  >
                    {invoice.status}
                  </Chip>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => handleViewInvoice(invoice.id)}
                    >
                      <Icon icon="lucide:eye" className="text-lg" />
                    </Button>
                    
                    <Dropdown>
                      <DropdownTrigger>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                        >
                          <Icon icon="lucide:more-vertical" className="text-lg" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Invoice actions">
                        <DropdownItem textValue="Change Status" className="text-foreground">
                          <div className="font-medium">Change Status</div>
                        </DropdownItem>
                        <DropdownItem 
                          key="draft" 
                          textValue="Mark as Draft"
                          onPress={() => handleStatusChange(invoice.id, 'draft')}
                        >
                          Mark as Draft
                        </DropdownItem>
                        <DropdownItem 
                          key="sent" 
                          textValue="Mark as Sent"
                          onPress={() => handleStatusChange(invoice.id, 'sent')}
                        >
                          Mark as Sent
                        </DropdownItem>
                        <DropdownItem 
                          key="paid" 
                          textValue="Mark as Paid"
                          onPress={() => handleStatusChange(invoice.id, 'paid')}
                          className="text-success"
                        >
                          Mark as Paid
                        </DropdownItem>
                        <DropdownItem 
                          key="overdue" 
                          textValue="Mark as Overdue"
                          onPress={() => handleStatusChange(invoice.id, 'overdue')}
                          className="text-danger"
                        >
                          Mark as Overdue
                        </DropdownItem>
                        <DropdownItem 
                          key="delete" 
                          textValue="Delete"
                          className="text-danger"
                          onPress={() => handleDeleteInvoice(invoice.id)}
                        >
                          Delete Invoice
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader>Invoice Details</ModalHeader>
              <ModalBody>
                {selectedInvoice && <InvoicePreview invoiceId={selectedInvoice} />}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};