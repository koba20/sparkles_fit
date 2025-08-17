import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Mail, MapPin, Phone } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-16 mt-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-light tracking-wider mb-8 text-center">ABOUT US</h1>
          
          <div className="mb-12">
           
            <LazyLoadImage
            src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
              alt="XIVTTW Team" 
              className="w-full h-[400px] object-cover mb-8" />
            
            <h2 className="text-2xl font-light mb-4">Our Story</h2>
            <p className="text-muted-foreground mb-6">
              Founded in 2018, XIVTTW began as a small passion project with a simple mission: to create minimalist, high-quality clothing that stands the test of time. Our founder, inspired by the clean aesthetics of modern architecture and the timeless appeal of monochromatic palettes, set out to build a brand that embodies sophistication through simplicity.
            </p>
            
            <p className="text-muted-foreground mb-6">
              What started as a collection of essential pieces has evolved into a comprehensive lifestyle brand, offering everything from ready-to-wear collections to accessories and home goods. Despite our growth, we remain committed to our founding principles: exceptional craftsmanship, sustainable practices, and designs that transcend trends.
            </p>
            
            <h2 className="text-2xl font-light mb-4 mt-8">Our Philosophy</h2>
            <p className="text-muted-foreground mb-6">
              At XIVTTW, we believe that true luxury lies in the quality of materials, the precision of craftsmanship, and the thoughtfulness of design. We create pieces that are meant to be worn and cherished for years, not seasons. Our designs are intentionally minimal, allowing the wearer's personality to shine through.
            </p>
            
            <p className="text-muted-foreground mb-6">
              Sustainability is at the core of everything we do. We carefully select our materials, prioritizing organic and recycled fabrics. Our production processes are designed to minimize waste and reduce our environmental footprint. We work exclusively with factories that uphold fair labor practices and provide safe working conditions.
            </p>
            
            <h2 className="text-2xl font-light mb-4 mt-8">Our Team</h2>
            <p className="text-muted-foreground mb-6">
              Our team is a diverse group of creatives, strategists, and craftspeople united by a shared passion for design and quality. Based in our studio in Paris, we collaborate with artisans and manufacturers around the world who share our commitment to excellence.
            </p>
            
            <p className="text-muted-foreground">
              We're proud of what we've built, but we're even more excited about what's to come. Thank you for being part of our journey.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;