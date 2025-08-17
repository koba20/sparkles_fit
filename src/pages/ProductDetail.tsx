import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Minus,
  Plus,
  Heart,
  Star,
  Truck,
  RotateCcw,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProduct } from "@/hooks/useProducts";
import { useCartContext } from "@/contexts/CartContext";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getCategoryColor } from "@/lib/utils";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { product, loading, error } = useProduct(id || "");
  const { addToCart } = useCartContext();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Scroll to top when component mounts or product ID changes
  useScrollToTop([id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The product you're looking for doesn't exist.
            </p>
            {error && (
              <p className="text-sm text-red-500 mb-4">Error: {error}</p>
            )}
            <p className="text-sm text-muted-foreground">Product ID: {id}</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const handleAddToCart = () => {
    addToCart(
      product.id,
      quantity,
      selectedSize || undefined,
      selectedColor || undefined
    );
  };

  const handleViewCart = () => {
    navigate('/cart');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const images = product.gallery_urls || [product.image_url];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square overflow-hidden bg-card">
                <img
                  src={
                    images[selectedImage] ||
                    "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop"
                  }
                  alt={product.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square overflow-hidden bg-card border-2 transition-colors ${
                        selectedImage === index
                          ? "border-primary"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={
                          image ||
                          "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200&h=200&fit=crop"
                        }
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <Badge
                  variant="secondary"
                  className={`mb-2 ${getCategoryColor(
                    product.categories?.name || "BLVCK"
                  )}`}
                >
                  {product.categories?.name || "BLVCK"}
                </Badge>
                <h1 className="text-3xl md:text-4xl font-light tracking-wide mb-4">
                  {product.name}
                </h1>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-2xl font-medium">
                    {formatPrice(product.price)}
                  </span>
                  {product.compare_price &&
                    product.compare_price > product.price && (
                      <span className="text-lg text-muted-foreground line-through">
                        {formatPrice(product.compare_price)}
                      </span>
                    )}
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-current text-yellow-400"
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    (128 reviews)
                  </span>
                </div>
              </div>

              {product.description && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-3">Size</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <Button
                        key={size}
                        variant={selectedSize === size ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedSize(size)}
                        className="min-w-[3rem]"
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-3">Color</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <Button
                        key={color}
                        variant={
                          selectedColor === color ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setSelectedColor(color)}
                        className="capitalize"
                      >
                        {color}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-3">Quantity</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-border rounded">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="h-10 w-10 p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="px-4 py-2 text-center min-w-[4rem]">
                        {quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setQuantity(quantity + 1)}
                        className="h-10 w-10 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    className="flex-1 btn-blvck"
                    size="lg"
                    onClick={handleAddToCart}
                  >
                    Add to Cart - {formatPrice(product.price * quantity)}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-4"
                    onClick={handleViewCart}
                  >
                    View Cart
                  </Button>
                  <Button variant="outline" size="lg" className="px-4">
                    <Heart className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Product Features */}
              <div className="border-t border-border pt-6 space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Truck className="h-5 w-5 text-muted-foreground" />
                  <span>Free shipping on orders over $100</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <RotateCcw className="h-5 w-5 text-muted-foreground" />
                  <span>30-day return policy</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <span>2-year warranty included</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductDetail;
