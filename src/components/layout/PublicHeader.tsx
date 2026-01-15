import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Home, Building2, Phone, Menu, X, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function PublicHeader() {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/listings', label: 'Properties', icon: Building2 },
    { href: '/contact', label: 'Contact', icon: Phone },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
      isScrolled 
        ? "py-3 glass shadow-soft" 
        : "py-5 bg-transparent"
    )}>
      <div className="container flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="h-11 w-11 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-300">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-accent rounded-full flex items-center justify-center">
              <Sparkles className="h-2.5 w-2.5 text-white" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-display text-xl font-bold tracking-tight">Prestige</span>
            <span className="text-xs text-muted-foreground -mt-0.5">Real Estate</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2 bg-secondary/50 rounded-full px-2 py-1.5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium transition-all duration-300",
                isActive(link.href) 
                  ? "bg-white text-foreground shadow-soft" 
                  : "text-muted-foreground hover:text-foreground hover:bg-white/50"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Button 
              asChild 
              className="bg-gradient-primary text-white rounded-full px-6 shadow-glow hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              <Link to="/admin">Dashboard</Link>
            </Button>
          ) : (
            <Button 
              asChild 
              className="bg-gradient-primary text-white rounded-full px-6 shadow-glow hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              <Link to="/auth">Agent Login</Link>
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2.5 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        "md:hidden absolute top-full left-0 right-0 glass shadow-float transition-all duration-300 overflow-hidden",
        isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      )}>
        <nav className="container py-6 flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setIsMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all",
                isActive(link.href) 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-secondary"
              )}
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </Link>
          ))}
          <div className="pt-4 mt-2 border-t">
            {user ? (
              <Button asChild className="w-full bg-gradient-primary text-white rounded-2xl">
                <Link to="/admin" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
              </Button>
            ) : (
              <Button asChild className="w-full bg-gradient-primary text-white rounded-2xl">
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>Agent Login</Link>
              </Button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
