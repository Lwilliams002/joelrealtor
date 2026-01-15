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
        <div className="relative bg-card rounded-3xl overflow-hidden shadow-card hover-lift">
          {/* Image Container */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={listing.cover_image_url || defaultImage}
              alt={listing.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
            
            {/* Like Button */}
            <button
              onClick={(e) => { e.preventDefault(); setIsLiked(!isLiked); }}
              className={cn(
                "absolute top-4 right-4 h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 z-10",
                isLiked 
                  ? "bg-primary text-white scale-110" 
                  : "bg-white/90 text-muted-foreground hover:bg-white hover:text-primary hover:scale-110"
              )}
            >
              <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
            </button>
            
            {/* Status Badge */}
            <Badge className={cn(
              "absolute top-4 left-4 rounded-full px-4 py-1.5 font-medium shadow-lg",
              getStatusColor(listing.status)
            )}>
              {formatListingStatus(listing.status)}
            </Badge>

            {/* Price Tag */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg">
                <span className="font-display text-xl font-bold text-foreground">
                  {formatPrice(listing.price)}
                </span>
                {listing.status === 'for_rent' && (
                  <span className="text-sm text-muted-foreground">/month</span>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 space-y-4">
            <div>
              <h3 className="font-display text-lg font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {listing.title}
              </h3>
              <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-1.5">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="line-clamp-1">{listing.city}, {listing.state}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-1 pt-4 border-t border-border/50">
              {listing.beds && (
                <div className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-secondary/50">
                  <Bed className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{listing.beds}</span>
                </div>
              )}
              {listing.baths && (
                <div className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-secondary/50">
                  <Bath className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium">{listing.baths}</span>
                </div>
              )}
              {listing.sqft && (
                <div className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-secondary/50">
                  <Square className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{listing.sqft.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
