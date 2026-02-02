import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get catalmsp credentials from secrets
    const catalmspUrl = Deno.env.get('CATALMSP_SUPABASE_URL');
    const catalmspAnonKey = Deno.env.get('CATALMSP_SUPABASE_ANON_KEY');

    if (!catalmspUrl || !catalmspAnonKey) {
      console.error('Missing CATALMSP credentials');
      return new Response(
        JSON.stringify({ error: 'Configuration error: catalmsp credentials not found' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create client for catalmsp database
    const catalmspClient = createClient(catalmspUrl, catalmspAnonKey);

    // Fetch sites_conventionnes from catalmsp
    const { data: sites, error } = await catalmspClient
      .from('sites_conventionnes')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching sites:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch sites', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ sites }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
