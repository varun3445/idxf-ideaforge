
// Follow Supabase Edge Function format
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

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
    const { projectId } = await req.json()
    
    if (!projectId) {
      return new Response(
        JSON.stringify({ error: 'Project ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    
    // Get user ID from auth
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }
    
    // Verify that user is the project owner or a collaborator
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()
    
    if (projectError || !project) {
      return new Response(
        JSON.stringify({ error: 'Project not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }
    
    // If there's no share_code, generate one and update the project
    if (!project.share_code) {
      const shareCode = crypto.randomUUID().substring(0, 8)
      
      const { error: updateError } = await supabaseClient
        .from('projects')
        .update({ share_code: shareCode })
        .eq('id', projectId)
      
      if (updateError) {
        return new Response(
          JSON.stringify({ error: 'Failed to generate share code' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }
      
      project.share_code = shareCode
    }
    
    // Generate QR code URL for the share code
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      `${Deno.env.get('PUBLIC_URL') || 'http://localhost:5173'}/join/${project.share_code}`
    )}`
    
    // Return the QR code URL and share code
    return new Response(
      JSON.stringify({ 
        qrCodeUrl,
        shareCode: project.share_code,
        shareUrl: `${Deno.env.get('PUBLIC_URL') || 'http://localhost:5173'}/join/${project.share_code}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error generating QR code:', error)
    
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
