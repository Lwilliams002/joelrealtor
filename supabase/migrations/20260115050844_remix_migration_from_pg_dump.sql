CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'user'
);


--
-- Name: listing_source; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.listing_source AS ENUM (
    'manual',
    'idx',
    'csv'
);


--
-- Name: listing_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.listing_status AS ENUM (
    'for_sale',
    'for_rent',
    'sold',
    'pending'
);


--
-- Name: property_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.property_type AS ENUM (
    'house',
    'condo',
    'townhouse',
    'land',
    'multi_family',
    'commercial',
    'other'
);


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: is_listing_owner(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_listing_owner(_listing_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.listings
    WHERE id = _listing_id
      AND user_id = auth.uid()
  )
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: contact_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    listing_id uuid,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    message text,
    status text DEFAULT 'new'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    listing_id uuid,
    session_id text,
    event_type text NOT NULL,
    referrer text,
    utm_json jsonb DEFAULT '{}'::jsonb,
    device_json jsonb DEFAULT '{}'::jsonb,
    geo_json jsonb DEFAULT '{}'::jsonb,
    page_path text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: listing_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.listing_images (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    listing_id uuid NOT NULL,
    image_url text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: listings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.listings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    zip text NOT NULL,
    price numeric(12,2) NOT NULL,
    beds integer,
    baths numeric(3,1),
    sqft integer,
    lot_size text,
    property_type public.property_type DEFAULT 'house'::public.property_type NOT NULL,
    status public.listing_status DEFAULT 'for_sale'::public.listing_status NOT NULL,
    description text,
    features_json jsonb DEFAULT '[]'::jsonb,
    cover_image_url text,
    source public.listing_source DEFAULT 'manual'::public.listing_source NOT NULL,
    zillow_url text,
    mls_number text,
    latitude numeric(10,8),
    longitude numeric(11,8),
    open_house_schedule jsonb DEFAULT '[]'::jsonb,
    published boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: notification_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_settings (
    user_id uuid NOT NULL,
    immediate_email boolean DEFAULT true NOT NULL,
    daily_digest boolean DEFAULT false NOT NULL,
    weekly_digest boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: realtor_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.realtor_profiles (
    id uuid NOT NULL,
    name text DEFAULT ''::text NOT NULL,
    phone text,
    email text,
    bio text,
    headshot_url text,
    zillow_profile_url text,
    social_links jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role DEFAULT 'user'::public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: contact_requests contact_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_requests
    ADD CONSTRAINT contact_requests_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: listing_images listing_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listing_images
    ADD CONSTRAINT listing_images_pkey PRIMARY KEY (id);


--
-- Name: listings listings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_pkey PRIMARY KEY (id);


--
-- Name: listings listings_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_slug_key UNIQUE (slug);


--
-- Name: notification_settings notification_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_settings
    ADD CONSTRAINT notification_settings_pkey PRIMARY KEY (user_id);


--
-- Name: realtor_profiles realtor_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.realtor_profiles
    ADD CONSTRAINT realtor_profiles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: idx_contact_requests_listing_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contact_requests_listing_id ON public.contact_requests USING btree (listing_id);


--
-- Name: idx_events_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_created_at ON public.events USING btree (created_at);


--
-- Name: idx_events_listing_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_listing_id ON public.events USING btree (listing_id);


--
-- Name: idx_listing_images_listing_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_listing_images_listing_id ON public.listing_images USING btree (listing_id);


--
-- Name: idx_listings_city; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_listings_city ON public.listings USING btree (city);


--
-- Name: idx_listings_published; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_listings_published ON public.listings USING btree (published);


--
-- Name: idx_listings_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_listings_slug ON public.listings USING btree (slug);


--
-- Name: idx_listings_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_listings_status ON public.listings USING btree (status);


--
-- Name: idx_listings_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_listings_user_id ON public.listings USING btree (user_id);


--
-- Name: idx_user_roles_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_roles_user_id ON public.user_roles USING btree (user_id);


--
-- Name: listings update_listings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON public.listings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: notification_settings update_notification_settings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_notification_settings_updated_at BEFORE UPDATE ON public.notification_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: realtor_profiles update_realtor_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_realtor_profiles_updated_at BEFORE UPDATE ON public.realtor_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: contact_requests contact_requests_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_requests
    ADD CONSTRAINT contact_requests_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE SET NULL;


--
-- Name: events events_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE SET NULL;


--
-- Name: listing_images listing_images_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listing_images
    ADD CONSTRAINT listing_images_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: listings listings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: notification_settings notification_settings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_settings
    ADD CONSTRAINT notification_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: realtor_profiles realtor_profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.realtor_profiles
    ADD CONSTRAINT realtor_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: events Anyone can insert events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert events" ON public.events FOR INSERT WITH CHECK (true);


--
-- Name: contact_requests Anyone can submit contact requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can submit contact requests" ON public.contact_requests FOR INSERT WITH CHECK (true);


--
-- Name: listing_images Public can view published listing images; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view published listing images" ON public.listing_images FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.listings
  WHERE ((listings.id = listing_images.listing_id) AND ((listings.published = true) OR (listings.user_id = auth.uid()))))));


--
-- Name: listings Public can view published listings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view published listings" ON public.listings FOR SELECT USING (((published = true) OR (user_id = auth.uid())));


--
-- Name: realtor_profiles Public can view realtor profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view realtor profiles" ON public.realtor_profiles FOR SELECT USING (true);


--
-- Name: listing_images Users can delete images for own listings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete images for own listings" ON public.listing_images FOR DELETE USING (public.is_listing_owner(listing_id));


--
-- Name: listings Users can delete own listings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own listings" ON public.listings FOR DELETE USING ((user_id = auth.uid()));


--
-- Name: listing_images Users can insert images for own listings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert images for own listings" ON public.listing_images FOR INSERT WITH CHECK (public.is_listing_owner(listing_id));


--
-- Name: listings Users can insert own listings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own listings" ON public.listings FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: notification_settings Users can insert own notification settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own notification settings" ON public.notification_settings FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: realtor_profiles Users can insert own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own profile" ON public.realtor_profiles FOR INSERT WITH CHECK ((id = auth.uid()));


--
-- Name: contact_requests Users can update contact requests for own listings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update contact requests for own listings" ON public.contact_requests FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.listings
  WHERE ((listings.id = contact_requests.listing_id) AND (listings.user_id = auth.uid())))));


--
-- Name: listing_images Users can update images for own listings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update images for own listings" ON public.listing_images FOR UPDATE USING (public.is_listing_owner(listing_id));


--
-- Name: listings Users can update own listings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own listings" ON public.listings FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: notification_settings Users can update own notification settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own notification settings" ON public.notification_settings FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: realtor_profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.realtor_profiles FOR UPDATE USING ((id = auth.uid()));


--
-- Name: contact_requests Users can view contact requests for own listings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view contact requests for own listings" ON public.contact_requests FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.listings
  WHERE ((listings.id = contact_requests.listing_id) AND (listings.user_id = auth.uid())))));


--
-- Name: events Users can view events for own listings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view events for own listings" ON public.events FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.listings
  WHERE ((listings.id = events.listing_id) AND (listings.user_id = auth.uid())))));


--
-- Name: notification_settings Users can view own notification settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own notification settings" ON public.notification_settings FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: user_roles Users can view own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: contact_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

--
-- Name: events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

--
-- Name: listing_images; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;

--
-- Name: listings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

--
-- Name: notification_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: realtor_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.realtor_profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;