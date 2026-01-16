import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const token = Deno.env.get('MAPBOX_ACCESS_TOKEN')
    
    if (!token) {
      throw new Error('MAPBOX_ACCESS_TOKEN not configured')
    }

    const { address, city, state, zip } = await req.json()
    
    if (!address || !city || !state) {
      throw new Error('Address, city, and state are required')
    }

    const fullAddress = `${address}, ${city}, ${state} ${zip || ''}`.trim()
    const encodedAddress = encodeURIComponent(fullAddress)
    
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${token}&limit=1`
    )
    
    if (!response.ok) {
      throw new Error('Geocoding request failed')
    }
    
    const data = await response.json()
    
    if (!data.features || data.features.length === 0) {
      return new Response(
        JSON.stringify({ latitude: null, longitude: null, error: 'Address not found' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }
    
    const [longitude, latitude] = data.features[0].center
    
    return new Response(
      JSON.stringify({ latitude, longitude }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
