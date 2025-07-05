import React from "react";
import { format, parseISO, subMonths, isWithinInterval, startOfMonth, endOfMonth } from "date-fns";
import { Card, CardBody, CardHeader, Spinner, Chip, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useInvoice } from "../context/invoice-context";
import { Invoice } from "../types/invoice";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

export const Dashboard: React.FC = () => {
  const { invoices, isLoading } = useInvoice();
  
  // Calculate summary statistics
  const summaryStats = React.useMemo(() => {
    if (!invoices) return {
      totalInvoices: 0,
      totalAmount: 0,
      paidAmount: 0,
      overdueAmount: 0,
      pendingAmount: 0,
      averageInvoiceValue: 0,
    };

    const stats = {
      totalInvoices: invoices.length,
      totalAmount: 0,
      paidAmount: 0,
      overdueAmount: 0,
      pendingAmount: 0,
    };

    invoices.forEach(invoice => {
      const invoiceTotal = invoice.items.reduce(
        (sum, item) => sum + item.quantity * item.price, 0
      );
      
      stats.totalAmount += invoiceTotal;
      
      if (invoice.status === 'paid') {
        stats.paidAmount += invoiceTotal;
      } else if (invoice.status === 'overdue') {
        stats.overdueAmount += invoiceTotal;
      } else {
        stats.pendingAmount += invoiceTotal;
      }
    });

    return {
      ...stats,
      averageInvoiceValue: stats.totalInvoices > 0 
        ? stats.totalAmount / stats.totalInvoices 
        : 0
    };
  }, [invoices]);

  // Generate monthly data for the last 6 months
  const monthlyData = React.useMemo(() => {
    if (!invoices) return [];
    
    const months = [];
    const now = new Date();
    
    // Create data for the last 6 months
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      const monthInvoices = invoices.filter(invoice => {
        const invoiceDate = parseISO(invoice.date);
        return isWithinInterval(invoiceDate, { start: monthStart, end: monthEnd });
      });
      
      const totalAmount = monthInvoices.reduce((sum, invoice) => {
        return sum + invoice.items.reduce(
          (itemSum, item) => itemSum + item.quantity * item.price, 0
        );
      }, 0);
      
      months.push({
        name: format(monthDate, 'MMM yyyy'),
        amount: totalAmount,
      });
    }
    
    return months;
  }, [invoices]);

  // Generate status distribution data for pie chart
  const statusData = React.useMemo(() => {
    if (!invoices) return [];
    
    const statusCounts = {
      draft: 0,
      sent: 0,
      paid: 0,
      overdue: 0
    };
    
    invoices.forEach(invoice => {
      statusCounts[invoice.status]++;
    });
    
    return [
      { name: 'Draft', value: statusCounts.draft },
      { name: 'Sent', value: statusCounts.sent },
      { name: 'Paid', value: statusCounts.paid },
      { name: 'Overdue', value: statusCounts.overdue }
    ];
  }, [invoices]);

  // Get recent invoices (last 5)
  const recentInvoices = React.useMemo(() => {
    if (!invoices) return [];
    return [...invoices].slice(0, 5);
  }, [invoices]);

  const statusColorMap = {
    draft: "#a1a1aa", // default
    sent: "#338ef7",  // primary
    paid: "#17c964",  // success
    overdue: "#f31260" // danger
  };

  const COLORS = ["#a1a1aa", "#338ef7", "#17c964", "#f31260"];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Invoice Dashboard</h2>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-content1">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground-500 text-sm">Total Invoices</p>
                <p className="text-2xl font-semibold">{summaryStats.totalInvoices}</p>
              </div>
              <div className="p-2 bg-primary-100 rounded-md">
                <Icon icon="lucide:file-text" className="text-primary h-6 w-6" />
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="bg-content1">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground-500 text-sm">Total Amount</p>
                <p className="text-2xl font-semibold">{formatCurrency(summaryStats.totalAmount)}</p>
              </div>
              <div className="p-2 bg-success-100 rounded-md">
                <Icon icon="lucide:dollar-sign" className="text-success h-6 w-6" />
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="bg-content1">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground-500 text-sm">Paid Amount</p>
                <p className="text-2xl font-semibold">{formatCurrency(summaryStats.paidAmount)}</p>
              </div>
              <div className="p-2 bg-success-100 rounded-md">
                <Icon icon="lucide:check-circle" className="text-success h-6 w-6" />
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="bg-content1">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground-500 text-sm">Overdue Amount</p>
                <p className="text-2xl font-semibold">{formatCurrency(summaryStats.overdueAmount)}</p>
              </div>
              <div className="p-2 bg-danger-100 rounded-md">
                <Icon icon="lucide:alert-circle" className="text-danger h-6 w-6" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Chart */}
        <Card className="lg:col-span-2 bg-content1">
          <CardHeader className="pb-0">
            <h3 className="text-lg font-medium">Monthly Revenue</h3>
          </CardHeader>
          <CardBody className="overflow-hidden">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis 
                    tickFormatter={(value) => `$${value}`} 
                    width={80}
                  />
                  <Tooltip 
                    formatter={(value) => [`${formatCurrency(value as number)}`, 'Amount']}
                    labelStyle={{ color: '#000' }}
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      border: '1px solid #e4e4e7',
                      borderRadius: '8px',
                      padding: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill="#338ef7" 
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
        
        {/* Invoice Status Distribution */}
        <Card className="bg-content1">
          <CardHeader className="pb-0">
            <h3 className="text-lg font-medium">Invoice Status</h3>
          </CardHeader>
          <CardBody>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    animationDuration={1500}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip 
                    formatter={(value) => [`${value}`, 'Count']}
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      border: '1px solid #e4e4e7',
                      borderRadius: '8px',
                      padding: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>
      
      {/* Recent Invoices */}
      <Card className="bg-content1">
        <CardHeader>
          <h3 className="text-lg font-medium">Recent Invoices</h3>
        </CardHeader>
        <CardBody>
          {recentInvoices.length > 0 ? (
            <div className="space-y-4">
              {recentInvoices.map((invoice, index) => {
                const total = invoice.items.reduce(
                  (sum, item) => sum + item.quantity * item.price, 0
                );
                
                return (
                  <div key={invoice.id}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-foreground-500">
                          {invoice.to.name} • {format(parseISO(invoice.date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(total)}</p>
                        <Chip
                          className="capitalize mt-1"
                          color={invoice.status as "default" | "primary" | "success" | "danger"}
                          size="sm"
                          variant="flat"
                        >
                          {invoice.status}
                        </Chip>
                      </div>
                    </div>
                    {index < recentInvoices.length - 1 && <Divider className="my-4" />}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-foreground-500">
              No invoices found
            </div>
          )}
        </CardBody>
      </Card>
      
      {/* Invoice Aging Analysis */}
      <Card className="bg-content1">
        <CardHeader>
          <h3 className="text-lg font-medium">Payment Status Breakdown</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1 p-4 border border-default-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-foreground-500 text-sm">Paid</p>
                    <p className="text-xl font-semibold text-success">{formatCurrency(summaryStats.paidAmount)}</p>
                  </div>
                  <div className="p-2 bg-success-100 rounded-md">
                    <Icon icon="lucide:check-circle" className="text-success h-5 w-5" />
                  </div>
                </div>
              </div>
              
              <div className="flex-1 p-4 border border-default-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-foreground-500 text-sm">Pending</p>
                    <p className="text-xl font-semibold text-primary">{formatCurrency(summaryStats.pendingAmount)}</p>
                  </div>
                  <div className="p-2 bg-primary-100 rounded-md">
                    <Icon icon="lucide:clock" className="text-primary h-5 w-5" />
                  </div>
                </div>
              </div>
              
              <div className="flex-1 p-4 border border-default-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-foreground-500 text-sm">Overdue</p>
                    <p className="text-xl font-semibold text-danger">{formatCurrency(summaryStats.overdueAmount)}</p>
                  </div>
                  <div className="p-2 bg-danger-100 rounded-md">
                    <Icon icon="lucide:alert-circle" className="text-danger h-5 w-5" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-full bg-default-100 rounded-full h-4 overflow-hidden">
              <div className="flex h-full">
                {summaryStats.totalAmount > 0 && (
                  <>
                    <div 
                      className="bg-success" 
                      style={{ width: `${(summaryStats.paidAmount / summaryStats.totalAmount) * 100}%` }}
                    />
                    <div 
                      className="bg-primary" 
                      style={{ width: `${(summaryStats.pendingAmount / summaryStats.totalAmount) * 100}%` }}
                    />
                    <div 
                      className="bg-danger" 
                      style={{ width: `${(summaryStats.overdueAmount / summaryStats.totalAmount) * 100}%` }}
                    />
                  </>
                )}
              </div>
            </div>
            
            <div className="flex justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success rounded-full" />
                <span className="text-sm">Paid</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-full" />
                <span className="text-sm">Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-danger rounded-full" />
                <span className="text-sm">Overdue</span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};