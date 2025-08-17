import { useState } from "react";
import { Plus, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import { useCartContext } from "@/contexts/CartContext";
import { Link } from "react-router-dom";
import { getCategoryColor } from "@/lib/utils";

const ProductGrid = () => {
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const { products, loading, error } = useProducts(true, 6);
  const { addToCart } = useCartContext();

  const handleQuickAdd = (productId: string) => {
    addToCart(productId, 1);
  };

  if (loading) {
    return (
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-destructive">Error loading products: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-section-title mb-4">Featured Products</h2>
          <div className="divider-luxury"></div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="group cursor-pointer"
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              <Link to={`/product/${product.id}`}>
                <div className="relative aspect-[3/4] overflow-hidden bg-card mb-4">
                  <img
                    src={
                      product.image_url ||
                      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop"
                    }
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
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
                      className="w-full btn-blvck group/btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleQuickAdd(product.id);
                      }}
                    >
                      <Plus
                        size={16}
                        className="mr-2 group-hover/btn:rotate-90 transition-transform duration-300"
                      />
                      Quick Add
                    </Button>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span
                      className={`text-xs px-3 py-1 tracking-wider uppercase ${getCategoryColor(
                        product.categories?.name || "Sparkles Fit"
                      )}`}
                    >
                      {product.categories?.name || "Sparkles Fit"}
                    </span>
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

        {/* View All Button */}
        <div className="text-center mt-16">
          <Link to="/products">
            <Button className="btn-blvck-ghost">View All Products</Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
