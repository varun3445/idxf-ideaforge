
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
    const { shareCode } = await req.json()
    
    if (!shareCode) {
      return new Response(
        JSON.stringify({ error: 'Share code is required' }),
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
    
    // Find the project with the given share code
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .select('*')
      .eq('share_code', shareCode)
      .single()
    
    if (projectError || !project) {
      return new Response(
        JSON.stringify({ error: 'Invalid share code' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }
    
    // Check if the user is already a collaborator or the owner
    if (project.owner_id === user.id) {
      return new Response(
        JSON.stringify({ message: 'You are the owner of this project', project }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const { data: existingCollaborator, error: collabError } = await supabaseClient
      .from('project_collaborators')
      .select('*')
      .eq('project_id', project.id)
      .eq('user_id', user.id)
      .maybeSingle()
    
    if (existingCollaborator) {
      return new Response(
        JSON.stringify({ message: 'You are already a collaborator on this project', project }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Add the user as a collaborator
    const { error: insertError } = await supabaseClient
      .from('project_collaborators')
      .insert({
        project_id: project.id,
        user_id: user.id
      })
    
    if (insertError) {
      return new Response(
        JSON.stringify({ error: 'Failed to join project' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    return new Response(
      JSON.stringify({ 
        message: 'Successfully joined project',
        project
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error joining project:', error)
    
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
