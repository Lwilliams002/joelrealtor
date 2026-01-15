import { useState } from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { ListingCard } from '@/components/listings/ListingCard';
import { ListingFiltersComponent, ListingFilters } from '@/components/listings/ListingFilters';
import { usePublicListings } from '@/hooks/useListings';
import { Building2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Listings() {
  const [filters, setFilters] = useState<ListingFilters>({});
  const { data: listings, isLoading } = usePublicListings(filters);

  return (
    <PublicLayout>
      {/* Header */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh" />
        <div className="blob blob-1 -top-40 right-0 opacity-30" />
        
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full mb-4">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Property Collection</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Browse <span className="text-gradient">Properties</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl">
              Discover your perfect home from our curated collection of exceptional properties.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters & Listings */}
      <section className="py-12">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <ListingFiltersComponent filters={filters} onFiltersChange={setFilters} />
          </motion.div>

          <div className="mt-8">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-muted aspect-[4/3] rounded-3xl" />
                    <div className="mt-4 h-6 bg-muted rounded-xl w-3/4" />
                    <div className="mt-2 h-4 bg-muted rounded-lg w-1/2" />
                  </div>
                ))}
              </div>
            ) : listings && listings.length > 0 ? (
              <>
                <p className="text-muted-foreground mb-6">
                  <span className="font-semibold text-foreground">{listings.length}</span> {listings.length === 1 ? 'property' : 'properties'} found
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((listing, index) => (
                    <ListingCard key={listing.id} listing={listing} index={index} />
                  ))}
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20 bg-secondary/30 rounded-3xl"
              >
                <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <Building2 className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="font-display text-xl font-bold mb-2">No properties found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search criteria.</p>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
