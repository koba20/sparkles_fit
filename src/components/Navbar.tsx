import { useState } from "react";
import { Menu, Search, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Cart } from "@/components/Cart";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navItems = [
    { name: "PRODUCTS", href: "/products" },
    { name: "MEN", href: "/men" },
    { name: "WOMEN", href: "/women" },
    { name: "ADMIN", href: "/admin" },
    { name: "OUTLET", href: "/outlet" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Mobile Menu & Search */}
          <div className="flex items-center gap-4 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-foreground hover:text-muted-foreground"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-foreground hover:text-muted-foreground"
            >
              <Search size={20} />
            </Button>
          </div>

          {/* Logo */}
          <div className="flex-1 md:flex-none flex justify-center md:justify-start">
            <Link
              to="/"
              className="text-2xl font-light tracking-[0.3em] text-foreground"
            >
              Sparkles Fit
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link key={item.name} to={item.href} className="nav-link">
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Desktop Search */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex text-foreground hover:text-muted-foreground"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search size={20} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="text-foreground hover:text-muted-foreground"
            >
              <User size={20} />
            </Button>

            <Cart />
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="py-4 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block nav-link text-center py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="absolute top-full left-0 right-0 bg-background border-b border-border p-4">
            <div className="container mx-auto">
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  placeholder="Search..."
                  className="flex-1 bg-transparent border-b border-foreground pb-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(false)}
                  className="text-foreground hover:text-muted-foreground"
                >
                  <X size={20} />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
