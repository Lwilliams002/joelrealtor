import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Listing {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  lot_size: string | null;
  property_type: 'house' | 'condo' | 'townhouse' | 'land' | 'multi_family' | 'commercial' | 'other';
  status: 'for_sale' | 'for_rent' | 'sold' | 'pending';
  description: string | null;
  features_json: string[] | null;
  cover_image_url: string | null;
  source: 'manual' | 'idx' | 'csv';
  zillow_url: string | null;
  mls_number: string | null;
  latitude: number | null;
  longitude: number | null;
  open_house_schedule: any[] | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListingImage {
  id: string;
  listing_id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

export type ListingFormData = Omit<Listing, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

// Fetch all published listings for public view
export function usePublicListings(filters?: {
  city?: string;
  status?: 'for_sale' | 'for_rent' | 'sold' | 'pending';
  propertyType?: 'house' | 'condo' | 'townhouse' | 'land' | 'multi_family' | 'commercial' | 'other';
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  sortBy?: 'newest' | 'price_asc' | 'price_desc';
}) {
  return useQuery({
    queryKey: ['public-listings', filters],
    queryFn: async () => {
      let query = supabase
        .from('listings')
        .select('*')
        .eq('published', true);

      if (filters?.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.propertyType) {
        query = query.eq('property_type', filters.propertyType);
      }
      if (filters?.minPrice) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters?.maxPrice) {
        query = query.lte('price', filters.maxPrice);
      }
      if (filters?.minBeds) {
        query = query.gte('beds', filters.minBeds);
      }

      switch (filters?.sortBy) {
        case 'price_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Listing[];
    },
  });
}

// Fetch a single listing by slug
export function useListingBySlug(slug: string) {
  return useQuery({
    queryKey: ['listing', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      return data as Listing;
    },
    enabled: !!slug,
  });
}

// Fetch listing images
export function useListingImages(listingId: string) {
  return useQuery({
    queryKey: ['listing-images', listingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listing_images')
        .select('*')
        .eq('listing_id', listingId)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as ListingImage[];
    },
    enabled: !!listingId,
  });
}

// Admin: Fetch all listings for the current user
export function useAdminListings() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['admin-listings', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Listing[];
    },
    enabled: !!user,
  });
}

// Admin: Create a new listing
export function useCreateListing() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: Partial<ListingFormData>) => {
      if (!user) throw new Error('Not authenticated');
      
      const insertData = {
        title: data.title || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        zip: data.zip || '',
        price: data.price || 0,
        slug: data.slug || '',
        beds: data.beds,
        baths: data.baths,
        sqft: data.sqft,
        lot_size: data.lot_size,
        property_type: data.property_type || 'house',
        status: data.status || 'for_sale',
        description: data.description,
        features_json: data.features_json,
        cover_image_url: data.cover_image_url,
        source: data.source || 'manual',
        zillow_url: data.zillow_url,
        mls_number: data.mls_number,
        latitude: data.latitude,
        longitude: data.longitude,
        open_house_schedule: data.open_house_schedule,
        published: data.published || false,
        user_id: user.id,
      };
      
      const { data: listing, error } = await supabase
        .from('listings')
        .insert(insertData)
        .select()
        .single();
      
      if (error) throw error;
      return listing as Listing;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
      toast.success('Listing created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create listing: ${error.message}`);
    },
  });
}

// Admin: Update a listing
export function useUpdateListing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ListingFormData> }) => {
      const { data: listing, error } = await supabase
        .from('listings')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return listing as Listing;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
      queryClient.invalidateQueries({ queryKey: ['listing', data.slug] });
      toast.success('Listing updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update listing: ${error.message}`);
    },
  });
}

// Admin: Delete a listing
export function useDeleteListing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
      toast.success('Listing deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete listing: ${error.message}`);
    },
  });
}

// Generate a URL-friendly slug
export function generateSlug(title: string, city: string): string {
  const base = `${title}-${city}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${base}-${randomSuffix}`;
}
