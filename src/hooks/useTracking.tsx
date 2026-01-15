import { useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TrackingData {
  listingId?: string;
  eventType: 'page_view' | 'contact_click' | 'schedule_showing' | 'outbound_click';
  pagePath?: string;
}

function getSessionId(): string {
  let sessionId = sessionStorage.getItem('tracking_session_id');
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    sessionStorage.setItem('tracking_session_id', sessionId);
  }
  return sessionId;
}

function getUtmParams(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(key => {
    const value = params.get(key);
    if (value) utm[key] = value;
  });
  
  return utm;
}

function getDeviceInfo(): Record<string, string> {
  const ua = navigator.userAgent;
  const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);
  
  return {
    type: isMobile ? 'mobile' : 'desktop',
    userAgent: ua.substring(0, 500),
    language: navigator.language,
    screenWidth: window.screen.width.toString(),
    screenHeight: window.screen.height.toString(),
  };
}

export function useTracking() {
  const hasTrackedPageView = useRef(false);

  const trackEvent = useCallback(async (data: TrackingData) => {
    try {
      await supabase.from('events').insert({
        listing_id: data.listingId || null,
        session_id: getSessionId(),
        event_type: data.eventType,
        referrer: document.referrer || null,
        utm_json: getUtmParams(),
        device_json: getDeviceInfo(),
        page_path: data.pagePath || window.location.pathname,
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }, []);

  const trackPageView = useCallback((listingId?: string) => {
    if (hasTrackedPageView.current) return;
    hasTrackedPageView.current = true;
    
    trackEvent({
      listingId,
      eventType: 'page_view',
    });
  }, [trackEvent]);

  const trackContactClick = useCallback((listingId?: string) => {
    trackEvent({
      listingId,
      eventType: 'contact_click',
    });
  }, [trackEvent]);

  const trackScheduleShowing = useCallback((listingId?: string) => {
    trackEvent({
      listingId,
      eventType: 'schedule_showing',
    });
  }, [trackEvent]);

  const trackOutboundClick = useCallback((listingId?: string, url?: string) => {
    trackEvent({
      listingId,
      eventType: 'outbound_click',
      pagePath: url,
    });
  }, [trackEvent]);

  return {
    trackPageView,
    trackContactClick,
    trackScheduleShowing,
    trackOutboundClick,
  };
}

// Hook for auto-tracking page views on listing pages
export function usePageViewTracking(listingId?: string) {
  const { trackPageView } = useTracking();
  
  useEffect(() => {
    trackPageView(listingId);
  }, [listingId, trackPageView]);
}
