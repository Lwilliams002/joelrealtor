import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-gold rounded-sm flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <span className="font-serif text-xl font-semibold">Prestige Realty</span>
            </Link>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
              Your trusted partner in finding the perfect property. Excellence in real estate since 2010.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/" className="hover:text-primary-foreground transition-colors">Home</Link></li>
              <li><Link to="/listings" className="hover:text-primary-foreground transition-colors">Properties</Link></li>
              <li><Link to="/contact" className="hover:text-primary-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Property Types */}
          <div>
            <h4 className="font-semibold mb-4">Property Types</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/listings?type=house" className="hover:text-primary-foreground transition-colors">Houses</Link></li>
              <li><Link to="/listings?type=condo" className="hover:text-primary-foreground transition-colors">Condos</Link></li>
              <li><Link to="/listings?type=townhouse" className="hover:text-primary-foreground transition-colors">Townhouses</Link></li>
              <li><Link to="/listings?type=land" className="hover:text-primary-foreground transition-colors">Land</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>(555) 123-4567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>hello@prestigerealty.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>123 Main Street<br />Suite 100, City, ST 12345</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-8 pt-8 text-center text-sm text-primary-foreground/50">
          <p>&copy; {new Date().getFullYear()} Prestige Realty. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
