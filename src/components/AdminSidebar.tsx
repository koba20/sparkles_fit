import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const sidebarItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "Overview and analytics",
  },
  {
    id: "products",
    label: "Products",
    icon: Package,
    description: "Manage inventory",
  },
  {
    id: "orders",
    label: "Orders",
    icon: ShoppingCart,
    description: "Order management",
  },
  {
    id: "categories",
    label: "Categories",
    icon: FolderOpen,
    description: "Product categories",
  },
  {
    id: "customers",
    label: "Customers",
    icon: Users,
    description: "Customer management",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    description: "Sales and insights",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    description: "Store configuration",
  },
];

export const AdminSidebar = ({
  activeSection,
  onSectionChange,
}: AdminSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "bg-white border-r border-gray-200 transition-all duration-300 ease-in-out shadow-sm",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="font-semibold text-gray-900">
                Sparkle Fit Admin
              </span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-md hover:bg-gray-200 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={cn(
                  "w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 flex-shrink-0",
                    isActive ? "text-blue-600" : "text-gray-500"
                  )}
                />
                {!collapsed && (
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900">
                      {item.label}
                    </div>
                    <div
                      className={cn(
                        "text-xs",
                        isActive ? "text-blue-600" : "text-gray-600"
                      )}
                    >
                      {item.description}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500">BLVCK Studio Admin</div>
            <div className="text-xs text-gray-400">v1.0.0</div>
          </div>
        )}
      </div>
    </div>
  );
};
