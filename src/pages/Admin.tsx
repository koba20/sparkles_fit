import { useState } from "react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { DashboardOverview } from "@/components/DashboardOverview";
import { ProductsManagement } from "@/components/ProductsManagement";
import { OrdersManagement } from "@/components/OrdersManagement";
import { CategoriesManagement } from "@/components/CategoriesManagement";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { SessionWarning } from "@/components/SessionWarning";

const Admin = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const { user, logout } = useAuth();

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardOverview />;
      case "products":
        return <ProductsManagement />;
      case "orders":
        return <OrdersManagement />;
      case "categories":
        return <CategoriesManagement />;
      case "customers":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Customers Management
              </h2>
              <p className="text-gray-600">
                Manage customer accounts and information
              </p>
            </div>
            <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
              <p className="text-gray-500">
                Customer management coming soon...
              </p>
            </div>
          </div>
        );
      case "analytics":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
              <p className="text-gray-600">Detailed analytics and insights</p>
            </div>
            <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
              <p className="text-gray-500">Advanced analytics coming soon...</p>
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
              <p className="text-gray-600">
                Store configuration and preferences
              </p>
            </div>
            <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
              <p className="text-gray-500">Settings panel coming soon...</p>
            </div>
          </div>
        );
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <SessionWarning />
        <div className="flex h-screen">
          {/* Sidebar */}
          <AdminSidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            {/* Top Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {activeSection === "dashboard" && "Dashboard"}
                    {activeSection === "products" && "Products"}
                    {activeSection === "orders" && "Orders"}
                    {activeSection === "categories" && "Categories"}
                    {activeSection === "customers" && "Customers"}
                    {activeSection === "analytics" && "Analytics"}
                    {activeSection === "settings" && "Settings"}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {activeSection === "dashboard" && "Overview and analytics"}
                    {activeSection === "products" &&
                      "Manage your product inventory"}
                    {activeSection === "orders" &&
                      "Track and manage customer orders"}
                    {activeSection === "categories" && "Organize your products"}
                    {activeSection === "customers" && "Customer management"}
                    {activeSection === "analytics" && "Sales and insights"}
                    {activeSection === "settings" && "Store configuration"}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
                      <User className="h-4 w-4 text-gray-600" />
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {user?.first_name || user?.email}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {user?.role}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={logout}
                      className="border-gray-300 hover:bg-gray-50 text-gray-700"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-gray-50">
              <div className="p-6">{renderSection()}</div>
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Admin;
