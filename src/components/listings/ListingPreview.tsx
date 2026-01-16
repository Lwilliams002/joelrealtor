import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatListingStatus, formatPropertyType, getStatusColor } from '@/lib/formatters';
import { Bed, Bath, Square, MapPin, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ListingPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: {
    title: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    price: number;
    beds?: number;
    baths?: number;
    sqft?: number;
    property_type: string;
    status: string;
    description?: string;
    features_json?: string[];
    cover_image_url?: string;
  };
  images?: string[];
}

export function ListingPreview({ open, onOpenChange, listing, images = [] }: ListingPreviewProps) {
  const displayImage = listing.cover_image_url || images[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Preview: {listing.title}</DialogTitle>
        </DialogHeader>
        
        {/* Hero Image */}
        <div className="relative h-64 md:h-80">
          <img 
            src={displayImage} 
            alt={listing.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <Badge className={cn("rounded-none px-4 py-1.5 mb-3 uppercase tracking-wider text-xs", getStatusColor(listing.status as any))}>
              {formatListingStatus(listing.status as any)}
            </Badge>
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-white mb-2">
              {listing.title || 'Untitled Listing'}
            </h2>
            <div className="flex items-center gap-2 text-white/80 mb-3">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">
                {listing.address || 'No address'}, {listing.city || 'City'}, {listing.state || 'State'} {listing.zip || ''}
              </span>
            </div>
            <div className="inline-flex items-center bg-white px-4 py-2">
              <span className="font-display text-xl md:text-2xl font-semibold text-foreground">
                {formatPrice(listing.price || 0)}
              </span>
              {listing.status === 'for_rent' && (
                <span className="text-muted-foreground ml-2 text-sm">/month</span>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-3">
            {listing.beds && (
              <div className="p-3 bg-secondary text-center">
                <Bed className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="font-display font-semibold">{listing.beds}</p>
                <p className="text-xs text-muted-foreground uppercase">Beds</p>
              </div>
            )}
            {listing.baths && (
              <div className="p-3 bg-secondary text-center">
                <Bath className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="font-display font-semibold">{listing.baths}</p>
                <p className="text-xs text-muted-foreground uppercase">Baths</p>
              </div>
            )}
            {listing.sqft && (
              <div className="p-3 bg-secondary text-center">
                <Square className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="font-display font-semibold">{listing.sqft.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground uppercase">Sq Ft</p>
              </div>
            )}
            {listing.property_type && (
              <div className="p-3 bg-secondary text-center">
                <Calendar className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="font-display font-semibold text-sm">{formatPropertyType(listing.property_type as any)}</p>
                <p className="text-xs text-muted-foreground uppercase">Type</p>
              </div>
            )}
          </div>

          {/* Description */}
          {listing.description && (
            <div>
              <h3 className="font-display text-lg font-semibold mb-2">About This Property</h3>
              <p className="text-muted-foreground leading-relaxed">{listing.description}</p>
            </div>
          )}

          {/* Features */}
          {listing.features_json && listing.features_json.length > 0 && (
            <div>
              <h3 className="font-display text-lg font-semibold mb-2">Features & Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {listing.features_json.map((feature, i) => (
                  <span key={i} className="px-3 py-1.5 bg-primary/10 text-primary text-sm rounded-full">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Image Gallery Preview */}
          {images.length > 1 && (
            <div>
              <h3 className="font-display text-lg font-semibold mb-2">Gallery ({images.length} photos)</h3>
              <div className="grid grid-cols-4 gap-2">
                {images.slice(0, 4).map((img, i) => (
                  <img 
                    key={i} 
                    src={img} 
                    alt={`Photo ${i + 1}`} 
                    className="w-full aspect-square object-cover rounded"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
