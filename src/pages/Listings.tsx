import { useState } from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { ListingCard } from '@/components/listings/ListingCard';
import { ListingFiltersComponent, ListingFilters } from '@/components/listings/ListingFilters';
import { usePublicListings } from '@/hooks/useListings';
import { Building2, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Listings() {
  const [filters, setFilters] = useState<ListingFilters>({});
  const { data: listings, isLoading } = usePublicListings(filters);

  return (
    <PublicLayout>
      {/* Header */}
      <section className="relative pt-32 pb-16 bg-primary">
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-primary-foreground mb-4">
              Browse Properties
            </h1>
            <p className="text-primary-foreground/70 text-lg max-w-xl mx-auto">
              Discover your perfect home from our curated collection of exceptional properties.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters & Listings */}
      <section className="py-12 bg-background">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-muted aspect-[4/3]" />
                    <div className="mt-4 h-6 bg-muted w-3/4" />
                    <div className="mt-2 h-4 bg-muted w-1/2" />
                  </div>
                ))}
              </div>
            ) : listings && listings.length > 0 ? (
              <>
                <p className="text-muted-foreground mb-6">
                  <span className="font-semibold text-foreground">{listings.length}</span> {listings.length === 1 ? 'property' : 'properties'} found
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {listings.map((listing, index) => (
                    <ListingCard key={listing.id} listing={listing} index={index} />
                  ))}
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20 bg-secondary"
              >
                <div className="h-16 w-16 bg-muted flex items-center justify-center mx-auto mb-6">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">No properties found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search criteria.</p>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}