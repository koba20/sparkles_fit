import { useState } from "react";
import { Filter, Grid, List, Heart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useCartContext } from "@/contexts/CartContext";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { getCategoryColor } from "@/lib/utils";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Women = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  const { products, loading } = useProducts();
  const { categories } = useCategories();
  const { addToCart } = useCartContext();

  // Scroll to top when component mounts
  useScrollToTop();

  // Filter products to only show women's products
  const womenCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes("women") ||
      cat.name.toLowerCase().includes("womens")
  );

  const womenCategoryIds = womenCategories.map((cat) => cat.id);

  const womenProducts = products.filter((product) =>
    womenCategoryIds.includes(product.category_id)
  );

  const filteredProducts =
    selectedCategory === "all"
      ? womenProducts
      : womenProducts.filter((p) => p.category_id === selectedCategory);

  const handleQuickAdd = (productId: string) => {
    addToCart(productId, 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 bg-gradient-to-br from-pink-50 to-pink-100">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-16 bg-gradient-to-br from-pink-50 to-pink-100">
        {/* Hero Section */}
        <div className="relative h-[60vh] bg-gradient-to-r from-pink-500 to-pink-600 flex items-center justify-center">
          <div className="absolute inset-0 bg-pink-700/20"></div>
          <div className="relative text-center text-white">
            <h1 className="text-6xl font-light tracking-[0.3em] mb-4">
              WOMEN'S
            </h1>
            <p className="text-xl tracking-wider">COLLECTION</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Filters & Controls */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex flex-wrap gap-4">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                onClick={() => setSelectedCategory("all")}
                className={`${
                  selectedCategory === "all"
                    ? "bg-pink-500 text-white hover:bg-pink-600"
                    : "bg-transparent border-pink-300 text-pink-700 hover:bg-pink-50"
                }`}
              >
                ALL
              </Button>
              {womenCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={
                    selectedCategory === category.id ? "default" : "outline"
                  }
                  onClick={() => setSelectedCategory(category.id)}
                  className={`${
                    selectedCategory === category.id
                      ? getCategoryColor(category.name)
                      : "bg-transparent border-pink-300 text-pink-700 hover:bg-pink-50"
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
                className="border-pink-300 text-pink-700 hover:bg-pink-50"
              >
                <Filter size={16} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setViewMode(viewMode === "grid" ? "list" : "grid")
                }
                className="border-pink-300 text-pink-700 hover:bg-pink-50"
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
                className="group cursor-pointer bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                <Link to={`/product/${product.id}`} className="block">
                  <div className="relative aspect-[3/4] overflow-hidden bg-card mb-4 rounded-t-lg">
                    <img
                      src={
                        product.image_url ||
                        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop"
                      }
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-pink-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

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
                        className="bg-white/90 text-pink-500 hover:bg-white w-10 h-10"
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
                        className="w-full bg-pink-500 text-white hover:bg-pink-600"
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

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span
                        className={`text-xs px-3 py-1 tracking-wider uppercase ${getCategoryColor(
                          product.categories?.name || "Women"
                        )}`}
                      >
                        {product.categories?.name || "Women"}
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Product Info */}
                <div className="p-4 space-y-2">
                  <h3 className="text-lg font-medium tracking-wide text-gray-900 group-hover:text-pink-600 transition-colors duration-300">
                    {product.name}
                  </h3>
                  <p className="text-pink-600 font-semibold">
                    ${product.price}
                  </p>

                  {/* Color Options */}
                  {product.colors && (
                    <div className="flex space-x-2 pt-2">
                      {product.colors.map((color, index) => (
                        <div
                          key={index}
                          className={`w-4 h-4 rounded-full border border-gray-300 cursor-pointer hover:scale-110 transition-transform duration-200 ${
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
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-600">
                Try adjusting your filters or browse our full collection.
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Women;
