import { ArrowRight, Loader2 } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { getCategoryColor } from "@/lib/utils";
import { Link } from "react-router-dom";

const Collections = () => {
  const { categories, loading, error } = useCategories();

  if (loading) {
    return (
      <section className="py-20 bg-background">
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
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-destructive">
              Error loading collections: {error}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-section-title mb-4">
            Explore the Maison's Collections
          </h2>
          <div className="divider-luxury"></div>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={`/products`}
              className="card-luxury group cursor-pointer"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={
                    category.image_url ||
                    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop"
                  }
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="image-overlay"></div>

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    {/* Category Badge */}
                    <div className="mb-2">
                      <span
                        className={`inline-block text-xs px-3 py-1 tracking-wider uppercase ${getCategoryColor(
                          category.name
                        )}`}
                      >
                        {category.name}
                      </span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-light tracking-wider mb-2 uppercase">
                      {category.name}
                    </h3>
                    <p className="text-sm opacity-90 mb-4">
                      {category.description || "Premium BLVCK collection"}
                    </p>
                    <div className="flex items-center group-hover:text-primary transition-colors duration-300">
                      <span className="text-sm tracking-wider uppercase mr-2">
                        Explore
                      </span>
                      <ArrowRight
                        size={16}
                        className="transform group-hover:translate-x-2 transition-transform duration-300"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Collections;
