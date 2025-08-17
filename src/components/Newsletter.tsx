import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setEmail('');
      }, 3000);
    }
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Header */}
          <h2 className="text-section-title mb-6">
            Stay in the Loop
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Be the first to know about new collections, exclusive drops, and special events.
          </p>

          {/* Newsletter Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-b-2 border-muted pb-4 text-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors duration-300"
                required
              />
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 focus-within:w-full"></div>
            </div>

            <Button
              type="submit"
              className={`btn-blvck-ghost group transition-all duration-300 ${
                isSubmitted ? 'bg-primary text-primary-foreground' : ''
              }`}
              disabled={isSubmitted}
            >
              {isSubmitted ? (
                'Thank You!'
              ) : (
                <>
                  Subscribe
                  <ArrowRight 
                    size={16} 
                    className="ml-2 group-hover:translate-x-1 transition-transform duration-300" 
                  />
                </>
              )}
            </Button>
          </form>

          {/* Additional Info */}
          <p className="text-sm text-muted-foreground mt-6">
            By subscribing, you agree to our{' '}
            <a href="/privacy" className="underline hover:text-foreground transition-colors duration-300">
              Privacy Policy
            </a>
            {' '}and{' '}
            <a href="/terms" className="underline hover:text-foreground transition-colors duration-300">
              Terms of Service
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;