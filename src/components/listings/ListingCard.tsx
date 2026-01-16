import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Bed, Bath, Square, MapPin, Heart } from 'lucide-react';
import { formatPrice, formatListingStatus, getStatusColor } from '@/lib/formatters';
import { Listing } from '@/hooks/useListings';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ListingCardProps {
  listing: Listing;
  index?: number;
}

export function ListingCard({ listing, index = 0 }: ListingCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const defaultImage = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Link to={`/listings/${listing.slug}`} className="block group">
        <div className="bg-card overflow-hidden shadow-card hover-lift">
          {/* Image Container */}
          <div className="relative aspect-[4/3] overflow-hidden image-hover-overlay">
            <img
              src={listing.cover_image_url || defaultImage}
              alt={listing.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            {/* Like Button */}
            <button
              onClick={(e) => { e.preventDefault(); setIsLiked(!isLiked); }}
              className={cn(
                "absolute top-4 right-4 h-10 w-10 flex items-center justify-center transition-all duration-300 z-10",
                isLiked 
                  ? "bg-primary text-white" 
                  : "bg-white text-muted-foreground hover:bg-primary hover:text-white"
              )}
            >
              <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
            </button>
            
            {/* Status Badge */}
            <Badge className={cn(
              "absolute top-4 left-4 rounded-none px-3 py-1 font-sans text-xs uppercase tracking-wider",
              getStatusColor(listing.status)
            )}>
              {formatListingStatus(listing.status)}
            </Badge>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="font-display text-2xl font-semibold text-foreground">
                {formatPrice(listing.price)}
              </span>
              {listing.status === 'for_rent' && (
                <span className="text-sm text-muted-foreground">/month</span>
              )}
            </div>

            {/* Title & Location */}
            <div>
              <h3 className="font-sans font-medium text-foreground line-clamp-1 group-hover:text-accent transition-colors">
                {listing.title}
              </h3>
              <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-1">
                <MapPin className="h-3.5 w-3.5" />
                <span className="line-clamp-1">{listing.address}, {listing.city}, {listing.state}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 pt-4 border-t border-border text-sm text-muted-foreground">
              {listing.beds && (
                <div className="flex items-center gap-1.5">
                  <Bed className="h-4 w-4" />
                  <span>{listing.beds} {listing.beds === 1 ? 'Bed' : 'Beds'}</span>
                </div>
              )}
              {listing.baths && (
                <div className="flex items-center gap-1.5">
                  <Bath className="h-4 w-4" />
                  <span>{listing.baths} {listing.baths === 1 ? 'Bath' : 'Baths'}</span>
                </div>
              )}
              {listing.sqft && (
                <div className="flex items-center gap-1.5">
                  <Square className="h-4 w-4" />
                  <span>{listing.sqft.toLocaleString()} sqft</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}