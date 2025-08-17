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
import {
  Plus,
  Edit,
  Trash2,
  FolderOpen,
  Image as ImageIcon,
} from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const CategoriesManagement = () => {
  const { categories, refetch: refetchCategories } = useCategories();
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    slug: "",
    description: "",
    image_url: "",
  });

  const resetForm = () => {
    setCategoryForm({
      name: "",
      slug: "",
      description: "",
      image_url: "",
    });
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase.from("categories").insert({
        name: categoryForm.name,
        slug:
          categoryForm.slug ||
          categoryForm.name.toLowerCase().replace(/\s+/g, "-"),
        description: categoryForm.description || null,
        image_url: categoryForm.image_url || null,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Category added successfully!",
      });

      resetForm();
      setIsAddOpen(false);
      refetchCategories();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add category.",
        variant: "destructive",
      });
    }
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      image_url: category.image_url || "",
    });
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from("categories")
        .update({
          name: categoryForm.name,
          slug:
            categoryForm.slug ||
            categoryForm.name.toLowerCase().replace(/\s+/g, "-"),
          description: categoryForm.description || null,
          image_url: categoryForm.image_url || null,
        })
        .eq("id", editingCategory.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Category updated successfully!",
      });

      resetForm();
      setEditingCategory(null);
      refetchCategories();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update category.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this category? This will also affect products in this category."
      )
    )
      return;

    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", categoryId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Category deleted successfully!",
      });

      refetchCategories();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Categories Management
          </h2>
          <p className="text-gray-600">
            Organize your products into categories
          </p>
        </div>
        <Button
          onClick={() => setIsAddOpen(true)}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card
            key={category.id}
            className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FolderOpen className="h-5 w-5 text-gray-600" />
                  <CardTitle className="text-lg text-gray-900">
                    {category.name}
                  </CardTitle>
                </div>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditCategory(category)}
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription className="text-gray-600">
                {category.description || "No description provided"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {category.image_url && (
                <div className="mb-4">
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}
              <div className="flex items-center justify-between">
                <Badge
                  variant="secondary"
                  className="bg-gray-100 text-gray-700"
                >
                  {category.slug}
                </Badge>
                <span className="text-sm text-gray-500">
                  {new Date(category.created_at).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Category Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 border border-gray-200 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Add New Category
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddOpen(false)}
                className="border-gray-300 hover:bg-gray-50"
              >
                ×
              </Button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-gray-700">
                  Category Name
                </Label>
                <Input
                  id="name"
                  value={categoryForm.name}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, name: e.target.value })
                  }
                  required
                  className="bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <Label htmlFor="slug" className="text-gray-700">
                  Slug (optional)
                </Label>
                <Input
                  id="slug"
                  placeholder="auto-generated from name"
                  value={categoryForm.slug}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, slug: e.target.value })
                  }
                  className="bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-700">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={categoryForm.description}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      description: e.target.value,
                    })
                  }
                  className="bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <Label htmlFor="image" className="text-gray-700">
                  Image URL
                </Label>
                <Input
                  id="image"
                  value={categoryForm.image_url}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      image_url: e.target.value,
                    })
                  }
                  className="bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddOpen(false)}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Add Category
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 border border-gray-200 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Edit Category
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingCategory(null)}
                className="border-gray-300 hover:bg-gray-50"
              >
                ×
              </Button>
            </div>

            <form onSubmit={handleUpdateCategory} className="space-y-4">
              <div>
                <Label htmlFor="edit-name" className="text-gray-700">
                  Category Name
                </Label>
                <Input
                  id="edit-name"
                  value={categoryForm.name}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, name: e.target.value })
                  }
                  required
                  className="bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <Label htmlFor="edit-slug" className="text-gray-700">
                  Slug
                </Label>
                <Input
                  id="edit-slug"
                  value={categoryForm.slug}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, slug: e.target.value })
                  }
                  className="bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <Label htmlFor="edit-description" className="text-gray-700">
                  Description
                </Label>
                <Textarea
                  id="edit-description"
                  value={categoryForm.description}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      description: e.target.value,
                    })
                  }
                  className="bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <Label htmlFor="edit-image" className="text-gray-700">
                  Image URL
                </Label>
                <Input
                  id="edit-image"
                  value={categoryForm.image_url}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      image_url: e.target.value,
                    })
                  }
                  className="bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingCategory(null)}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Update Category
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
