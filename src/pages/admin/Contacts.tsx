import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminListings } from '@/hooks/useListings';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/lib/formatters';
import { toast } from 'sonner';
import { 
  MessageSquare, Search, Mail, Phone, Calendar, 
  CheckCircle, Clock, XCircle, Eye, Home, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type ContactStatus = 'new' | 'contacted' | 'closed';

interface ContactRequest {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  listing_id: string | null;
  status: string;
  created_at: string;
}

export default function Contacts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: listings } = useAdminListings();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedContact, setSelectedContact] = useState<ContactRequest | null>(null);

  const { data: contacts, isLoading } = useQuery({
    queryKey: ['admin-contacts', user?.id],
    queryFn: async () => {
      if (!user || !listings?.length) return [];
      
      const { data, error } = await supabase
        .from('contact_requests')
        .select('*')
        .in('listing_id', listings.map(l => l.id))
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ContactRequest[];
    },
    enabled: !!user && !!listings?.length,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('contact_requests')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-contacts'] });
      queryClient.invalidateQueries({ queryKey: ['recent-contacts'] });
      toast.success('Status updated');
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });

  const filteredContacts = contacts?.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.message?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-primary/10 text-primary border-primary/20 rounded-full"><Clock className="h-3 w-3 mr-1" />New</Badge>;
      case 'contacted':
        return <Badge className="bg-accent/10 text-accent border-accent/20 rounded-full"><CheckCircle className="h-3 w-3 mr-1" />Contacted</Badge>;
      case 'closed':
        return <Badge className="bg-muted text-muted-foreground rounded-full"><XCircle className="h-3 w-3 mr-1" />Closed</Badge>;
      default:
        return <Badge variant="secondary" className="rounded-full">{status}</Badge>;
    }
  };

  const getListing = (listingId: string | null) => {
    if (!listingId) return null;
    return listings?.find(l => l.id === listingId);
  };

  const stats = {
    total: contacts?.length || 0,
    new: contacts?.filter(c => c.status === 'new').length || 0,
    contacted: contacts?.filter(c => c.status === 'contacted').length || 0,
    closed: contacts?.filter(c => c.status === 'closed').length || 0,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-2xl bg-gradient-primary flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl font-bold text-gradient">Contact Requests</h1>
          </div>
          <p className="text-muted-foreground">Manage inquiries from potential buyers</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: stats.total, color: 'from-primary to-primary/70' },
            { label: 'New', value: stats.new, color: 'from-primary to-primary/70' },
            { label: 'Contacted', value: stats.contacted, color: 'from-accent to-accent/70' },
            { label: 'Closed', value: stats.closed, color: 'from-muted to-muted/70' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="rounded-2xl border-0 shadow-card bg-card/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold font-display">{stat.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search contacts..." 
              className="pl-11 rounded-full border-border/50 bg-card/80 backdrop-blur-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40 rounded-full">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Contact List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse h-28 bg-muted rounded-3xl" />
            ))}
          </div>
        ) : filteredContacts && filteredContacts.length > 0 ? (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredContacts.map((contact, index) => {
                const listing = getListing(contact.listing_id);
                
                return (
                  <motion.div
                    key={contact.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                  >
                    <Card className="rounded-3xl border-0 shadow-card hover:shadow-float transition-all duration-300 bg-card/80 backdrop-blur-sm overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex flex-col lg:flex-row">
                          {/* Contact Info */}
                          <div className="flex-1 p-5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                              <div className="flex items-center gap-3">
                                <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center">
                                  <User className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <h3 className="font-semibold">{contact.name}</h3>
                                  <p className="text-sm text-muted-foreground">{contact.email}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(contact.status)}
                                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                                  {formatDate(contact.created_at)}
                                </span>
                              </div>
                            </div>

                            {contact.message && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                {contact.message}
                              </p>
                            )}

                            {listing && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Home className="h-4 w-4" />
                                <span>Re: {listing.title}</span>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex lg:flex-col items-center justify-end gap-2 p-4 bg-muted/30 lg:border-l border-t lg:border-t-0 border-border/50">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="rounded-full"
                              onClick={() => setSelectedContact(contact)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Select 
                              value={contact.status} 
                              onValueChange={(value) => updateStatus.mutate({ id: contact.id, status: value })}
                            >
                              <SelectTrigger className="w-32 rounded-full text-xs h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="contacted">Contacted</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="py-16 rounded-3xl border-0 shadow-card bg-card/80 backdrop-blur-sm">
              <CardContent className="text-center">
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="h-10 w-10 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-lg">No contact requests yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  When potential buyers submit inquiries, they'll appear here.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Contact Detail Dialog */}
        <Dialog open={!!selectedContact} onOpenChange={() => setSelectedContact(null)}>
          <DialogContent className="rounded-3xl max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display">Contact Details</DialogTitle>
              <DialogDescription>
                View the full inquiry details
              </DialogDescription>
            </DialogHeader>
            {selectedContact && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{selectedContact.name}</h3>
                    <p className="text-sm text-muted-foreground">{formatDate(selectedContact.created_at)}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <a 
                    href={`mailto:${selectedContact.email}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <Mail className="h-5 w-5 text-primary" />
                    <span>{selectedContact.email}</span>
                  </a>
                  
                  {selectedContact.phone && (
                    <a 
                      href={`tel:${selectedContact.phone}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                    >
                      <Phone className="h-5 w-5 text-primary" />
                      <span>{selectedContact.phone}</span>
                    </a>
                  )}

                  {getListing(selectedContact.listing_id) && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                      <Home className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm">
                        Interested in: <strong>{getListing(selectedContact.listing_id)?.title}</strong>
                      </span>
                    </div>
                  )}
                </div>

                {selectedContact.message && (
                  <div className="p-4 bg-muted/30 rounded-2xl">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Message</p>
                    <p className="text-sm whitespace-pre-wrap">{selectedContact.message}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button 
                    asChild 
                    className="flex-1 rounded-full bg-gradient-primary text-primary-foreground"
                  >
                    <a href={`mailto:${selectedContact.email}`}>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </a>
                  </Button>
                  {selectedContact.phone && (
                    <Button asChild variant="outline" className="flex-1 rounded-full">
                      <a href={`tel:${selectedContact.phone}`}>
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
