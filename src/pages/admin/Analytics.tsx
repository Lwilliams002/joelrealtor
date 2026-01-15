import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminListings } from '@/hooks/useListings';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Eye, MousePointerClick, Calendar, TrendingUp, BarChart3, Activity } from 'lucide-react';
import { formatDate } from '@/lib/formatters';
import { motion } from 'framer-motion';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--success))', 'hsl(var(--secondary))'];

export default function Analytics() {
  const { user } = useAuth();
  const { data: listings } = useAdminListings();

  const { data: events } = useQuery({
    queryKey: ['analytics-events', user?.id],
    queryFn: async () => {
      if (!user || !listings?.length) return [];
      
      const { data } = await supabase
        .from('events')
        .select('*')
        .in('listing_id', listings.map(l => l.id))
        .order('created_at', { ascending: false });
      
      return data || [];
    },
    enabled: !!user && !!listings?.length,
  });

  const totalViews = events?.filter(e => e.event_type === 'page_view').length || 0;
  const totalClicks = events?.filter(e => e.event_type === 'contact_click' || e.event_type === 'schedule_showing').length || 0;
  const outboundClicks = events?.filter(e => e.event_type === 'outbound_click').length || 0;

  const viewsByListing = listings?.map(listing => ({
    name: listing.title.length > 20 ? listing.title.substring(0, 20) + '...' : listing.title,
    views: events?.filter(e => e.listing_id === listing.id && e.event_type === 'page_view').length || 0,
  })).sort((a, b) => b.views - a.views).slice(0, 5) || [];

  const referrerCounts: Record<string, number> = {};
  events?.forEach(e => {
    if (e.referrer) {
      try {
        const host = new URL(e.referrer).hostname.replace('www.', '');
        referrerCounts[host] = (referrerCounts[host] || 0) + 1;
      } catch {
        referrerCounts['Direct'] = (referrerCounts['Direct'] || 0) + 1;
      }
    } else {
      referrerCounts['Direct'] = (referrerCounts['Direct'] || 0) + 1;
    }
  });

  const referrerData = Object.entries(referrerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  const utmCounts: Record<string, number> = {};
  events?.forEach(e => {
    const utm = e.utm_json as Record<string, string> | null;
    if (utm?.utm_source) {
      utmCounts[utm.utm_source] = (utmCounts[utm.utm_source] || 0) + 1;
    }
  });

  const utmData = Object.entries(utmCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  const deviceCounts: Record<string, number> = { mobile: 0, desktop: 0 };
  events?.forEach(e => {
    const device = e.device_json as Record<string, string> | null;
    if (device?.type) {
      deviceCounts[device.type] = (deviceCounts[device.type] || 0) + 1;
    }
  });

  const deviceData = Object.entries(deviceCounts).map(([name, value]) => ({ name, value }));

  const recentEvents = events?.slice(0, 10) || [];

  const statsData = [
    { 
      title: 'Page Views', 
      value: totalViews, 
      icon: Eye,
      gradient: 'from-primary to-primary/70'
    },
    { 
      title: 'Contact Clicks', 
      value: totalClicks, 
      icon: MousePointerClick,
      gradient: 'from-accent to-accent/70'
    },
    { 
      title: 'Outbound Clicks', 
      value: outboundClicks, 
      icon: TrendingUp,
      gradient: 'from-success to-success/70'
    },
    { 
      title: 'Conversion Rate', 
      value: `${totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : 0}%`, 
      icon: Calendar,
      gradient: 'from-secondary to-secondary/70'
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-2xl bg-gradient-primary flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl font-bold text-gradient">Analytics</h1>
          </div>
          <p className="text-muted-foreground">Track visitor engagement and listing performance</p>
        </motion.div>

        {/* Stats Cards */}
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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Views by Listing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="rounded-3xl border-0 shadow-card bg-card/80 backdrop-blur-sm overflow-hidden">
              <CardHeader className="border-b border-border/50 bg-muted/30">
                <CardTitle className="font-display">Views by Listing</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {viewsByListing.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={viewsByListing} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                      <YAxis dataKey="name" type="category" width={120} fontSize={12} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: 'none', 
                          borderRadius: '1rem',
                          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                        }} 
                      />
                      <Bar dataKey="views" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">No data yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Device Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="rounded-3xl border-0 shadow-card bg-card/80 backdrop-blur-sm overflow-hidden">
              <CardHeader className="border-b border-border/50 bg-muted/30">
                <CardTitle className="font-display">Device Types</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {deviceData.some(d => d.value > 0) ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={deviceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {deviceData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: 'none', 
                          borderRadius: '1rem',
                          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <Eye className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">No data yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Referrers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="rounded-3xl border-0 shadow-card bg-card/80 backdrop-blur-sm overflow-hidden">
              <CardHeader className="border-b border-border/50 bg-muted/30">
                <CardTitle className="font-display">Top Referrers</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {referrerData.length > 0 ? (
                  <div className="space-y-4">
                    {referrerData.map((item, index) => (
                      <motion.div 
                        key={item.name} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.05 }}
                        className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-all"
                      >
                        <span className="text-sm font-medium">{item.name}</span>
                        <div className="flex items-center gap-3">
                          <div 
                            className="h-2 rounded-full transition-all" 
                            style={{ 
                              width: `${Math.max((item.value / referrerData[0].value) * 80, 20)}px`,
                              backgroundColor: COLORS[index % COLORS.length]
                            }} 
                          />
                          <span className="text-sm font-bold w-10 text-right">{item.value}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">No referrer data yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* UTM Campaigns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="rounded-3xl border-0 shadow-card bg-card/80 backdrop-blur-sm overflow-hidden">
              <CardHeader className="border-b border-border/50 bg-muted/30">
                <CardTitle className="font-display">UTM Sources</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {utmData.length > 0 ? (
                  <div className="space-y-4">
                    {utmData.map((item, index) => (
                      <motion.div 
                        key={item.name} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.05 }}
                        className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-all"
                      >
                        <span className="text-sm font-medium">{item.name}</span>
                        <div className="flex items-center gap-3">
                          <div 
                            className="h-2 rounded-full transition-all" 
                            style={{ 
                              width: `${Math.max((item.value / utmData[0].value) * 80, 20)}px`,
                              backgroundColor: COLORS[index % COLORS.length]
                            }} 
                          />
                          <span className="text-sm font-bold w-10 text-right">{item.value}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <Activity className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">No UTM data yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="rounded-3xl border-0 shadow-card bg-card/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-muted/30">
              <CardTitle className="font-display flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {recentEvents.length > 0 ? (
                <div className="space-y-3">
                  {recentEvents.map((event, index) => {
                    const listing = listings?.find(l => l.id === event.listing_id);
                    const device = event.device_json as Record<string, string> | null;
                    
                    return (
                      <motion.div 
                        key={event.id} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 + index * 0.03 }}
                        className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl hover:bg-muted/50 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Eye className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {event.event_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {listing?.title || 'Unknown listing'} • {device?.type || 'Unknown device'}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground bg-background px-3 py-1.5 rounded-full">
                          {formatDate(event.created_at)}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Activity className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No activity yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
