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
import { Save, Loader2 } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Profile state
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    email: '',
    bio: '',
    zillow_profile_url: '',
  });

  // Notification settings state
  const [notifications, setNotifications] = useState({
    immediate_email: true,
    daily_digest: false,
    weekly_digest: false,
  });

  // Fetch profile
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

  // Fetch notification settings
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

  // Save profile mutation
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

  // Save notifications mutation
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
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your profile and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>This information will be displayed on your public listings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input 
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input 
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input 
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      placeholder="agent@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Zillow Profile URL</Label>
                    <Input 
                      value={profile.zillow_profile_url}
                      onChange={(e) => setProfile({...profile, zillow_profile_url: e.target.value})}
                      placeholder="https://zillow.com/profile/..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea 
                    value={profile.bio}
                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                    placeholder="Tell potential clients about yourself..."
                    className="min-h-[120px]"
                  />
                </div>

                <Button 
                  onClick={() => saveProfile.mutate()}
                  disabled={saveProfile.isPending}
                  className="bg-gradient-gold text-primary hover:opacity-90"
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
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>Choose when you want to receive email notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Immediate Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified immediately when someone views your listing from Zillow or submits a contact form
                    </p>
                  </div>
                  <Switch
                    checked={notifications.immediate_email}
                    onCheckedChange={(checked) => setNotifications({...notifications, immediate_email: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Daily Digest</p>
                    <p className="text-sm text-muted-foreground">
                      Receive a daily summary of all activity on your listings
                    </p>
                  </div>
                  <Switch
                    checked={notifications.daily_digest}
                    onCheckedChange={(checked) => setNotifications({...notifications, daily_digest: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Weekly Digest</p>
                    <p className="text-sm text-muted-foreground">
                      Receive a weekly summary with analytics and performance insights
                    </p>
                  </div>
                  <Switch
                    checked={notifications.weekly_digest}
                    onCheckedChange={(checked) => setNotifications({...notifications, weekly_digest: checked})}
                  />
                </div>

                <Button 
                  onClick={() => saveNotifications.mutate()}
                  disabled={saveNotifications.isPending}
                  className="bg-gradient-gold text-primary hover:opacity-90"
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
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
