import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminListings } from '@/hooks/useListings';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Eye, MousePointerClick, Calendar, TrendingUp } from 'lucide-react';
import { formatDate } from '@/lib/formatters';

const COLORS = ['hsl(38, 92%, 50%)', 'hsl(222, 47%, 11%)', 'hsl(210, 40%, 96%)', 'hsl(0, 84%, 60%)'];

export default function Analytics() {
  const { user } = useAuth();
  const { data: listings } = useAdminListings();

  // Fetch events for analytics
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

  // Calculate stats
  const totalViews = events?.filter(e => e.event_type === 'page_view').length || 0;
  const totalClicks = events?.filter(e => e.event_type === 'contact_click' || e.event_type === 'schedule_showing').length || 0;
  const outboundClicks = events?.filter(e => e.event_type === 'outbound_click').length || 0;

  // Views by listing
  const viewsByListing = listings?.map(listing => ({
    name: listing.title.length > 20 ? listing.title.substring(0, 20) + '...' : listing.title,
    views: events?.filter(e => e.listing_id === listing.id && e.event_type === 'page_view').length || 0,
  })).sort((a, b) => b.views - a.views).slice(0, 5) || [];

  // Referrer breakdown
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

  // UTM Source breakdown
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

  // Device breakdown
  const deviceCounts: Record<string, number> = { mobile: 0, desktop: 0 };
  events?.forEach(e => {
    const device = e.device_json as Record<string, string> | null;
    if (device?.type) {
      deviceCounts[device.type] = (deviceCounts[device.type] || 0) + 1;
    }
  });

  const deviceData = Object.entries(deviceCounts).map(([name, value]) => ({ name, value }));

  // Recent events
  const recentEvents = events?.slice(0, 10) || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">Track visitor engagement and listing performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Page Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalViews}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Contact Clicks</CardTitle>
              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClicks}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Outbound Clicks</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{outboundClicks}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Views by Listing */}
          <Card>
            <CardHeader>
              <CardTitle>Views by Listing</CardTitle>
            </CardHeader>
            <CardContent>
              {viewsByListing.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={viewsByListing} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="views" fill="hsl(38, 92%, 50%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">No data yet</p>
              )}
            </CardContent>
          </Card>

          {/* Device Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Device Types</CardTitle>
            </CardHeader>
            <CardContent>
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
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">No data yet</p>
              )}
            </CardContent>
          </Card>

          {/* Top Referrers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Referrers</CardTitle>
            </CardHeader>
            <CardContent>
              {referrerData.length > 0 ? (
                <div className="space-y-3">
                  {referrerData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <span className="text-sm">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-2 rounded-full" 
                          style={{ 
                            width: `${(item.value / referrerData[0].value) * 100}px`,
                            backgroundColor: COLORS[index % COLORS.length]
                          }} 
                        />
                        <span className="text-sm font-medium w-12 text-right">{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No referrer data yet</p>
              )}
            </CardContent>
          </Card>

          {/* UTM Campaigns */}
          <Card>
            <CardHeader>
              <CardTitle>UTM Sources</CardTitle>
            </CardHeader>
            <CardContent>
              {utmData.length > 0 ? (
                <div className="space-y-3">
                  {utmData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <span className="text-sm">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-2 rounded-full" 
                          style={{ 
                            width: `${(item.value / utmData[0].value) * 100}px`,
                            backgroundColor: COLORS[index % COLORS.length]
                          }} 
                        />
                        <span className="text-sm font-medium w-12 text-right">{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No UTM data yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentEvents.length > 0 ? (
              <div className="space-y-3">
                {recentEvents.map((event) => {
                  const listing = listings?.find(l => l.id === event.listing_id);
                  const device = event.device_json as Record<string, string> | null;
                  
                  return (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">
                          {event.event_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {listing?.title || 'Unknown listing'} • {device?.type || 'Unknown device'}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(event.created_at)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No activity yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
