import { Instagram, Facebook, Twitter, Youtube } from "lucide-react";

const Footer = () => {
  const footerSections = [
    {
      title: "Shop",
      links: [
        { name: "Men", href: "/men" },
        { name: "Women", href: "/women" },
        { name: "Accessories", href: "/accessories" },
        { name: "New Arrivals", href: "/new" },
        { name: "Sale", href: "/sale" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About", href: "/about" },
        { name: "Careers", href: "/careers" },
        { name: "Press", href: "/press" },
        { name: "Sustainability", href: "/sustainability" },
        { name: "Stores", href: "/stores" },
      ],
    },
    {
      title: "Support",
      links: [
        { name: "Contact Us", href: "/contact" },
        { name: "Size Guide", href: "/size-guide" },
        { name: "Shipping", href: "/shipping" },
        { name: "Returns", href: "/returns" },
        { name: "FAQ", href: "/faq" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
        { name: "Cookie Policy", href: "/cookies" },
        { name: "Accessibility", href: "/accessibility" },
      ],
    },
  ];

  const socialLinks = [
    { name: "Instagram", icon: Instagram, href: "https://instagram.com/blvck" },
    { name: "Facebook", icon: Facebook, href: "https://facebook.com/blvck" },
    { name: "Twitter", icon: Twitter, href: "https://twitter.com/blvck" },
    { name: "YouTube", icon: Youtube, href: "https://youtube.com/blvck" },
  ];

  return (
    <footer className="bg-secondary border-t border-border">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-1 space-y-6">
              <div>
                <h3 className="text-2xl font-light tracking-[0.3em] text-foreground mb-4">
                  Sparkles Fit
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Minimalist luxury fashion for the modern individual. Timeless
                  designs that transcend trends.
                </p>
              </div>

              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      className="text-muted-foreground hover:text-foreground transition-colors duration-300"
                      aria-label={social.name}
                    >
                      <IconComponent size={20} />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Footer Links */}
            {footerSections.map((section, index) => (
              <div key={index} className="space-y-4">
                <h4 className="text-sm font-medium tracking-wider uppercase text-foreground">
                  {section.title}
                </h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-border py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © 2025 Sparkles Fit. All rights reserved.
            </div>

            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <span>Made with precision in Paris</span>
              <div className="w-px h-4 bg-border"></div>
              <span>Worldwide shipping</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
