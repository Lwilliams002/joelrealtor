import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAdminListings, useDeleteListing } from '@/hooks/useListings';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, 
  AlertDialogTitle, AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { Link } from 'react-router-dom';
import { Plus, Search, MoreHorizontal, Edit, Eye, Trash2, ExternalLink } from 'lucide-react';
import { formatPrice, formatListingStatus, getStatusColor } from '@/lib/formatters';
import { useState } from 'react';

export default function AdminListings() {
  const { data: listings, isLoading } = useAdminListings();
  const deleteListing = useDeleteListing();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredListings = listings?.filter(listing => 
    listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold">Listings</h1>
            <p className="text-muted-foreground mt-1">Manage your property listings</p>
          </div>
          <Button asChild className="bg-gradient-gold text-primary hover:opacity-90">
            <Link to="/admin/listings/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Listing
            </Link>
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search listings..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Listings */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse h-24 bg-muted rounded-lg" />
            ))}
          </div>
        ) : filteredListings && filteredListings.length > 0 ? (
          <div className="space-y-4">
            {filteredListings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    {/* Image */}
                    <div className="sm:w-48 h-32 sm:h-auto">
                      <img 
                        src={listing.cover_image_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=80'} 
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{listing.title}</h3>
                          <Badge variant={listing.published ? "default" : "secondary"}>
                            {listing.published ? 'Published' : 'Draft'}
                          </Badge>
                          <Badge className={getStatusColor(listing.status)}>
                            {formatListingStatus(listing.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {listing.address}, {listing.city}, {listing.state}
                        </p>
                        <p className="font-semibold text-accent">{formatPrice(listing.price)}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link to={`/admin/listings/${listing.id}`}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {listing.published && (
                              <DropdownMenuItem asChild>
                                <Link to={`/listings/${listing.slug}`} target="_blank">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  View Live
                                </Link>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem asChild>
                              <Link to={`/admin/listings/${listing.id}/preview`}>
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem 
                                  onSelect={(e) => e.preventDefault()}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Listing</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{listing.title}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => deleteListing.mutate(listing.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="py-12">
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">No listings found</p>
              <Button asChild className="bg-gradient-gold text-primary hover:opacity-90">
                <Link to="/admin/listings/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Listing
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
