import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTracking } from '@/hooks/useTracking';
import { Loader2, ArrowRight, ArrowLeft, CheckCircle, MapPin, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Step 1 schema - Address
const addressSchema = z.object({
  address: z.string().min(5, 'Please enter a valid address'),
});

// Step 2 schema - Contact info
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
});

type AddressFormData = z.infer<typeof addressSchema>;
type ContactFormData = z.infer<typeof contactSchema>;

interface HomeValuationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HomeValuationModal({ open, onOpenChange }: HomeValuationModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { trackContactClick } = useTracking();

  const addressForm = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: { address: '' },
  });

  const contactForm = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', phone: '' },
  });

  // Fetch Mapbox token from edge function
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        setMapboxToken(data.token);
      } catch (err) {
        console.error('Failed to fetch Mapbox token:', err);
      }
    };
    if (open) fetchToken();
  }, [open]);

  // Address autocomplete
  const searchAddress = async (query: string) => {
    if (!mapboxToken || query.length < 3) {
      setAddressSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&country=US&types=address&limit=5`
      );
      const data = await response.json();
      setAddressSuggestions(data.features || []);
      setShowSuggestions(true);
    } catch (err) {
      console.error('Address search error:', err);
    }
  };

  const selectAddress = (suggestion: any) => {
    const fullAddress = suggestion.place_name;
    addressForm.setValue('address', fullAddress);
    setSelectedAddress(fullAddress);
    setAddressSuggestions([]);
    setShowSuggestions(false);
  };

  const handleAddressSubmit = (data: AddressFormData) => {
    setSelectedAddress(data.address);
    setStep(2);
  };

  const handleContactSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('contact_requests').insert({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        message: `Home Valuation Request for: ${selectedAddress}`,
      });

      if (error) throw error;

      trackContactClick();
      setStep(3);
    } catch (error: any) {
      toast.error(`Failed to submit request: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedAddress('');
    addressForm.reset();
    contactForm.reset();
    onOpenChange(false);
  };

  const handleBack = () => {
    setStep(1);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 pt-6 px-6">
          <div className={`h-2 w-16 rounded-full transition-colors ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`h-2 w-16 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`h-2 w-16 rounded-full transition-colors ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="p-6"
            >
              <DialogHeader className="mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <DialogTitle className="font-display text-2xl">What's Your Home Worth?</DialogTitle>
                <DialogDescription>
                  Enter your property address to receive a free home valuation.
                </DialogDescription>
              </DialogHeader>

              <Form {...addressForm}>
                <form onSubmit={addressForm.handleSubmit(handleAddressSubmit)} className="space-y-4">
                  <FormField
                    control={addressForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="relative">
                        <FormLabel>Property Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                              {...field}
                              placeholder="123 Main St, City, State"
                              className="h-12 rounded-xl pl-10"
                              onChange={(e) => {
                                field.onChange(e);
                                searchAddress(e.target.value);
                              }}
                              onFocus={() => setShowSuggestions(addressSuggestions.length > 0)}
                              autoComplete="off"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                        
                        {/* Address suggestions dropdown */}
                        {showSuggestions && addressSuggestions.length > 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg overflow-hidden">
                            {addressSuggestions.map((suggestion) => (
                              <button
                                key={suggestion.id}
                                type="button"
                                className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-start gap-3 border-b border-border last:border-0"
                                onClick={() => selectAddress(suggestion)}
                              >
                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{suggestion.place_name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full h-12 btn-primary rounded-xl">
                    Continue
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </form>
              </Form>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-6"
            >
              <DialogHeader className="mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Home className="h-6 w-6 text-primary" />
                </div>
                <DialogTitle className="font-display text-2xl">Almost There!</DialogTitle>
                <DialogDescription>
                  Enter your contact information to receive your free home valuation.
                </DialogDescription>
              </DialogHeader>

              {/* Selected address display */}
              <div className="bg-muted rounded-xl p-4 mb-6">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Property Address</p>
                <p className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  {selectedAddress}
                </p>
              </div>

              <Form {...contactForm}>
                <form onSubmit={contactForm.handleSubmit(handleContactSubmit)} className="space-y-4">
                  <FormField
                    control={contactForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="John Doe" className="h-12 rounded-xl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={contactForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="john@example.com" className="h-12 rounded-xl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={contactForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} type="tel" placeholder="(555) 123-4567" className="h-12 rounded-xl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      className="h-12 rounded-xl"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 h-12 btn-primary rounded-xl"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Get My Free Valuation
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="p-6 py-12 text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <DialogTitle className="font-display text-2xl mb-3">Request Received!</DialogTitle>
              <DialogDescription className="text-base mb-6">
                Thank you! We've received your home valuation request for:
              </DialogDescription>
              <div className="bg-muted rounded-xl p-4 mb-8 inline-block">
                <p className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  {selectedAddress}
                </p>
              </div>
              <p className="text-muted-foreground text-sm mb-8">
                We'll analyze your property and get back to you within 24-48 hours with a personalized home valuation report.
              </p>
              <Button onClick={handleClose} className="btn-primary rounded-xl px-8 h-12">
                Done
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
