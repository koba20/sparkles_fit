import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Search, Filter, Eye, Star } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getCategoryColor } from "@/lib/utils";

export const ProductsManagement = () => {
  const {
    products,
    loading: productsLoading,
    refetch: refetchProducts,
  } = useProducts();
  const { categories } = useCategories();
  const { toast } = useToast();
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    compare_price: "",
    category_id: "",
    image_url: "",
    gallery_urls: "",
    colors: "",
    sizes: "",
    stock_quantity: "",
    featured: false,
    status: "active",
  });

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || product.category_id === categoryFilter;
    const matchesStatus =
      statusFilter === "all" || product.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const resetForm = () => {
    setProductForm({
      name: "",
      description: "",
      price: "",
      compare_price: "",
      category_id: "",
      image_url: "",
      gallery_urls: "",
      colors: "",
      sizes: "",
      stock_quantity: "",
      featured: false,
      status: "active",
    });
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase.from("products").insert({
        name: productForm.name,
        slug: productForm.name.toLowerCase().replace(/\s+/g, "-"),
        description: productForm.description || null,
        price: parseFloat(productForm.price),
        compare_price: productForm.compare_price
          ? parseFloat(productForm.compare_price)
          : null,
        category_id: productForm.category_id || null,
        image_url: productForm.image_url || null,
        gallery_urls: productForm.gallery_urls
          ? productForm.gallery_urls.split(",").map((url) => url.trim())
          : null,
        colors: productForm.colors
          ? productForm.colors.split(",").map((c) => c.trim())
          : null,
        sizes: productForm.sizes
          ? productForm.sizes.split(",").map((s) => s.trim())
          : null,
        stock_quantity: parseInt(productForm.stock_quantity) || 0,
        featured: productForm.featured,
        status: productForm.status,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product added successfully!",
      });

      resetForm();
      setIsAddProductOpen(false);
      refetchProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product.",
        variant: "destructive",
      });
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      compare_price: product.compare_price?.toString() || "",
      category_id: product.category_id || "",
      image_url: product.image_url || "",
      gallery_urls: product.gallery_urls ? product.gallery_urls.join(", ") : "",
      colors: product.colors ? product.colors.join(", ") : "",
      sizes: product.sizes ? product.sizes.join(", ") : "",
      stock_quantity: product.stock_quantity?.toString() || "0",
      featured: product.featured || false,
      status: product.status || "active",
    });
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from("products")
        .update({
          name: productForm.name,
          slug: productForm.name.toLowerCase().replace(/\s+/g, "-"),
          description: productForm.description || null,
          price: parseFloat(productForm.price),
          compare_price: productForm.compare_price
            ? parseFloat(productForm.compare_price)
            : null,
          category_id: productForm.category_id || null,
          image_url: productForm.image_url || null,
          gallery_urls: productForm.gallery_urls
            ? productForm.gallery_urls.split(",").map((url) => url.trim())
            : null,
          colors: productForm.colors
            ? productForm.colors.split(",").map((c) => c.trim())
            : null,
          sizes: productForm.sizes
            ? productForm.sizes.split(",").map((s) => s.trim())
            : null,
          stock_quantity: parseInt(productForm.stock_quantity) || 0,
          featured: productForm.featured,
          status: productForm.status,
        })
        .eq("id", editingProduct.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product updated successfully!",
      });

      resetForm();
      setEditingProduct(null);
      refetchProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully!",
      });

      refetchProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product.",
        variant: "destructive",
      });
    }
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0)
      return { color: "bg-red-100 text-red-800", text: "Out of Stock" };
    if (quantity < 10)
      return { color: "bg-yellow-100 text-yellow-800", text: "Low Stock" };
    return { color: "bg-green-100 text-green-800", text: "In Stock" };
  };

  if (productsLoading) {
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
            Products Management
          </h2>
          <p className="text-gray-600">
            Manage your product inventory and details
          </p>
        </div>
        <Button
          onClick={() => setIsAddProductOpen(true)}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
            <Button
              variant="outline"
              className="border-gray-300 hover:bg-gray-50 text-gray-700"
            >
              <Filter className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">
            Products ({filteredProducts.length})
          </CardTitle>
          <CardDescription className="text-gray-600">
            Manage your product inventory and details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-3 font-medium text-gray-700">
                    Image
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700">
                    Name
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700">
                    Category
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700">
                    Price
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700">
                    Stock
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700">
                    Status
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700">
                    Featured
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(
                    product.stock_quantity || 0
                  );
                  return (
                    <tr
                      key={product.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="p-3">
                        <img
                          src={
                            product.image_url ||
                            "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=100&h=100&fit=crop"
                          }
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded border border-gray-200"
                          loading="lazy"
                        />
                      </td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.slug}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge
                          variant="secondary"
                          className={`${getCategoryColor(
                            product.categories?.name || "Uncategorized"
                          )}`}
                        >
                          {product.categories?.name || "Uncategorized"}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium text-gray-900">
                            ${product.price}
                          </div>
                          {product.compare_price && (
                            <div className="text-sm text-gray-500 line-through">
                              ${product.compare_price}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">
                            {product.stock_quantity || 0}
                          </span>
                          <Badge className={stockStatus.color}>
                            {stockStatus.text}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={
                            product.status === "active"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            product.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-700"
                          }
                        >
                          {product.status || "active"}
                        </Badge>
                      </td>
                      <td className="p-3">
                        {product.featured ? (
                          <Star className="h-5 w-5 text-yellow-500 fill-current" />
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditProduct(product)}
                            className="border-gray-300 hover:bg-gray-50 text-gray-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Product Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-200 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Add New Product
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddProductOpen(false)}
                className="border-gray-300 hover:bg-gray-50 text-gray-700"
              >
                ×
              </Button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-gray-700 font-medium">
                    Product Name
                  </Label>
                  <Input
                    id="name"
                    value={productForm.name}
                    onChange={(e) =>
                      setProductForm({ ...productForm, name: e.target.value })
                    }
                    required
                    className="bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="price" className="text-gray-700 font-medium">
                    Price
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) =>
                      setProductForm({ ...productForm, price: e.target.value })
                    }
                    required
                    className="bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="compare_price"
                    className="text-gray-700 font-medium"
                  >
                    Compare Price
                  </Label>
                  <Input
                    id="compare_price"
                    type="number"
                    step="0.01"
                    value={productForm.compare_price}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        compare_price: e.target.value,
                      })
                    }
                    className="bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="category"
                    className="text-gray-700 font-medium"
                  >
                    Category
                  </Label>
                  <select
                    id="category"
                    className="w-full p-2 bg-gray-50 border border-gray-300 text-gray-900 rounded focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={productForm.category_id}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        category_id: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label
                  htmlFor="description"
                  className="text-gray-700 font-medium"
                >
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      description: e.target.value,
                    })
                  }
                  className="bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="image" className="text-gray-700 font-medium">
                    Image URL
                  </Label>
                  <Input
                    id="image"
                    value={productForm.image_url}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        image_url: e.target.value,
                      })
                    }
                    className="bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="gallery"
                    className="text-gray-700 font-medium"
                  >
                    Gallery URLs (comma separated)
                  </Label>
                  <Input
                    id="gallery"
                    placeholder="url1, url2, url3"
                    value={productForm.gallery_urls}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        gallery_urls: e.target.value,
                      })
                    }
                    className="bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="colors" className="text-gray-700 font-medium">
                    Colors (comma separated)
                  </Label>
                  <Input
                    id="colors"
                    placeholder="black, white, gray"
                    value={productForm.colors}
                    onChange={(e) =>
                      setProductForm({ ...productForm, colors: e.target.value })
                    }
                    className="bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="sizes" className="text-gray-700 font-medium">
                    Sizes (comma separated)
                  </Label>
                  <Input
                    id="sizes"
                    placeholder="S, M, L, XL"
                    value={productForm.sizes}
                    onChange={(e) =>
                      setProductForm({ ...productForm, sizes: e.target.value })
                    }
                    className="bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stock" className="text-gray-700 font-medium">
                    Stock Quantity
                  </Label>
                  <Input
                    id="stock"
                    type="number"
                    value={productForm.stock_quantity}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        stock_quantity: e.target.value,
                      })
                    }
                    className="bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="status" className="text-gray-700 font-medium">
                    Status
                  </Label>
                  <select
                    id="status"
                    className="w-full p-2 bg-gray-50 border border-gray-300 text-gray-900 rounded focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={productForm.status}
                    onChange={(e) =>
                      setProductForm({ ...productForm, status: e.target.value })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={productForm.featured}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      featured: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 focus:ring-blue-500"
                />
                <Label htmlFor="featured" className="text-gray-700 font-medium">
                  Featured Product
                </Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddProductOpen(false)}
                  className="border-gray-300 hover:bg-gray-50 text-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Add Product
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-200 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Edit Product
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingProduct(null)}
                className="border-gray-300 hover:bg-gray-50 text-gray-700"
              >
                ×
              </Button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-4">
              {/* Same form fields as add product */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="edit-name"
                    className="text-gray-700 font-medium"
                  >
                    Product Name
                  </Label>
                  <Input
                    id="edit-name"
                    value={productForm.name}
                    onChange={(e) =>
                      setProductForm({ ...productForm, name: e.target.value })
                    }
                    required
                    className="bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="edit-price"
                    className="text-gray-700 font-medium"
                  >
                    Price
                  </Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) =>
                      setProductForm({ ...productForm, price: e.target.value })
                    }
                    required
                    className="bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="edit-compare_price"
                    className="text-gray-700 font-medium"
                  >
                    Compare Price
                  </Label>
                  <Input
                    id="edit-compare_price"
                    type="number"
                    step="0.01"
                    value={productForm.compare_price}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        compare_price: e.target.value,
                      })
                    }
                    className="bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="edit-category"
                    className="text-gray-700 font-medium"
                  >
                    Category
                  </Label>
                  <select
                    id="edit-category"
                    className="w-full p-2 bg-gray-50 border border-gray-300 text-gray-900 rounded focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={productForm.category_id}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        category_id: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label
                  htmlFor="edit-description"
                  className="text-gray-700 font-medium"
                >
                  Description
                </Label>
                <Textarea
                  id="edit-description"
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      description: e.target.value,
                    })
                  }
                  className="bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="edit-image"
                    className="text-gray-700 font-medium"
                  >
                    Image URL
                  </Label>
                  <Input
                    id="edit-image"
                    value={productForm.image_url}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        image_url: e.target.value,
                      })
                    }
                    className="bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="edit-gallery"
                    className="text-gray-700 font-medium"
                  >
                    Gallery URLs (comma separated)
                  </Label>
                  <Input
                    id="edit-gallery"
                    placeholder="url1, url2, url3"
                    value={productForm.gallery_urls}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        gallery_urls: e.target.value,
                      })
                    }
                    className="bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="edit-colors"
                    className="text-gray-700 font-medium"
                  >
                    Colors (comma separated)
                  </Label>
                  <Input
                    id="edit-colors"
                    placeholder="black, white, gray"
                    value={productForm.colors}
                    onChange={(e) =>
                      setProductForm({ ...productForm, colors: e.target.value })
                    }
                    className="bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="edit-sizes"
                    className="text-gray-700 font-medium"
                  >
                    Sizes (comma separated)
                  </Label>
                  <Input
                    id="edit-sizes"
                    placeholder="S, M, L, XL"
                    value={productForm.sizes}
                    onChange={(e) =>
                      setProductForm({ ...productForm, sizes: e.target.value })
                    }
                    className="bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="edit-stock"
                    className="text-gray-700 font-medium"
                  >
                    Stock Quantity
                  </Label>
                  <Input
                    id="edit-stock"
                    type="number"
                    value={productForm.stock_quantity}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        stock_quantity: e.target.value,
                      })
                    }
                    className="bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="edit-status"
                    className="text-gray-700 font-medium"
                  >
                    Status
                  </Label>
                  <select
                    id="edit-status"
                    className="w-full p-2 bg-gray-50 border border-gray-300 text-gray-900 rounded focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={productForm.status}
                    onChange={(e) =>
                      setProductForm({ ...productForm, status: e.target.value })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-featured"
                  checked={productForm.featured}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      featured: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 focus:ring-blue-500"
                />
                <Label
                  htmlFor="edit-featured"
                  className="text-gray-700 font-medium"
                >
                  Featured Product
                </Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingProduct(null)}
                  className="border-gray-300 hover:bg-gray-50 text-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Update Product
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
