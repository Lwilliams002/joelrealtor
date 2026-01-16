import { ReactNode, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Building2, LayoutDashboard, Home, Upload, BarChart3, 
  Settings, LogOut, Menu, X, User, Sparkles, MessageSquare, ExternalLink, Globe 
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/listings', label: 'Listings', icon: Home },
  { href: '/admin/contacts', label: 'Contacts', icon: MessageSquare },
  { href: '/admin/import', label: 'Import', icon: Upload },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isLoading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-mesh">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent"
        />
      </div>
    );
  }

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-card to-background border-r border-border/50">
      {/* Logo */}
      <div className="p-6 border-b border-border/50">
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="h-10 w-10 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow"
          >
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </motion.div>
          <div>
            <span className="font-display text-xl font-bold text-gradient">Prestige</span>
            <span className="block text-xs text-muted-foreground">Admin Portal</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-4 py-6">
        <nav className="space-y-1">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.href || 
              (item.href !== '/admin' && location.pathname.startsWith(item.href));
            
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-primary text-white shadow-md" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                  {isActive && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-white/80" />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* View Website Link */}
        <div className="mt-6 pt-4 border-t border-border/50">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-all"
          >
            <Globe className="h-5 w-5" />
            View Website
            <ExternalLink className="h-3 w-3 ml-auto" />
          </Link>
        </div>
      </ScrollArea>

      {/* User Section */}
      <div className="p-4 border-t border-border/50 bg-muted/30 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4 p-3 rounded-2xl bg-background/50">
          <div className="h-11 w-11 rounded-full bg-gradient-primary flex items-center justify-center shadow-md">
            <User className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.email}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className={cn(
                "h-2 w-2 rounded-full",
                isAdmin ? "bg-primary" : "bg-accent"
              )} />
              {isAdmin ? 'Admin' : 'Agent'}
            </p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start rounded-xl text-muted-foreground hover:text-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  // Get current page title for mobile header
  const getCurrentPageTitle = () => {
    const currentItem = navItems.find(item => 
      location.pathname === item.href || 
      (item.href !== '/admin' && location.pathname.startsWith(item.href))
    );
    return currentItem?.label || 'Admin';
  };

  return (
    <div className="min-h-screen bg-gradient-mesh">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-background/80 backdrop-blur-xl border-b border-border/50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-xl"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Building2 className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-medium text-sm">{getCurrentPageTitle()}</span>
          </div>
        </div>
        <Link 
          to="/" 
          target="_blank"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-xs font-medium hover:bg-accent transition-colors"
        >
          <Globe className="h-3.5 w-3.5" />
          View Site
        </Link>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside 
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="lg:hidden fixed top-16 bottom-0 left-0 z-50 w-72"
          >
            <Sidebar />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed top-0 left-0 bottom-0 w-72 z-40">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="lg:pl-72 pt-16 lg:pt-0 min-h-screen">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="p-6 lg:p-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
