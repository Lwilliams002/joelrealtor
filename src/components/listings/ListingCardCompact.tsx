import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Bed, Bath, Square, Heart } from 'lucide-react';
import { formatPrice, formatListingStatus, getStatusColor } from '@/lib/formatters';
import { Listing } from '@/hooks/useListings';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ListingCardCompactProps {
  listing: Listing;
  isHovered?: boolean;
  onHover?: (id: string | null) => void;
}

export function ListingCardCompact({ listing, isHovered, onHover }: ListingCardCompactProps) {
  const [isLiked, setIsLiked] = useState(false);
  const defaultImage = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80";

  return (
    <Link 
      to={`/listings/${listing.slug}`} 
      className="block group"
      onMouseEnter={() => onHover?.(listing.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <div className={cn(
        "bg-card overflow-hidden transition-all duration-300",
        isHovered && "ring-2 ring-primary shadow-lg"
      )}>
        {/* Image Container */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={listing.cover_image_url || defaultImage}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Like Button */}
          <button
            onClick={(e) => { e.preventDefault(); setIsLiked(!isLiked); }}
            className={cn(
              "absolute top-3 right-3 h-8 w-8 flex items-center justify-center rounded-full transition-all duration-300 z-10",
              isLiked 
                ? "bg-primary text-white" 
                : "bg-white/90 text-muted-foreground hover:bg-primary hover:text-white"
            )}
          >
            <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
          </button>

          {/* Open House Badge */}
          {listing.open_house_schedule && listing.open_house_schedule.length > 0 && (
            <Badge className="absolute top-3 left-3 bg-white text-foreground text-xs">
              Open House
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Price */}
          <p className="font-semibold text-xl text-foreground">
            {formatPrice(listing.price)}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
            {listing.beds && (
              <span>{listing.beds} Bed</span>
            )}
            {listing.baths && (
              <>
                <span className="text-border">|</span>
                <span>{listing.baths} Bath</span>
              </>
            )}
            {listing.sqft && (
              <>
                <span className="text-border">|</span>
                <span>{listing.sqft.toLocaleString()} Sqft</span>
              </>
            )}
          </div>

          {/* Address */}
          <p className="text-sm text-muted-foreground mt-2 line-clamp-1">
            {listing.address}, {listing.city}, {listing.state} {listing.zip}
          </p>
        </div>
      </div>
    </Link>
  );
}
