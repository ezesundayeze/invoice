import React from "react";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";
import { 
  Button, 
  Input, 
  Textarea, 
  Card, 
  CardBody, 
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  addToast
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useInvoice } from "../context/invoice-context";
import { InvoiceFormData, InvoiceItem } from "../types/invoice";
import { InvoicePreview } from "./invoice-preview";

const emptyItem = (): InvoiceItem => ({
  id: uuidv4(),
  description: "",
  quantity: 1,
  price: 0,
});

const initialFormState: InvoiceFormData = {
  invoiceNumber: `INV-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
  date: format(new Date(), 'yyyy-MM-dd'),
  // dueDate is now optional
  from: {
    name: "",
    email: "",
    address: "",
    phone: "",
  },
  to: {
    name: "",
    // email is now optional
    address: "",
    phone: "",
  },
  items: [emptyItem()],
  notes: "",
  terms: "Payment is due within 30 days",
};

export const CreateInvoice: React.FC = () => {
  const { createInvoice } = useInvoice();
  const [formData, setFormData] = React.useState<InvoiceFormData>(initialFormState);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [createdInvoiceId, setCreatedInvoiceId] = React.useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    section?: keyof InvoiceFormData
  ) => {
    const { name, value } = e.target;
    
    if (section) {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [name]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleItemChange = (
    id: string,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, emptyItem()],
    }));
  };

  const removeItem = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const calculateSubtotal = () => {
    return formData.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const id = await createInvoice(formData);
      setCreatedInvoiceId(id);
      onOpen();
      
      addToast({
        title: "Invoice Created",
        description: `Invoice ${formData.invoiceNumber} has been created successfully.`,
        color: "success",
      });
      
      // Reset form after successful creation
      setFormData({
        ...initialFormState,
        invoiceNumber: `INV-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        date: format(new Date(), 'yyyy-MM-dd'),
        // No need to set dueDate here as it's optional and defaults to undefined in initialFormState
      });
    } catch (error) {
      console.error("Error creating invoice:", error);
      addToast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        color: "danger",
      });
    }
  };

  const handleCloseModal = () => {
    onClose();
    setCreatedInvoiceId(null);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Invoice Details */}
          <Card className="p-4">
            <CardBody className="space-y-4">
              <h2 className="text-lg font-semibold">Invoice Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Invoice Number"
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={handleInputChange}
                  isRequired
                />
                <Input
                  label="Date"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  isRequired
                />
                <Input
                  label="Due Date"
                  type="date"
                  name="dueDate"
                  value={formData.dueDate || ""}
                  onChange={handleInputChange}
                />
              </div>
            </CardBody>
          </Card>

          {/* From (Your Details) */}
          <Card className="p-4">
            <CardBody className="space-y-4">
              <h2 className="text-lg font-semibold">Your Details</h2>
              <div className="space-y-3">
                <Input
                  label="Name"
                  name="name"
                  value={formData.from.name}
                  onChange={(e) => handleInputChange(e, "from")}
                  isRequired
                />
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.from.email}
                  onChange={(e) => handleInputChange(e, "from")}
                  isRequired
                />
                <Textarea
                  label="Address"
                  name="address"
                  value={formData.from.address}
                  onChange={(e) => handleInputChange(e, "from")}
                  isRequired
                />
                <Input
                  label="Phone"
                  name="phone"
                  value={formData.from.phone}
                  onChange={(e) => handleInputChange(e, "from")}
                />
              </div>
            </CardBody>
          </Card>

          {/* To (Client Details) */}
          <Card className="p-4">
            <CardBody className="space-y-4">
              <h2 className="text-lg font-semibold">Client Details</h2>
              <div className="space-y-3">
                <Input
                  label="Name"
                  name="name"
                  value={formData.to.name}
                  onChange={(e) => handleInputChange(e, "to")}
                  isRequired
                />
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.to.email || ""}
                  onChange={(e) => handleInputChange(e, "to")}
                />
                <Textarea
                  label="Address"
                  name="address"
                  value={formData.to.address}
                  onChange={(e) => handleInputChange(e, "to")}
                  isRequired
                />
                <Input
                  label="Phone"
                  name="phone"
                  value={formData.to.phone}
                  onChange={(e) => handleInputChange(e, "to")}
                />
              </div>
            </CardBody>
          </Card>

          {/* Additional Information */}
          <Card className="p-4">
            <CardBody className="space-y-4">
              <h2 className="text-lg font-semibold">Additional Information</h2>
              <div className="space-y-3">
                <Textarea
                  label="Notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Additional notes for the client..."
                />
                <Textarea
                  label="Terms & Conditions"
                  name="terms"
                  value={formData.terms}
                  onChange={handleInputChange}
                  placeholder="Payment terms and conditions..."
                />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Invoice Items */}
        <Card className="p-4">
          <CardBody className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Invoice Items</h2>
              <Button 
                color="primary" 
                variant="flat" 
                size="sm" 
                startContent={<Icon icon="lucide:plus" />}
                onPress={addItem}
              >
                Add Item
              </Button>
            </div>
            
            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-12 md:col-span-5">
                    <Input
                      label="Description"
                      value={item.description}
                      onChange={(e) => 
                        handleItemChange(item.id, "description", e.target.value)
                      }
                      isRequired
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <Input
                      label="Quantity"
                      type="number"
                      min="1"
                      value={item.quantity.toString()}
                      onChange={(e) => 
                        handleItemChange(item.id, "quantity", parseInt(e.target.value) || 0)
                      }
                      isRequired
                    />
                  </div>
                  <div className="col-span-6 md:col-span-3">
                    <Input
                      label="Price"
                      type="number"
                      min="0"
                      step="0.01"
                      startContent={<div className="pointer-events-none">$</div>}
                      value={item.price.toString()}
                      onChange={(e) => 
                        handleItemChange(item.id, "price", parseFloat(e.target.value) || 0)
                      }
                      isRequired
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1 flex items-center justify-end">
                    <p className="text-foreground-600 text-sm">
                      ${(item.quantity * item.price).toFixed(2)}
                    </p>
                  </div>
                  <div className="col-span-12 md:col-span-1 flex justify-end">
                    {formData.items.length > 1 && (
                      <Button
                        isIconOnly
                        color="danger"
                        variant="light"
                        size="sm"
                        onPress={() => removeItem(item.id)}
                      >
                        <Icon icon="lucide:trash-2" />
                      </Button>
                    )}
                  </div>
                  {index < formData.items.length - 1 && (
                    <div className="col-span-12">
                      <Divider className="my-2" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex justify-end mt-4">
              <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-foreground-600">Subtotal:</span>
                  <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-600">Total:</span>
                  <span className="font-semibold text-lg">${calculateSubtotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="flex justify-end gap-2">
          <Button
            color="danger"
            variant="flat"
            onPress={() => setFormData(initialFormState)}
          >
            Reset
          </Button>
          <Button 
            color="primary" 
            type="submit"
            startContent={<Icon icon="lucide:save" />}
          >
            Create Invoice
          </Button>
        </div>
      </form>

      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader>Invoice Preview</ModalHeader>
              <ModalBody>
                {createdInvoiceId && <InvoicePreview invoiceId={createdInvoiceId} />}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={handleCloseModal}>
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