import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Save, Loader2, Settings as SettingsIcon, User, Bell, Mail, Clock, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Settings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    email: '',
    bio: '',
    zillow_profile_url: '',
  });

  const [notifications, setNotifications] = useState({
    immediate_email: true,
    daily_digest: false,
    weekly_digest: false,
  });

  const { data: profileData, isLoading: loadingProfile } = useQuery({
    queryKey: ['realtor-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('realtor_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: notificationData, isLoading: loadingNotifications } = useQuery({
    queryKey: ['notification-settings', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (profileData) {
      setProfile({
        name: profileData.name || '',
        phone: profileData.phone || '',
        email: profileData.email || '',
        bio: profileData.bio || '',
        zillow_profile_url: profileData.zillow_profile_url || '',
      });
    }
  }, [profileData]);

  useEffect(() => {
    if (notificationData) {
      setNotifications({
        immediate_email: notificationData.immediate_email,
        daily_digest: notificationData.daily_digest,
        weekly_digest: notificationData.weekly_digest,
      });
    }
  }, [notificationData]);

  const saveProfile = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('realtor_profiles')
        .update(profile)
        .eq('id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['realtor-profile'] });
      toast.success('Profile saved successfully');
    },
    onError: (error) => {
      toast.error(`Failed to save profile: ${error.message}`);
    },
  });

  const saveNotifications = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: user.id,
          ...notifications,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
      toast.success('Notification settings saved');
    },
    onError: (error) => {
      toast.error(`Failed to save settings: ${error.message}`);
    },
  });

  if (loadingProfile || loadingNotifications) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent"
          />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-2xl bg-gradient-primary flex items-center justify-center">
              <SettingsIcon className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl font-bold text-gradient">Settings</h1>
          </div>
          <p className="text-muted-foreground">Manage your profile and preferences</p>
        </motion.div>

        <Tabs defaultValue="profile" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <TabsList className="rounded-full bg-muted/50 p-1">
              <TabsTrigger value="profile" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-md">
                <User className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-md">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
            </TabsList>
          </motion.div>

          {/* Profile Settings */}
          <TabsContent value="profile">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="rounded-3xl border-0 shadow-card bg-card/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="border-b border-border/50 bg-muted/30">
                  <CardTitle className="font-display flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Your Profile
                  </CardTitle>
                  <CardDescription>This information will be displayed on your public listings</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Name</Label>
                      <Input 
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                        placeholder="Your full name"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Phone</Label>
                      <Input 
                        value={profile.phone}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                        placeholder="(555) 123-4567"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Email</Label>
                      <Input 
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                        placeholder="agent@example.com"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Zillow Profile URL</Label>
                      <Input 
                        value={profile.zillow_profile_url}
                        onChange={(e) => setProfile({...profile, zillow_profile_url: e.target.value})}
                        placeholder="https://zillow.com/profile/..."
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Bio</Label>
                    <Textarea 
                      value={profile.bio}
                      onChange={(e) => setProfile({...profile, bio: e.target.value})}
                      placeholder="Tell potential clients about yourself..."
                      className="min-h-[120px] rounded-xl"
                    />
                  </div>

                  <Button 
                    onClick={() => saveProfile.mutate()}
                    disabled={saveProfile.isPending}
                    className="rounded-full bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-xl transition-all hover-lift"
                  >
                    {saveProfile.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Profile
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="rounded-3xl border-0 shadow-card bg-card/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="border-b border-border/50 bg-muted/30">
                  <CardTitle className="font-display flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Email Notifications
                  </CardTitle>
                  <CardDescription>Choose when you want to receive email notifications</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-between p-5 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Mail className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Immediate Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Get notified immediately when someone views your listing from Zillow or submits a contact form
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.immediate_email}
                      onCheckedChange={(checked) => setNotifications({...notifications, immediate_email: checked})}
                      className="data-[state=checked]:bg-primary"
                    />
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center justify-between p-5 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                        <Clock className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium">Daily Digest</p>
                        <p className="text-sm text-muted-foreground">
                          Receive a daily summary of all activity on your listings
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.daily_digest}
                      onCheckedChange={(checked) => setNotifications({...notifications, daily_digest: checked})}
                      className="data-[state=checked]:bg-accent"
                    />
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center justify-between p-5 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-success/10 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-success" />
                      </div>
                      <div>
                        <p className="font-medium">Weekly Digest</p>
                        <p className="text-sm text-muted-foreground">
                          Receive a weekly summary with analytics and performance insights
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.weekly_digest}
                      onCheckedChange={(checked) => setNotifications({...notifications, weekly_digest: checked})}
                      className="data-[state=checked]:bg-success"
                    />
                  </motion.div>

                  <Button 
                    onClick={() => saveNotifications.mutate()}
                    disabled={saveNotifications.isPending}
                    className="rounded-full bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-xl transition-all hover-lift mt-4"
                  >
                    {saveNotifications.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Notifications
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
