import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Home, Building2, Phone, Menu, X, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function PublicHeader() {
  const { user } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/listings', label: 'Properties' },
    { href: '/contact', label: 'Contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
      isScrolled 
        ? "py-3 bg-white shadow-elegant" 
        : "py-5 bg-transparent"
    )}>
      <div className="container flex items-center justify-between">
        {/* Left Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.slice(0, 2).map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "text-sm font-medium uppercase tracking-luxury link-underline transition-colors duration-300",
                isScrolled
                  ? isActive(link.href) ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  : isActive(link.href) ? "text-white" : "text-white/80 hover:text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Center Logo */}
        <Link to="/" className="flex items-center gap-3 group absolute left-1/2 transform -translate-x-1/2">
          <div className="text-center">
            <span className={cn(
              "font-display text-2xl md:text-3xl font-semibold tracking-wide transition-colors duration-300",
              isScrolled ? "text-foreground" : "text-white"
            )}>
              PRESTIGE
            </span>
            <div className={cn(
              "text-[10px] uppercase tracking-luxury transition-colors duration-300",
              isScrolled ? "text-muted-foreground" : "text-white/70"
            )}>
              Real Estate
            </div>
          </div>
        </Link>

        {/* Right Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/contact"
            className={cn(
              "text-sm font-medium uppercase tracking-luxury link-underline transition-colors duration-300",
              isScrolled
                ? isActive('/contact') ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                : isActive('/contact') ? "text-white" : "text-white/80 hover:text-white"
            )}
          >
            Contact
          </Link>
          
          {user ? (
            <Link
              to="/admin"
              className={cn(
                "text-sm font-medium uppercase tracking-luxury transition-colors duration-300",
                isScrolled ? "text-foreground" : "text-white"
              )}
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/auth"
              className={cn(
                "text-sm font-medium uppercase tracking-luxury transition-colors duration-300",
                isScrolled ? "text-foreground" : "text-white"
              )}
            >
              Sign In
            </Link>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className={cn(
            "md:hidden p-2 transition-colors",
            isScrolled ? "text-foreground" : "text-white"
          )}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        "md:hidden absolute top-full left-0 right-0 bg-white shadow-elegant transition-all duration-300 overflow-hidden",
        isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      )}>
        <nav className="container py-6 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setIsMenuOpen(false)}
              className={cn(
                "px-4 py-3 text-sm font-medium uppercase tracking-luxury transition-all",
                isActive(link.href) 
                  ? "text-foreground bg-secondary" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 mt-2 border-t">
            {user ? (
              <Button asChild className="w-full btn-primary">
                <Link to="/admin" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
              </Button>
            ) : (
              <Button asChild className="w-full btn-primary">
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
              </Button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}