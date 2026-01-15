import { useParams } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { ContactForm } from '@/components/forms/ContactForm';
import { useListingBySlug, useListingImages } from '@/hooks/useListings';
import { usePageViewTracking, useTracking } from '@/hooks/useTracking';
import { formatPrice, formatListingStatus, formatPropertyType, getStatusColor } from '@/lib/formatters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bed, Bath, Square, MapPin, Calendar, ExternalLink, Phone, Mail } from 'lucide-react';

export default function ListingDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: listing, isLoading } = useListingBySlug(slug || '');
  const { data: images } = useListingImages(listing?.id || '');
  const { trackOutboundClick } = useTracking();
  
  usePageViewTracking(listing?.id);

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-96 bg-muted rounded-lg" />
            <div className="h-8 bg-muted rounded w-1/2" />
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!listing) {
    return (
      <PublicLayout>
        <div className="container py-20 text-center">
          <h1 className="font-serif text-2xl font-bold">Listing not found</h1>
        </div>
      </PublicLayout>
    );
  }

  const allImages = images?.length ? images.map(i => i.image_url) : [listing.cover_image_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80'];

  return (
    <PublicLayout>
      {/* Hero Image */}
      <div className="relative h-[50vh] md:h-[60vh]">
        <img src={allImages[0]} alt={listing.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="container">
            <Badge className={getStatusColor(listing.status)}>{formatListingStatus(listing.status)}</Badge>
            <h1 className="font-serif text-3xl md:text-5xl font-bold text-white mt-3">{listing.title}</h1>
            <div className="flex items-center gap-2 text-white/80 mt-2">
              <MapPin className="h-4 w-4" />
              <span>{listing.address}, {listing.city}, {listing.state} {listing.zip}</span>
            </div>
            <p className="font-serif text-3xl md:text-4xl font-bold text-white mt-4">{formatPrice(listing.price)}</p>
          </div>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4 p-6 bg-card rounded-lg shadow-card">
              {listing.beds && <div className="text-center"><Bed className="h-6 w-6 mx-auto text-accent" /><p className="font-semibold mt-1">{listing.beds}</p><p className="text-xs text-muted-foreground">Beds</p></div>}
              {listing.baths && <div className="text-center"><Bath className="h-6 w-6 mx-auto text-accent" /><p className="font-semibold mt-1">{listing.baths}</p><p className="text-xs text-muted-foreground">Baths</p></div>}
              {listing.sqft && <div className="text-center"><Square className="h-6 w-6 mx-auto text-accent" /><p className="font-semibold mt-1">{listing.sqft.toLocaleString()}</p><p className="text-xs text-muted-foreground">Sq Ft</p></div>}
              <div className="text-center"><Calendar className="h-6 w-6 mx-auto text-accent" /><p className="font-semibold mt-1">{formatPropertyType(listing.property_type)}</p><p className="text-xs text-muted-foreground">Type</p></div>
            </div>

            {/* Description */}
            <Card>
              <CardHeader><CardTitle>Description</CardTitle></CardHeader>
              <CardContent><p className="text-muted-foreground leading-relaxed">{listing.description || 'No description available.'}</p></CardContent>
            </Card>

            {/* Zillow Link */}
            {listing.zillow_url && (
              <Button variant="outline" onClick={() => { trackOutboundClick(listing.id, listing.zillow_url!); window.open(listing.zillow_url!, '_blank'); }}>
                <ExternalLink className="h-4 w-4 mr-2" /> View on Zillow
              </Button>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Contact Agent</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button className="flex-1" variant="outline"><Phone className="h-4 w-4 mr-2" /> Call</Button>
                  <Button className="flex-1" variant="outline"><Mail className="h-4 w-4 mr-2" /> Email</Button>
                </div>
                <ContactForm listingId={listing.id} listingTitle={listing.title} type="showing" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
