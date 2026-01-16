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
import { Plus, Search, MoreHorizontal, Edit, Eye, Trash2, ExternalLink, Home, Sparkles } from 'lucide-react';
import { formatPrice, formatListingStatus, getStatusColor } from '@/lib/formatters';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-2xl bg-gradient-primary flex items-center justify-center">
                <Home className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="font-display text-3xl font-bold text-gradient">Listings</h1>
            </div>
            <p className="text-muted-foreground">Manage your property listings</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button asChild className="rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-all">
              <Link to="/admin/listings/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Listing
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Search */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative max-w-md"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search listings..." 
            className="pl-11 rounded-full border-border/50 bg-card/80 backdrop-blur-sm focus:ring-2 focus:ring-primary/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </motion.div>

        {/* Listings */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse h-28 bg-muted rounded-3xl" />
            ))}
          </div>
        ) : filteredListings && filteredListings.length > 0 ? (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredListings.map((listing, index) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <Card className="overflow-hidden rounded-3xl border-0 shadow-card hover:shadow-float transition-all duration-300 bg-card/80 backdrop-blur-sm group">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        {/* Image */}
                        <div className="sm:w-52 h-36 sm:h-auto relative overflow-hidden">
                          <img 
                            src={listing.cover_image_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=80'} 
                            alt={listing.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent sm:bg-gradient-to-r" />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-display font-semibold text-lg group-hover:text-primary transition-colors">{listing.title}</h3>
                              <Badge 
                                variant={listing.published ? "default" : "secondary"}
                                className={`rounded-full ${listing.published ? 'bg-success/10 text-success border-success/20' : ''}`}
                              >
                                {listing.published ? '● Published' : 'Draft'}
                              </Badge>
                              <Badge className={`rounded-full ${getStatusColor(listing.status)}`}>
                                {formatListingStatus(listing.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {listing.address}, {listing.city}, {listing.state}
                            </p>
                            <p className="font-display font-bold text-xl text-gradient">{formatPrice(listing.price)}</p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <Button asChild variant="outline" size="sm" className="rounded-full hover:bg-primary hover:text-primary-foreground transition-all">
                              <Link to={`/admin/listings/${listing.id}`}>
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Link>
                            </Button>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-2xl">
                                {listing.published && (
                                  <DropdownMenuItem asChild className="rounded-xl">
                                    <Link to={`/listings/${listing.slug}`} target="_blank">
                                      <ExternalLink className="h-4 w-4 mr-2" />
                                      View Live
                                    </Link>
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem asChild className="rounded-xl">
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
                                      className="text-destructive focus:text-destructive rounded-xl"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="rounded-3xl">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="font-display">Delete Listing</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "{listing.title}"? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => deleteListing.mutate(listing.id)}
                                        className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="py-16 rounded-3xl border-0 shadow-card bg-card/80 backdrop-blur-sm">
              <CardContent className="text-center">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 15 }}
                  className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6"
                >
                  <Home className="h-10 w-10 text-muted-foreground" />
                </motion.div>
                <p className="text-muted-foreground mb-6 text-lg">No listings found</p>
                <Button asChild className="rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-all">
                  <Link to="/admin/listings/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Listing
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
}
