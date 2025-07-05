import React from "react";
import { Tabs, Tab, Card } from "@heroui/react";
import { CreateInvoice } from "./components/create-invoice";
import { InvoiceList } from "./components/invoice-list";
import { InvoiceProvider } from "./context/invoice-context";
import { Dashboard } from "./components/dashboard";
import SettingsPage from "./components/settings-page"; // Import the SettingsPage component

export default function App() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Invoice Generator</h1>
          <p className="text-foreground-500 mt-1">Create, manage, and export your invoices</p>
        </header>
        
        <InvoiceProvider>
          <Card className="p-0">
            <Tabs aria-label="Invoice tabs" fullWidth>
              <Tab key="dashboard" title="Dashboard">
                <div className="p-4 md:p-6">
                  <Dashboard />
                </div>
              </Tab>
              <Tab key="create" title="Create Invoice">
                <div className="p-4 md:p-6">
                  <CreateInvoice />
                </div>
              </Tab>
              <Tab key="list" title="Manage Invoices">
                <div className="p-4 md:p-6">
                  <InvoiceList />
                </div>
              </Tab>
              <Tab key="settings" title="Settings">
                <div className="p-4 md:p-6">
                  <SettingsPage />
                </div>
              </Tab>
            </Tabs>
          </Card>
        </InvoiceProvider>
      </div>
    </div>
  );
}