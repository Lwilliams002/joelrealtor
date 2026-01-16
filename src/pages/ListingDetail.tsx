import { useParams } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { ContactForm } from '@/components/forms/ContactForm';
import { useListingBySlug, useListingImages } from '@/hooks/useListings';
import { usePageViewTracking, useTracking } from '@/hooks/useTracking';
import { formatPrice, formatListingStatus, formatPropertyType, getStatusColor } from '@/lib/formatters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bed, Bath, Square, MapPin, Calendar, ExternalLink, Phone, Mail, Heart, Share2, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function ListingDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: listing, isLoading } = useListingBySlug(slug || '');
  const { data: images } = useListingImages(listing?.id || '');
  const { trackOutboundClick } = useTracking();
  const [isLiked, setIsLiked] = useState(false);
  
  usePageViewTracking(listing?.id);

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container py-32">
          <div className="animate-pulse space-y-6">
            <div className="h-[60vh] bg-muted" />
            <div className="h-8 bg-muted w-1/2" />
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!listing) {
    return (
      <PublicLayout>
        <div className="container py-32 text-center">
          <h1 className="font-display text-2xl font-semibold">Listing not found</h1>
          <Button asChild className="mt-4 btn-primary rounded-none">
            <Link to="/listings">Back to Listings</Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  const allImages = images?.length ? images.map(i => i.image_url) : [listing.cover_image_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80'];

  return (
    <PublicLayout>
      {/* Hero Image */}
      <section className="relative pt-20">
        <div className="relative h-[50vh] md:h-[65vh]">
          <img src={allImages[0]} alt={listing.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 hero-overlay" />
          
          {/* Back Button */}
          <Link 
            to="/listings"
            className="absolute top-6 left-6 h-12 w-12 bg-white flex items-center justify-center hover:bg-secondary transition-colors shadow-elegant"
          >
            <ChevronLeft className="h-6 w-6" />
          </Link>

          {/* Action Buttons */}
          <div className="absolute top-6 right-6 flex gap-3">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={cn(
                "h-12 w-12 flex items-center justify-center transition-all shadow-elegant",
                isLiked ? "bg-primary text-white" : "bg-white hover:bg-secondary"
              )}
            >
              <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
            </button>
            <button className="h-12 w-12 bg-white flex items-center justify-center hover:bg-secondary transition-colors shadow-elegant">
              <Share2 className="h-5 w-5" />
            </button>
          </div>
          
          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
            <div className="container">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Badge className={cn("rounded-none px-4 py-1.5 mb-4 uppercase tracking-wider text-xs", getStatusColor(listing.status))}>
                  {formatListingStatus(listing.status)}
                </Badge>
                <h1 className="font-display text-3xl md:text-5xl font-semibold text-white mb-3">{listing.title}</h1>
                <div className="flex items-center gap-2 text-white/80 mb-4">
                  <MapPin className="h-5 w-5" />
                  <span>{listing.address}, {listing.city}, {listing.state} {listing.zip}</span>
                </div>
                <div className="inline-flex items-center bg-white px-6 py-3 shadow-elegant">
                  <span className="font-display text-2xl md:text-3xl font-semibold text-foreground">
                    {formatPrice(listing.price)}
                  </span>
                  {listing.status === 'for_rent' && (
                    <span className="text-muted-foreground ml-2">/month</span>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { icon: Bed, label: 'Bedrooms', value: listing.beds },
                { icon: Bath, label: 'Bathrooms', value: listing.baths },
                { icon: Square, label: 'Sq Ft', value: listing.sqft?.toLocaleString() },
                { icon: Calendar, label: 'Type', value: formatPropertyType(listing.property_type) },
              ].map((stat) => stat.value && (
                <div key={stat.label} className="p-4 bg-secondary text-center">
                  <stat.icon className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="font-display text-lg font-semibold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle className="font-display text-xl">About This Property</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {listing.description || 'No description available for this property. Contact us for more details.'}
                </p>
              </CardContent>
            </Card>

            {/* Features */}
            {listing.features_json && (listing.features_json as string[]).length > 0 && (
              <Card className="border-0 shadow-card">
                <CardHeader>
                  <CardTitle className="font-display text-xl">Features & Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {(listing.features_json as string[]).map((feature, i) => (
                      <span key={i} className="px-4 py-2 bg-secondary text-sm text-center">
                        {feature}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Zillow Link */}
            {listing.zillow_url && (
              <Button 
                variant="outline" 
                className="rounded-none border-primary text-primary hover:bg-primary hover:text-white"
                onClick={() => { trackOutboundClick(listing.id, listing.zillow_url!); window.open(listing.zillow_url!, '_blank'); }}
              >
                <ExternalLink className="h-4 w-4 mr-2" /> View on Zillow
              </Button>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <Card className="border-0 shadow-card sticky top-24">
              <CardHeader>
                <CardTitle className="font-display text-xl">Schedule a Showing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button className="flex-1 rounded-none" variant="outline">
                    <Phone className="h-4 w-4 mr-2" /> Call
                  </Button>
                  <Button className="flex-1 rounded-none" variant="outline">
                    <Mail className="h-4 w-4 mr-2" /> Email
                  </Button>
                </div>
                <ContactForm listingId={listing.id} listingTitle={listing.title} type="showing" />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </PublicLayout>
  );
}