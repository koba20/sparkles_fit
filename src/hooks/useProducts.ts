import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_price: number | null;
  category_id: string | null;
  image_url: string | null;
  gallery_urls: string[] | null;
  sizes: string[] | null;
  colors: string[] | null;
  stock_quantity: number | null;
  featured: boolean | null;
  status: string | null;
  created_at: string;
  updated_at: string;
  categories?: {
    id: string;
    name: string;
    slug: string;
  };
}

export const useProducts = (featured?: boolean, limit?: number) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("products")
        .select(
          `
          *,
          categories (
            id,
            name,
            slug
          )
        `
        )
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (featured) {
        query = query.eq("featured", true);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error: supabaseError } = await query;

      if (supabaseError) {
        throw supabaseError;
      }

      setProducts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [featured, limit]);

  return { products, loading, error, refetch: fetchProducts };
};

export const useProduct = (id: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        const { data, error: supabaseError } = await supabase
          .from("products")
          .select(
            `
            *,
            categories (
              id,
              name,
              slug
            )
          `
          )
          .eq("id", id)
          .eq("status", "active")
          .single();

        if (supabaseError) {
          throw supabaseError;
        }

        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Product not found");
      } finally {
        setLoading(false);
      }
    };

    if (id && id.trim() !== "") {
      fetchProduct();
    } else {
      setLoading(false);
      setError("Invalid product ID");
    }
  }, [id]);

  return { product, loading, error };
};
