import { useState } from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { ListingCard } from '@/components/listings/ListingCard';
import { ListingFiltersComponent, ListingFilters } from '@/components/listings/ListingFilters';
import { usePublicListings } from '@/hooks/useListings';
import { Building2 } from 'lucide-react';

export default function Listings() {
  const [filters, setFilters] = useState<ListingFilters>({});
  const { data: listings, isLoading } = usePublicListings(filters);

  return (
    <PublicLayout>
      {/* Header */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Browse Properties</h1>
          <p className="text-primary-foreground/80 text-lg max-w-xl">
            Discover your perfect home from our curated collection of exceptional properties.
          </p>
        </div>
      </section>

      {/* Filters & Listings */}
      <section className="py-12">
        <div className="container">
          <ListingFiltersComponent filters={filters} onFiltersChange={setFilters} />

          <div className="mt-8">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-muted aspect-[4/3] rounded-lg" />
                    <div className="mt-4 h-6 bg-muted rounded w-3/4" />
                    <div className="mt-2 h-4 bg-muted rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : listings && listings.length > 0 ? (
              <>
                <p className="text-muted-foreground mb-6">
                  {listings.length} {listings.length === 1 ? 'property' : 'properties'} found
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((listing, index) => (
                    <ListingCard key={listing.id} listing={listing} index={index} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-20 bg-muted/30 rounded-lg">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-serif text-xl font-semibold mb-2">No properties found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search criteria.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
