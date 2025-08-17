import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Filter,
  Grid,
  List,
  Heart,
  Plus,
  LucideMoveRight,
  ChevronRight,
  LucideChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useCartContext } from "@/contexts/CartContext";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import Navbar from "@/components/Navbar";
import { BreadcrumbLink } from "@/components/ui/breadcrumb";
import { getCategoryColor } from "@/lib/utils";

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  const { products, loading } = useProducts();
  const { categories } = useCategories();
  const { addToCart } = useCartContext();

  // Scroll to top when component mounts
  useScrollToTop();

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((p) => p.category_id === selectedCategory);

  const handleQuickAdd = (productId: string) => {
    addToCart(productId, 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-background">
      <Navbar />

      {/* Hero Section */}
      <div className="relative h-[60vh] bg-gradient-to-r from-black to-gray-900 flex items-center justify-center">
        <div className="absolute inset-0"></div>
        <div className="relative text-center text-white">
          <h1 className="text-6xl font-light tracking-[0.2em] font-bold mb-4">
            SHOP PRODUCTS
            
          </h1>
          <small className=" tracking-wider text-sm flex gap-1 items-center justify-center">
            {" "}
            <Link to="/" >
              Shop
            </Link>{" "}
            <LucideChevronRight size={10} />{" "}
            <span>
              {" "}
              {categories.map((category) => (
                
                <Button
                key={category.id}
                className={
                    selectedCategory === category.id
                      ? "bg-transparent border-none p-0 text-white hover:bg-[none]"
                      : "hidden"
                    }
                >
                  { category.name ?  category.name : "All"}
                </Button>
              ))}
            </span>{" "}
          </small>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Filters & Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex flex-wrap gap-4">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
              className="bg-black text-white hover:bg-gray-800"
            >
              ALL
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={
                  selectedCategory === category.id ? "default" : "outline"
                }
                onClick={() => setSelectedCategory(category.id)}
                className={`${
                  selectedCategory === category.id
                    ? getCategoryColor(category.name)
                    : "bg-transparent border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {category.name.toUpperCase()}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            >
              {viewMode === "grid" ? <List size={16} /> : <Grid size={16} />}
            </Button>
          </div>
        </div>

        {/* Product Grid */}
        <div
          className={`grid gap-8 ${
            viewMode === "grid"
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
              : "grid-cols-1 md:grid-cols-2 gap-6"
          }`}
        >
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group cursor-pointer"
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              <Link to={`/product/${product.id}`} className="block">
                <div className="relative aspect-[3/4] overflow-hidden bg-card mb-4">
                  <img
                    src={
                      product.image_url ||
                      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop"
                    }
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Quick Actions */}
                  <div
                    className={`absolute top-4 right-4 space-y-2 transform transition-all duration-300 ${
                      hoveredProduct === product.id
                        ? "translate-x-0 opacity-100"
                        : "translate-x-8 opacity-0"
                    }`}
                  >
                    <Button
                      size="icon"
                      variant="secondary"
                      className="bg-white/90 text-black hover:bg-white w-10 h-10"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <Heart size={16} />
                    </Button>
                  </div>

                  {/* Quick Add Button */}
                  <div
                    className={`absolute bottom-4 left-4 right-4 transform transition-all duration-300 ${
                      hoveredProduct === product.id
                        ? "translate-y-0 opacity-100"
                        : "translate-y-8 opacity-0"
                    }`}
                  >
                    <Button
                      className="w-full bg-black text-white hover:bg-gray-800"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleQuickAdd(product.id);
                      }}
                    >
                      <Plus size={16} className="mr-2" />
                      Quick Add
                    </Button>
                  </div>
                </div>
              </Link>

              {/* Product Info */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium tracking-wide text-foreground group-hover:text-muted-foreground transition-colors duration-300">
                  {product.name}
                </h3>
                <p className="text-muted-foreground">${product.price}</p>

                {/* Color Options */}
                {product.colors && (
                  <div className="flex space-x-2 pt-2">
                    {product.colors.map((color, index) => (
                      <div
                        key={index}
                        className={`w-4 h-4 rounded-full border border-border cursor-pointer hover:scale-110 transition-transform duration-200 ${
                          color === "black"
                            ? "bg-black"
                            : color === "white"
                            ? "bg-white"
                            : color === "gray"
                            ? "bg-gray-500"
                            : color === "navy"
                            ? "bg-blue-900"
                            : color === "beige"
                            ? "bg-amber-100"
                            : "bg-gray-400"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-xl text-muted-foreground">No products found</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
