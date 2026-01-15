import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bed, Bath, Square, MapPin } from 'lucide-react';
import { formatPrice, formatListingStatus, getStatusColor } from '@/lib/formatters';
import { Listing } from '@/hooks/useListings';
import { motion } from 'framer-motion';

interface ListingCardProps {
  listing: Listing;
  index?: number;
}

export function ListingCard({ listing, index = 0 }: ListingCardProps) {
  const defaultImage = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link to={`/listings/${listing.slug}`}>
        <Card className="group overflow-hidden shadow-card hover:shadow-elegant transition-all duration-300 h-full">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={listing.cover_image_url || defaultImage}
              alt={listing.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Status Badge */}
            <Badge className={`absolute top-3 left-3 ${getStatusColor(listing.status)}`}>
              {formatListingStatus(listing.status)}
            </Badge>

            {/* Price */}
            <div className="absolute bottom-3 left-3 right-3">
              <p className="font-serif text-2xl font-bold text-white drop-shadow-lg">
                {formatPrice(listing.price)}
              </p>
            </div>
          </div>

          {/* Content */}
          <CardContent className="p-4 space-y-3">
            <h3 className="font-serif text-lg font-semibold text-foreground line-clamp-1 group-hover:text-accent transition-colors">
              {listing.title}
            </h3>

            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{listing.city}, {listing.state}</span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 pt-2 border-t">
              {listing.beds && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Bed className="h-4 w-4" />
                  <span>{listing.beds} {listing.beds === 1 ? 'Bed' : 'Beds'}</span>
                </div>
              )}
              {listing.baths && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Bath className="h-4 w-4" />
                  <span>{listing.baths} {listing.baths === 1 ? 'Bath' : 'Baths'}</span>
                </div>
              )}
              {listing.sqft && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Square className="h-4 w-4" />
                  <span>{listing.sqft.toLocaleString()} sqft</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
