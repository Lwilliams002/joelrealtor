import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Listing } from '@/hooks/useListings';
import { formatPrice } from '@/lib/formatters';
import { supabase } from '@/integrations/supabase/client';

interface ListingsMapProps {
  listings: Listing[];
  onListingHover?: (listingId: string | null) => void;
  hoveredListingId?: string | null;
}

export function ListingsMap({ listings, onListingHover, hoveredListingId }: ListingsMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Mapbox token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        setMapboxToken(data.token);
      } catch (err) {
        console.error('Failed to fetch Mapbox token:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchToken();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    // Calculate center from listings with coordinates
    const listingsWithCoords = listings.filter(l => l.latitude && l.longitude);
    let center: [number, number] = [-106.6504, 35.0844]; // Default to Albuquerque
    let zoom = 10;

    if (listingsWithCoords.length > 0) {
      const avgLat = listingsWithCoords.reduce((sum, l) => sum + (l.latitude || 0), 0) / listingsWithCoords.length;
      const avgLng = listingsWithCoords.reduce((sum, l) => sum + (l.longitude || 0), 0) / listingsWithCoords.length;
      center = [avgLng, avgLat];
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center,
      zoom,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-left');

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  // Update markers when listings change
  useEffect(() => {
    if (!map.current || !mapboxToken) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Add markers for listings with coordinates
    listings.forEach(listing => {
      if (!listing.latitude || !listing.longitude) return;

      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'listing-marker';
      el.innerHTML = `
        <div class="w-3 h-3 bg-foreground rounded-full border-2 border-background shadow-lg cursor-pointer transition-transform hover:scale-150" 
             data-listing-id="${listing.id}">
        </div>
      `;
      el.style.cursor = 'pointer';

      const marker = new mapboxgl.Marker(el)
        .setLngLat([listing.longitude, listing.latitude])
        .addTo(map.current!);

      // Add hover events
      el.addEventListener('mouseenter', () => {
        onListingHover?.(listing.id);
        showPopup(listing);
      });

      el.addEventListener('mouseleave', () => {
        onListingHover?.(null);
        popupRef.current?.remove();
      });

      el.addEventListener('click', () => {
        window.location.href = `/listings/${listing.slug}`;
      });

      markersRef.current[listing.id] = marker;
    });

    // Fit bounds to show all markers
    const listingsWithCoords = listings.filter(l => l.latitude && l.longitude);
    if (listingsWithCoords.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      listingsWithCoords.forEach(l => {
        bounds.extend([l.longitude!, l.latitude!]);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [listings, mapboxToken, onListingHover]);

  // Handle hovered listing from cards
  useEffect(() => {
    if (!map.current) return;

    // If no listing is hovered, remove the popup
    if (!hoveredListingId) {
      popupRef.current?.remove();
      return;
    }

    const listing = listings.find(l => l.id === hoveredListingId);
    if (listing && listing.latitude && listing.longitude) {
      showPopup(listing);
    }
  }, [hoveredListingId, listings]);

  const showPopup = (listing: Listing) => {
    if (!map.current || !listing.latitude || !listing.longitude) return;

    popupRef.current?.remove();

    const defaultImage = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=80";
    
    popupRef.current = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 15,
      className: 'listing-popup',
    })
      .setLngLat([listing.longitude, listing.latitude])
      .setHTML(`
        <div class="bg-card rounded-lg overflow-hidden shadow-xl min-w-[240px]">
          <img src="${listing.cover_image_url || defaultImage}" alt="${listing.title}" class="w-full h-32 object-cover" />
          <div class="p-3">
            <p class="font-semibold text-lg">${formatPrice(listing.price)}</p>
            <p class="text-sm text-muted-foreground">${listing.beds || 0} Bed | ${listing.baths || 0} Bath | ${listing.sqft?.toLocaleString() || 'N/A'} Sqft</p>
            <p class="text-xs text-muted-foreground mt-1 truncate">${listing.address}, ${listing.city}</p>
          </div>
        </div>
      `)
      .addTo(map.current);
  };

  if (isLoading) {
    return (
      <div className="w-full h-full bg-muted flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading map...</div>
      </div>
    );
  }

  if (!mapboxToken) {
    return (
      <div className="w-full h-full bg-muted flex items-center justify-center">
        <p className="text-muted-foreground text-center px-4">
          Map unavailable. Please configure Mapbox token.
        </p>
      </div>
    );
  }

  return (
    <div ref={mapContainer} className="w-full h-full" />
  );
}
