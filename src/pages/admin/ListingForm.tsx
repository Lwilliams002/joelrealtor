import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { useCreateListing, useUpdateListing, generateSlug } from '@/hooks/useListings';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const listingSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zip: z.string().min(5, 'ZIP code is required'),
  price: z.coerce.number().min(1, 'Price is required'),
  beds: z.coerce.number().optional(),
  baths: z.coerce.number().optional(),
  sqft: z.coerce.number().optional(),
  lot_size: z.string().optional(),
  property_type: z.enum(['house', 'condo', 'townhouse', 'land', 'multi_family', 'commercial', 'other']),
  status: z.enum(['for_sale', 'for_rent', 'sold', 'pending']),
  description: z.string().optional(),
  zillow_url: z.string().url().optional().or(z.literal('')),
  mls_number: z.string().optional(),
  published: z.boolean(),
});

type ListingFormData = z.infer<typeof listingSchema>;

export default function ListingForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const createListing = useCreateListing();
  const updateListing = useUpdateListing();
  
  const [images, setImages] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState<string>('');
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');

  // Fetch existing listing if editing
  const { data: existingListing, isLoading: isLoadingListing } = useQuery({
    queryKey: ['listing-edit', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch existing images
  const { data: existingImages } = useQuery({
    queryKey: ['listing-images-edit', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('listing_images')
        .select('*')
        .eq('listing_id', id)
        .order('sort_order');
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      price: 0,
      beds: undefined,
      baths: undefined,
      sqft: undefined,
      lot_size: '',
      property_type: 'house',
      status: 'for_sale',
      description: '',
      zillow_url: '',
      mls_number: '',
      published: false,
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (existingListing) {
      form.reset({
        title: existingListing.title,
        address: existingListing.address,
        city: existingListing.city,
        state: existingListing.state,
        zip: existingListing.zip,
        price: Number(existingListing.price),
        beds: existingListing.beds || undefined,
        baths: existingListing.baths || undefined,
        sqft: existingListing.sqft || undefined,
        lot_size: existingListing.lot_size || '',
        property_type: existingListing.property_type,
        status: existingListing.status,
        description: existingListing.description || '',
        zillow_url: existingListing.zillow_url || '',
        mls_number: existingListing.mls_number || '',
        published: existingListing.published,
      });
      setCoverImage(existingListing.cover_image_url || '');
      if (existingListing.features_json) {
        setFeatures(existingListing.features_json as string[]);
      }
    }
  }, [existingListing, form]);

  useEffect(() => {
    if (existingImages) {
      setImages(existingImages.map(img => img.image_url));
    }
  }, [existingImages]);

  const onSubmit = async (data: ListingFormData) => {
    const slug = isEditing && existingListing 
      ? existingListing.slug 
      : generateSlug(data.title, data.city);

    const listingData = {
      ...data,
      slug,
      cover_image_url: coverImage || null,
      features_json: features,
      zillow_url: data.zillow_url || null,
    };

    try {
      if (isEditing && id) {
        await updateListing.mutateAsync({ id, data: listingData });
        
        // Update images
        await supabase.from('listing_images').delete().eq('listing_id', id);
        if (images.length > 0) {
          await supabase.from('listing_images').insert(
            images.map((url, index) => ({
              listing_id: id,
              image_url: url,
              sort_order: index,
            }))
          );
        }
      } else {
        const result = await createListing.mutateAsync(listingData);
        
        // Save images
        if (result && images.length > 0) {
          await supabase.from('listing_images').insert(
            images.map((url, index) => ({
              listing_id: result.id,
              image_url: url,
              sort_order: index,
            }))
          );
        }
      }

      navigate('/admin/listings');
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  if (isEditing && isLoadingListing) {
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button 
                type="button" 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/admin/listings')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="font-serif text-2xl font-bold">
                  {isEditing ? 'Edit Listing' : 'New Listing'}
                </h1>
                <p className="text-muted-foreground">
                  {isEditing ? 'Update your property details' : 'Add a new property to your portfolio'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FormField
                control={form.control}
                name="published"
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <span className="text-sm font-medium">
                      {field.value ? 'Published' : 'Draft'}
                    </span>
                  </div>
                )}
              />
              <Button type="submit" className="bg-gradient-gold text-primary hover:opacity-90">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>

          <Tabs defaultValue="details" className="space-y-6">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Info */}
                <Card>
                  <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <FormField control={form.control} name="title" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title *</FormLabel>
                        <FormControl><Input placeholder="Beautiful 3BR Home in Downtown" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="property_type" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property Type *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="house">House</SelectItem>
                              <SelectItem value="condo">Condo</SelectItem>
                              <SelectItem value="townhouse">Townhouse</SelectItem>
                              <SelectItem value="land">Land</SelectItem>
                              <SelectItem value="multi_family">Multi-Family</SelectItem>
                              <SelectItem value="commercial">Commercial</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="status" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="for_sale">For Sale</SelectItem>
                              <SelectItem value="for_rent">For Rent</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="sold">Sold</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <FormField control={form.control} name="price" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price *</FormLabel>
                        <FormControl><Input type="number" placeholder="500000" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="description" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl><Textarea placeholder="Describe the property..." className="min-h-[120px]" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </CardContent>
                </Card>

                {/* Location */}
                <Card>
                  <CardHeader><CardTitle>Location</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <FormField control={form.control} name="address" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address *</FormLabel>
                        <FormControl><Input placeholder="123 Main Street" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="grid grid-cols-3 gap-4">
                      <FormField control={form.control} name="city" render={({ field }) => (
                        <FormItem>
                          <FormLabel>City *</FormLabel>
                          <FormControl><Input placeholder="Austin" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="state" render={({ field }) => (
                        <FormItem>
                          <FormLabel>State *</FormLabel>
                          <FormControl><Input placeholder="TX" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="zip" render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP *</FormLabel>
                          <FormControl><Input placeholder="78701" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </CardContent>
                </Card>

                {/* Property Details */}
                <Card>
                  <CardHeader><CardTitle>Property Details</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="beds" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bedrooms</FormLabel>
                          <FormControl><Input type="number" placeholder="3" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="baths" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bathrooms</FormLabel>
                          <FormControl><Input type="number" step="0.5" placeholder="2" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="sqft" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Square Feet</FormLabel>
                          <FormControl><Input type="number" placeholder="2000" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="lot_size" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lot Size</FormLabel>
                          <FormControl><Input placeholder="0.25 acres" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </CardContent>
                </Card>

                {/* External Links */}
                <Card>
                  <CardHeader><CardTitle>External Links</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <FormField control={form.control} name="zillow_url" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zillow URL</FormLabel>
                        <FormControl><Input placeholder="https://zillow.com/..." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="mls_number" render={({ field }) => (
                      <FormItem>
                        <FormLabel>MLS Number</FormLabel>
                        <FormControl><Input placeholder="MLS123456" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Images Tab */}
            <TabsContent value="images">
              <Card>
                <CardHeader><CardTitle>Photos</CardTitle></CardHeader>
                <CardContent>
                  <ImageUpload
                    images={images}
                    onImagesChange={setImages}
                    coverImage={coverImage}
                    onCoverImageChange={setCoverImage}
                    listingId={id}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Features Tab */}
            <TabsContent value="features">
              <Card>
                <CardHeader><CardTitle>Features & Amenities</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a feature (e.g., Hardwood Floors)"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    />
                    <Button type="button" onClick={addFeature} variant="outline">Add</Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {features.map((feature, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-muted rounded-full text-sm"
                      >
                        {feature}
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="hover:text-destructive"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </AdminLayout>
  );
}
