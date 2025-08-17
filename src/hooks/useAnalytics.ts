import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Analytics {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  recentOrders: number;
  lowStockProducts: number;
  monthlyRevenue: { month: string; revenue: number }[];
  topProducts: { name: string; sales: number }[];
  orderStatusCounts: { status: string; count: number }[];
}

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch products count
      const { count: productsCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      // Fetch categories count
      const { count: categoriesCount } = await supabase
        .from("categories")
        .select("*", { count: "exact", head: true });

      // Fetch low stock products (less than 10 items)
      const { data: lowStockProducts } = await supabase
        .from("products")
        .select("id")
        .lt("stock_quantity", 10);

      // Mock analytics data for now
      const mockAnalytics: Analytics = {
        totalRevenue: 12450.99,
        totalOrders: 156,
        totalProducts: productsCount || 0,
        totalCustomers: 89,
        recentOrders: 12,
        lowStockProducts: lowStockProducts?.length || 0,
        monthlyRevenue: [
          { month: "Jan", revenue: 2100 },
          { month: "Feb", revenue: 1800 },
          { month: "Mar", revenue: 2400 },
          { month: "Apr", revenue: 2800 },
          { month: "May", revenue: 3200 },
          { month: "Jun", revenue: 2900 },
        ],
        topProducts: [
          { name: "BLVCK Signature Hoodie", sales: 45 },
          { name: "Minimal Tee", sales: 38 },
          { name: "Black Sneakers", sales: 32 },
          { name: "BLVCK Cap", sales: 28 },
          { name: "Leather Wallet", sales: 25 },
        ],
        orderStatusCounts: [
          { status: "pending", count: 8 },
          { status: "processing", count: 12 },
          { status: "shipped", count: 25 },
          { status: "delivered", count: 111 },
          { status: "cancelled", count: 3 },
        ],
      };

      setAnalytics(mockAnalytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return { analytics, loading, error, refetch: fetchAnalytics };
};
