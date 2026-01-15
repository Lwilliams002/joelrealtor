import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin, Instagram, Twitter, Facebook, ArrowUpRight } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-50" />
      
      <div className="relative bg-foreground/[0.97] text-background pt-20 pb-8">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
            <div className="lg:col-span-2 space-y-6">
              <Link to="/" className="inline-flex items-center gap-3">
                <div className="h-12 w-12 bg-gradient-primary rounded-2xl flex items-center justify-center">
                  <Building2 className="h-7 w-7 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-display text-2xl font-bold text-white">Prestige</span>
                  <span className="text-sm text-white/60">Real Estate</span>
                </div>
              </Link>
              <p className="text-white/60 leading-relaxed max-w-sm">
                Your trusted partner in finding the perfect property. We make home buying a delightful experience.
              </p>
              <div className="flex gap-3">
                {[Instagram, Twitter, Facebook].map((Icon, i) => (
                  <a 
                    key={i}
                    href="#" 
                    className="h-11 w-11 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-primary hover:scale-110 transition-all duration-300"
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-display font-bold text-white mb-6">Explore</h4>
              <ul className="space-y-4">
                {[
                  { to: '/', label: 'Home' },
                  { to: '/listings', label: 'Properties' },
                  { to: '/contact', label: 'Contact Us' },
                ].map((link) => (
                  <li key={link.to}>
                    <Link 
                      to={link.to} 
                      className="text-white/60 hover:text-white flex items-center gap-2 group transition-colors"
                    >
                      {link.label}
                      <ArrowUpRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-display font-bold text-white mb-6">Get in Touch</h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-white/60">
                  <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <span>(555) 123-4567</span>
                </li>
                <li className="flex items-center gap-3 text-white/60">
                  <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <span>hello@prestige.com</span>
                </li>
                <li className="flex items-start gap-3 text-white/60">
                  <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <span>123 Main Street<br />Suite 100, City</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-sm">
              &copy; {new Date().getFullYear()} Prestige Realty. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-white/40">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
