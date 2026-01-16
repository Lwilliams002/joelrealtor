import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().optional(),
});

type AuthFormData = z.infer<typeof authSchema>;

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/admin');
    }
  }, [user, navigate]);

  const form = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: '', password: '', name: '' },
  });

  const handleSignIn = async (data: AuthFormData) => {
    setIsLoading(true);
    const { error } = await signIn(data.email, data.password);
    setIsLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Welcome back!');
      navigate('/admin');
    }
  };

  const handleSignUp = async (data: AuthFormData) => {
    setIsLoading(true);
    const { error } = await signUp(data.email, data.password, data.name);
    setIsLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Account created successfully!');
      navigate('/admin');
    }
  };

  if (user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-secondary">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <span className="font-display text-3xl font-semibold tracking-wide text-foreground">
              PRESTIGE
            </span>
            <div className="text-[10px] uppercase tracking-luxury text-muted-foreground">
              Real Estate
            </div>
          </Link>
        </div>

        <Card className="border-0 shadow-elegant">
          <CardHeader className="text-center pb-2">
            <CardTitle className="font-display text-2xl">Welcome</CardTitle>
            <CardDescription>Sign in to manage your listings</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Tabs defaultValue="signin">
              <TabsList className="grid w-full grid-cols-2 mb-6 p-1 bg-secondary rounded-none">
                <TabsTrigger value="signin" className="rounded-none data-[state=active]:bg-white data-[state=active]:shadow-sm uppercase text-xs tracking-wider">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="rounded-none data-[state=active]:bg-white data-[state=active]:shadow-sm uppercase text-xs tracking-wider">
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSignIn)} className="space-y-4">
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider">Email</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="agent@example.com" 
                            className="h-12 rounded-none border-border"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="password" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider">Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="••••••••" 
                            className="h-12 rounded-none border-border"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button 
                      type="submit" 
                      className="w-full h-12 btn-primary rounded-none" 
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign In'}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="signup">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSignUp)} className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider">Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Your name" 
                            className="h-12 rounded-none border-border"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider">Email</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="agent@example.com" 
                            className="h-12 rounded-none border-border"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="password" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider">Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="••••••••" 
                            className="h-12 rounded-none border-border"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button 
                      type="submit" 
                      className="w-full h-12 btn-primary rounded-none" 
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Account'}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}