-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create enum for listing status
CREATE TYPE public.listing_status AS ENUM ('for_sale', 'for_rent', 'sold', 'pending');

-- Create enum for listing source
CREATE TYPE public.listing_source AS ENUM ('manual', 'idx', 'csv');

-- Create enum for property type
CREATE TYPE public.property_type AS ENUM ('house', 'condo', 'townhouse', 'land', 'multi_family', 'commercial', 'other');

-- ============================================
-- USER ROLES TABLE (for admin access)
-- ============================================
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS for user_roles: users can read their own roles
CREATE POLICY "Users can view own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- REALTOR PROFILE TABLE
-- ============================================
CREATE TABLE public.realtor_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT '',
    phone TEXT,
    email TEXT,
    bio TEXT,
    headshot_url TEXT,
    zillow_profile_url TEXT,
    social_links JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.realtor_profiles ENABLE ROW LEVEL SECURITY;

-- Public can view profiles
CREATE POLICY "Public can view realtor profiles" ON public.realtor_profiles
    FOR SELECT USING (true);

-- Realtors can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.realtor_profiles
    FOR INSERT WITH CHECK (id = auth.uid());

-- Realtors can update their own profile
CREATE POLICY "Users can update own profile" ON public.realtor_profiles
    FOR UPDATE USING (id = auth.uid());

-- ============================================
-- LISTINGS TABLE
-- ============================================
CREATE TABLE public.listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip TEXT NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    beds INTEGER,
    baths DECIMAL(3, 1),
    sqft INTEGER,
    lot_size TEXT,
    property_type property_type NOT NULL DEFAULT 'house',
    status listing_status NOT NULL DEFAULT 'for_sale',
    description TEXT,
    features_json JSONB DEFAULT '[]',
    cover_image_url TEXT,
    source listing_source NOT NULL DEFAULT 'manual',
    zillow_url TEXT,
    mls_number TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    open_house_schedule JSONB DEFAULT '[]',
    published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Helper function to check listing ownership
CREATE OR REPLACE FUNCTION public.is_listing_owner(_listing_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.listings
    WHERE id = _listing_id
      AND user_id = auth.uid()
  )
$$;

-- Public can view published listings
CREATE POLICY "Public can view published listings" ON public.listings
    FOR SELECT USING (published = true OR user_id = auth.uid());

-- Realtors can insert their own listings
CREATE POLICY "Users can insert own listings" ON public.listings
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Realtors can update their own listings
CREATE POLICY "Users can update own listings" ON public.listings
    FOR UPDATE USING (user_id = auth.uid());

-- Realtors can delete their own listings
CREATE POLICY "Users can delete own listings" ON public.listings
    FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- LISTING IMAGES TABLE
-- ============================================
CREATE TABLE public.listing_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;

-- Public can view images of published listings
CREATE POLICY "Public can view published listing images" ON public.listing_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.listings 
            WHERE id = listing_id 
            AND (published = true OR user_id = auth.uid())
        )
    );

-- Realtors can insert images for their own listings
CREATE POLICY "Users can insert images for own listings" ON public.listing_images
    FOR INSERT WITH CHECK (public.is_listing_owner(listing_id));

-- Realtors can update images for their own listings
CREATE POLICY "Users can update images for own listings" ON public.listing_images
    FOR UPDATE USING (public.is_listing_owner(listing_id));

-- Realtors can delete images for their own listings
CREATE POLICY "Users can delete images for own listings" ON public.listing_images
    FOR DELETE USING (public.is_listing_owner(listing_id));

-- ============================================
-- EVENTS TABLE (Click Tracking)
-- ============================================
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
    session_id TEXT,
    event_type TEXT NOT NULL,
    referrer TEXT,
    utm_json JSONB DEFAULT '{}',
    device_json JSONB DEFAULT '{}',
    geo_json JSONB DEFAULT '{}',
    page_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Anyone can insert events (tracking)
CREATE POLICY "Anyone can insert events" ON public.events
    FOR INSERT WITH CHECK (true);

-- Realtors can view events for their own listings
CREATE POLICY "Users can view events for own listings" ON public.events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.listings 
            WHERE id = listing_id 
            AND user_id = auth.uid()
        )
    );

-- ============================================
-- CONTACT REQUESTS TABLE
-- ============================================
CREATE TABLE public.contact_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can submit contact requests
CREATE POLICY "Anyone can submit contact requests" ON public.contact_requests
    FOR INSERT WITH CHECK (true);

-- Realtors can view contact requests for their listings
CREATE POLICY "Users can view contact requests for own listings" ON public.contact_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.listings 
            WHERE id = listing_id 
            AND user_id = auth.uid()
        )
    );

-- Realtors can update contact request status
CREATE POLICY "Users can update contact requests for own listings" ON public.contact_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.listings 
            WHERE id = listing_id 
            AND user_id = auth.uid()
        )
    );

-- ============================================
-- NOTIFICATION SETTINGS TABLE
-- ============================================
CREATE TABLE public.notification_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    immediate_email BOOLEAN NOT NULL DEFAULT true,
    daily_digest BOOLEAN NOT NULL DEFAULT false,
    weekly_digest BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- Users can view their own notification settings
CREATE POLICY "Users can view own notification settings" ON public.notification_settings
    FOR SELECT USING (user_id = auth.uid());

-- Users can insert their own notification settings
CREATE POLICY "Users can insert own notification settings" ON public.notification_settings
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own notification settings
CREATE POLICY "Users can update own notification settings" ON public.notification_settings
    FOR UPDATE USING (user_id = auth.uid());

-- ============================================
-- STORAGE BUCKET FOR LISTING IMAGES
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-images', 'listing-images', true);

-- Storage policies for listing images
CREATE POLICY "Public can view listing images" ON storage.objects
    FOR SELECT USING (bucket_id = 'listing-images');

CREATE POLICY "Authenticated users can upload listing images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'listing-images' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Users can update own listing images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'listing-images' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Users can delete own listing images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'listing-images' 
        AND auth.role() = 'authenticated'
    );

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_realtor_profiles_updated_at
    BEFORE UPDATE ON public.realtor_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_listings_updated_at
    BEFORE UPDATE ON public.listings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at
    BEFORE UPDATE ON public.notification_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- FUNCTION TO AUTO-CREATE PROFILE ON SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Create realtor profile
    INSERT INTO public.realtor_profiles (id, name, email)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''), NEW.email);
    
    -- Create default notification settings
    INSERT INTO public.notification_settings (user_id)
    VALUES (NEW.id);
    
    -- Assign admin role (first user is admin, or all users for this single-realtor app)
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_listings_user_id ON public.listings(user_id);
CREATE INDEX idx_listings_published ON public.listings(published);
CREATE INDEX idx_listings_slug ON public.listings(slug);
CREATE INDEX idx_listings_city ON public.listings(city);
CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_listing_images_listing_id ON public.listing_images(listing_id);
CREATE INDEX idx_events_listing_id ON public.events(listing_id);
CREATE INDEX idx_events_created_at ON public.events(created_at);
CREATE INDEX idx_contact_requests_listing_id ON public.contact_requests(listing_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);