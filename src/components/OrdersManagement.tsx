import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  Eye,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { Order } from "@/hooks/useOrders";

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case "processing":
      return <Package className="h-4 w-4 text-blue-500" />;
    case "shipped":
      return <Truck className="h-4 w-4 text-purple-500" />;
    case "delivered":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "paid":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "cancelled":
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "processing":
      return "bg-blue-100 text-blue-800";
    case "shipped":
      return "bg-purple-100 text-purple-800";
    case "delivered":
      return "bg-green-100 text-green-800";
    case "paid":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "failed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const OrdersManagement = () => {
  const {
    orders,
    loading,
    updateOrderStatus,
    deleteOrder
  } = useOrders();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    await updateOrderStatus(orderId, newStatus);
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm('Are you sure you want to delete this order?')) {
      await deleteOrder(orderId);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-1/4"></div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 bg-gray-200 rounded animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Orders Management
          </h2>
          <p className="text-gray-600">Manage and track customer orders</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            className="border-gray-300 hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search orders by ID, customer name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">
            Orders ({filteredOrders.length})
          </CardTitle>
          <CardDescription>Recent orders from your customers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-3 font-medium text-gray-700">
                    Order ID
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700">
                    Customer
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700">
                    Items
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700">
                    Total
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700">
                    Status
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700">
                    Payment Method
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700">
                    Date
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="p-3 font-mono text-sm text-gray-900">
                      #{order.id}
                    </td>
                    <td className="p-3">
                      <div>
                        <div className="font-medium text-gray-900">
                          {order.customer_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.customer_email}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        {order.items?.slice(0, 2).map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-1"
                          >
                            <div className="w-8 h-8 bg-gray-200 rounded border border-gray-200 flex items-center justify-center">
                              <Package className="h-4 w-4 text-gray-500" />
                            </div>
                            <span className="text-sm text-gray-700">
                              {item.quantity}x {item.product_name}
                            </span>
                          </div>
                        ))}
                        {order.items && order.items.length > 2 && (
                          <Badge
                            variant="secondary"
                            className="bg-gray-100 text-gray-700"
                          >
                            +{order.items.length - 2}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-3 font-medium text-gray-900">
                      ${order.total_amount}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        <Badge className="bg-blue-100 text-blue-800">
                          {order.payment_method}
                        </Badge>
                        {order.payment_status && (
                          <Badge
                            variant={order.payment_status === 'success' ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {order.payment_status}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedOrder(order)}
                          className="border-gray-300 hover:bg-gray-50"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleStatusUpdate(order.id, e.target.value as Order['status'])
                          }
                          className="text-xs px-2 py-1 bg-gray-50 border border-gray-300 text-gray-900 rounded focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="paid">Paid</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteOrder(order.id)}
                          className="border-red-300 hover:bg-red-50 text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-200 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Order Details #{selectedOrder.id}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedOrder(null)}
                className="border-gray-300 hover:bg-gray-50"
              >
                ×
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700">
                    Customer Information
                  </h4>
                  <div className="text-sm text-gray-900">
                    <div className="flex items-center gap-1 mb-1">
                      <Mail className="h-4 w-4 text-gray-500" />
                      {selectedOrder.customer_email}
                    </div>
                    <div className="flex items-center gap-1 mb-1">
                      <Phone className="h-4 w-4 text-gray-500" />
                      {selectedOrder.customer_phone}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      {selectedOrder.customer_name}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">Order Status</h4>
                  <Badge className={getStatusColor(selectedOrder.status)}>
                    {selectedOrder.status}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Order Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 border border-gray-200 rounded bg-gray-50"
                    >
                      <div className="w-12 h-12 bg-gray-200 rounded border border-gray-200 flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {item.product_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Qty: {item.quantity} | Size: {item.size || 'N/A'} | Color: {item.color || 'N/A'}
                        </div>
                      </div>
                      <div className="font-medium text-gray-900">
                        ${item.price}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700">
                    Shipping Address
                  </h4>
                  <p className="text-sm text-gray-900">
                    {selectedOrder.shipping_address}
                    <br />
                    {selectedOrder.shipping_city}, {selectedOrder.shipping_state} {selectedOrder.shipping_zip_code}
                    <br />
                    {selectedOrder.shipping_country}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">Total Amount</h4>
                  <p className="text-lg font-bold text-gray-900">
                    ${selectedOrder.total_amount}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
