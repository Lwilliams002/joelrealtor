import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Facebook, Linkedin } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1 space-y-6">
            <Link to="/" className="block">
              <span className="font-display text-2xl font-semibold tracking-wide">PRESTIGE</span>
              <div className="text-[10px] uppercase tracking-luxury text-primary-foreground/60">
                Real Estate
              </div>
            </Link>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Your trusted partner in finding exceptional properties. We make your real estate dreams a reality.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-sans font-semibold text-sm uppercase tracking-luxury mb-6">Navigation</h4>
            <ul className="space-y-3">
              {[
                { to: '/', label: 'Home' },
                { to: '/listings', label: 'Properties' },
                { to: '/contact', label: 'Contact' },
              ].map((link) => (
                <li key={link.to}>
                  <Link 
                    to={link.to} 
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-sans font-semibold text-sm uppercase tracking-luxury mb-6">Contact</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-accent" />
                <span>(555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-accent" />
                <span>info@prestige.com</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <span>123 Main Street<br />Albuquerque, NM 87101</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-sans font-semibold text-sm uppercase tracking-luxury mb-6">Follow Us</h4>
            <div className="flex gap-3">
              {[
                { icon: Instagram, href: '#' },
                { icon: Facebook, href: '#' },
                { icon: Linkedin, href: '#' },
              ].map((social, i) => (
                <a 
                  key={i}
                  href={social.href} 
                  className="h-10 w-10 border border-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground hover:text-primary transition-all duration-300"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-primary-foreground/50 text-xs uppercase tracking-wide">
            &copy; {new Date().getFullYear()} Prestige Realty. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs uppercase tracking-wide text-primary-foreground/50">
            <a href="#" className="hover:text-primary-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary-foreground transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}