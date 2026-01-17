import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ListingFiltersComponent, ListingFilters } from '@/components/listings/ListingFilters';
import { ListingsMap } from '@/components/listings/ListingsMap';
import { ListingCardCompact } from '@/components/listings/ListingCardCompact';
import { usePublicListings } from '@/hooks/useListings';
import { Building2, LayoutGrid, LayoutList, Menu, X, Home, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Listings() {
  const [filters, setFilters] = useState<ListingFilters>({});
  const [hoveredListingId, setHoveredListingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: listings, isLoading } = usePublicListings(filters);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Minimal Header */}
      <header className="bg-background border-b border-border px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <Link to="/" className="font-display text-xl font-semibold text-foreground">
            Joel Aguirre Realty
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link to="/listings" className="text-foreground font-medium">Search Listings</Link>
            <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
          </nav>
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        
        {/* Mobile Navigation Menu */}
        <div className={cn(
          "md:hidden overflow-hidden transition-all duration-300",
          isMobileMenuOpen ? "max-h-48 opacity-100 mt-3" : "max-h-0 opacity-0"
        )}>
          <nav className="flex flex-col gap-1 py-2 border-t border-border">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
            <Link
              to="/listings"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-foreground bg-muted/50 rounded-lg"
            >
              <Building2 className="h-4 w-4" />
              Search Listings
            </Link>
            <Link
              to="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
            >
              <Phone className="h-4 w-4" />
              Contact
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content - Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Map */}
        <div className="hidden lg:block w-1/2 xl:w-[55%] relative">
          <ListingsMap 
            listings={listings || []} 
            onListingHover={setHoveredListingId}
            hoveredListingId={hoveredListingId}
          />
        </div>

        {/* Right Side - Filters & Listings */}
        <div className="w-full lg:w-1/2 xl:w-[45%] flex flex-col bg-background border-l border-border">
          {/* Title & Filters */}
          <div className="p-4 border-b border-border flex-shrink-0">
            <h1 className="font-display text-2xl font-semibold text-foreground mb-4">
              Properties for Sale
            </h1>
            <ListingFiltersComponent filters={filters} onFiltersChange={setFilters} />
          </div>

          {/* Results Header */}
          <div className="px-4 py-3 border-b border-border flex items-center justify-between flex-shrink-0">
            {listings && (
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{listings.length}</span> of{' '}
                <span className="font-semibold text-foreground">{listings.length}</span> listings
                <span className="ml-2 text-primary cursor-pointer hover:underline">
                  Sort: {filters.sortBy === 'price_asc' ? 'Price ↑' : filters.sortBy === 'price_desc' ? 'Price ↓' : 'Newest'}
                </span>
              </p>
            )}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8", viewMode === 'list' && "bg-muted")}
                onClick={() => setViewMode('list')}
              >
                <LayoutList className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8", viewMode === 'grid' && "bg-muted")}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Listings Grid */}
          <ScrollArea className="flex-1">
            <div className="p-4">
              {isLoading ? (
                <div className={cn(
                  "gap-4",
                  viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2" : "space-y-4"
                )}>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-muted aspect-[16/10]" />
                      <div className="mt-3 h-5 bg-muted w-3/4" />
                      <div className="mt-2 h-4 bg-muted w-1/2" />
                    </div>
                  ))}
                </div>
              ) : listings && listings.length > 0 ? (
                <div className={cn(
                  "gap-4",
                  viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2" : "space-y-4"
                )}>
                  {listings.map((listing) => (
                    <motion.div
                      key={listing.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ListingCardCompact 
                        listing={listing} 
                        isHovered={hoveredListingId === listing.id}
                        onHover={setHoveredListingId}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="h-16 w-16 bg-muted flex items-center justify-center mx-auto mb-6 rounded-full">
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2">No properties found</h3>
                  <p className="text-muted-foreground">Try adjusting your filters or search criteria.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}