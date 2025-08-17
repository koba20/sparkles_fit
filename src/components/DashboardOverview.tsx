import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";

export const DashboardOverview = () => {
  const { analytics, loading } = useAnalytics();

  if (loading || !analytics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Total Revenue",
      value: `$${analytics.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-600",
      trend: "+12.5%",
      trendUp: true,
    },
    {
      title: "Total Orders",
      value: analytics.totalOrders.toString(),
      icon: ShoppingCart,
      color: "text-blue-600",
      trend: "+8.2%",
      trendUp: true,
    },
    {
      title: "Total Products",
      value: analytics.totalProducts.toString(),
      icon: Package,
      color: "text-purple-600",
      trend: "+3.1%",
      trendUp: true,
    },
    {
      title: "Low Stock Items",
      value: analytics.lowStockProducts.toString(),
      icon: AlertTriangle,
      color: "text-orange-600",
      trend: "2 items",
      trendUp: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                  {stat.trendUp ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span
                    className={stat.trendUp ? "text-green-500" : "text-red-500"}
                  >
                    {stat.trend}
                  </span>
                  <span>from last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">Recent Orders</CardTitle>
            <CardDescription>Latest orders from your customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.orderStatusCounts.slice(0, 5).map((status, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        status.status === "pending"
                          ? "bg-yellow-500"
                          : status.status === "processing"
                          ? "bg-blue-500"
                          : status.status === "shipped"
                          ? "bg-purple-500"
                          : status.status === "delivered"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    />
                    <span className="capitalize font-medium text-gray-900">
                      {status.status}
                    </span>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-gray-100 text-gray-700"
                  >
                    {status.count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">Top Products</CardTitle>
            <CardDescription>Best selling products this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-medium text-gray-700">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-sm text-gray-900">
                        {product.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {product.sales} sales
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-gray-200 text-gray-700"
                  >
                    {product.sales}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Revenue Chart */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Monthly Revenue</CardTitle>
          <CardDescription>
            Revenue trends over the last 6 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between space-x-2">
            {analytics.monthlyRevenue.map((month, index) => {
              const maxRevenue = Math.max(
                ...analytics.monthlyRevenue.map((m) => m.revenue)
              );
              const height = (month.revenue / maxRevenue) * 100;

              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center space-y-2"
                >
                  <div className="text-xs text-gray-500">
                    ${month.revenue.toLocaleString()}
                  </div>
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t transition-all duration-300 hover:from-blue-600 hover:to-blue-400"
                    style={{ height: `${height}%` }}
                  />
                  <div className="text-xs text-gray-500">{month.month}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
