import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminListings } from '@/hooks/useListings';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Home, Eye, MessageSquare, TrendingUp, Plus, ArrowUpRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/formatters';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: listings } = useAdminListings();
  
  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['admin-stats', user?.id],
    queryFn: async () => {
      if (!user) return { views: 0, contacts: 0 };
      
      const { count: viewCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'page_view')
        .in('listing_id', listings?.map(l => l.id) || []);
      
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

  const statsData = [
    { 
      title: 'Total Listings', 
      value: listings?.length || 0, 
      subtitle: `${publishedCount} published, ${draftCount} drafts`,
      icon: Home,
      gradient: 'from-primary to-primary/70'
    },
    { 
      title: 'Total Views', 
      value: stats?.views || 0, 
      subtitle: 'All time page views',
      icon: Eye,
      gradient: 'from-accent to-accent/70'
    },
    { 
      title: 'Contact Requests', 
      value: stats?.contacts || 0, 
      subtitle: 'Total inquiries received',
      icon: MessageSquare,
      gradient: 'from-success to-success/70'
    },
    { 
      title: 'Published', 
      value: publishedCount, 
      subtitle: 'Active listings',
      icon: TrendingUp,
      gradient: 'from-secondary to-secondary/70'
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-2xl bg-gradient-primary flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="font-display text-3xl font-bold text-gradient">Dashboard</h1>
            </div>
            <p className="text-muted-foreground">Welcome back! Here's an overview of your listings.</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button asChild className="rounded-full bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-xl transition-all hover-lift">
              <Link to="/admin/listings/new">
                <Plus className="h-4 w-4 mr-2" />
                Add New Listing
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsData.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden rounded-3xl border-0 shadow-card hover:shadow-float transition-all duration-300 hover-lift bg-card/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold font-display">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-2">{stat.subtitle}</p>
                    </div>
                    <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md`}>
                      <stat.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Listings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="rounded-3xl border-0 shadow-card bg-card/80 backdrop-blur-sm overflow-hidden">
              <CardHeader className="border-b border-border/50 bg-muted/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-display">Recent Listings</CardTitle>
                  <Button variant="ghost" size="sm" asChild className="rounded-full text-primary hover:text-primary">
                    <Link to="/admin/listings">
                      View all
                      <ArrowUpRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {listings && listings.length > 0 ? (
                  <div className="space-y-3">
                    {listings.slice(0, 5).map((listing, index) => (
                      <motion.div
                        key={listing.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.05 }}
                      >
                        <Link 
                          to={`/admin/listings/${listing.id}`}
                          className="flex items-center gap-4 p-3 rounded-2xl hover:bg-muted/50 transition-all duration-300 group"
                        >
                          <img 
                            src={listing.cover_image_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=100&q=80'} 
                            alt={listing.title}
                            className="w-14 h-14 rounded-xl object-cover shadow-md group-hover:scale-105 transition-transform"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate group-hover:text-primary transition-colors">{listing.title}</p>
                            <p className="text-sm text-muted-foreground">{listing.city}, {listing.state}</p>
                          </div>
                          <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                            listing.published 
                              ? 'bg-success/10 text-success' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {listing.published ? 'Published' : 'Draft'}
                          </span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <Home className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">No listings yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Contacts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="rounded-3xl border-0 shadow-card bg-card/80 backdrop-blur-sm overflow-hidden">
              <CardHeader className="border-b border-border/50 bg-muted/30">
                <CardTitle className="text-lg font-display">Recent Inquiries</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {recentContacts && recentContacts.length > 0 ? (
                  <div className="space-y-3">
                    {recentContacts.map((contact, index) => (
                      <motion.div 
                        key={contact.id} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.05 }}
                        className="p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">{contact.name}</p>
                          <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded-full">
                            {formatDate(contact.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{contact.email}</p>
                        <p className="text-sm mt-2 line-clamp-2">{contact.message}</p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">No inquiries yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}
