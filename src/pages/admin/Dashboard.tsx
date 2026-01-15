import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminListings } from '@/hooks/useListings';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Home, Eye, MessageSquare, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/formatters';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: listings } = useAdminListings();
  
  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['admin-stats', user?.id],
    queryFn: async () => {
      if (!user) return { views: 0, contacts: 0 };
      
      // Get total views for user's listings
      const { count: viewCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'page_view')
        .in('listing_id', listings?.map(l => l.id) || []);
      
      // Get total contact requests
      const { count: contactCount } = await supabase
        .from('contact_requests')
        .select('*', { count: 'exact', head: true })
        .in('listing_id', listings?.map(l => l.id) || []);
      
      return {
        views: viewCount || 0,
        contacts: contactCount || 0,
      };
    },
    enabled: !!user && !!listings,
  });

  // Recent contact requests
  const { data: recentContacts } = useQuery({
    queryKey: ['recent-contacts', user?.id],
    queryFn: async () => {
      if (!user || !listings?.length) return [];
      
      const { data } = await supabase
        .from('contact_requests')
        .select('*')
        .in('listing_id', listings.map(l => l.id))
        .order('created_at', { ascending: false })
        .limit(5);
      
      return data || [];
    },
    enabled: !!user && !!listings?.length,
  });

  const publishedCount = listings?.filter(l => l.published).length || 0;
  const draftCount = listings?.filter(l => !l.published).length || 0;

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back! Here's an overview of your listings.</p>
          </div>
          <Button asChild className="bg-gradient-gold text-primary hover:opacity-90">
            <Link to="/admin/listings/new">Add New Listing</Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Listings</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{listings?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {publishedCount} published, {draftCount} drafts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.views || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">All time page views</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Contact Requests</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.contacts || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Total inquiries received</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Published</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{publishedCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Active listings</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Listings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Listings</CardTitle>
            </CardHeader>
            <CardContent>
              {listings && listings.length > 0 ? (
                <div className="space-y-4">
                  {listings.slice(0, 5).map((listing) => (
                    <Link 
                      key={listing.id} 
                      to={`/admin/listings/${listing.id}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <img 
                        src={listing.cover_image_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=100&q=80'} 
                        alt={listing.title}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{listing.title}</p>
                        <p className="text-sm text-muted-foreground">{listing.city}, {listing.state}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${listing.published ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                        {listing.published ? 'Published' : 'Draft'}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No listings yet</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Contacts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Inquiries</CardTitle>
            </CardHeader>
            <CardContent>
              {recentContacts && recentContacts.length > 0 ? (
                <div className="space-y-4">
                  {recentContacts.map((contact) => (
                    <div key={contact.id} className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium">{contact.name}</p>
                        <span className="text-xs text-muted-foreground">{formatDate(contact.created_at)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{contact.email}</p>
                      <p className="text-sm mt-2 line-clamp-2">{contact.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No inquiries yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
