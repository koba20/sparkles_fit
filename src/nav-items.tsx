import { HomeIcon, ShoppingBag, Package, Settings } from "lucide-react";
import Index from "./pages/Index.tsx";
import ProductDetail from "./pages/ProductDetail.tsx";
import Products from "./pages/Products.tsx";
import Admin from "./pages/Admin.tsx";

export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Products",
    to: "/products",
    icon: <ShoppingBag className="h-4 w-4" />,
    page: <Products />,
  },
  {
    title: "Product Detail",
    to: "/product/:id",
    icon: <Package className="h-4 w-4" />,
    page: <ProductDetail />,
  },
  {
    title: "Admin",
    to: "/admin",
    icon: <Settings className="h-4 w-4" />,
    page: <Admin />,
  },
];