
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const { query, profiles } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not set in Supabase environment variables');
    }

    if (!query || !profiles || !Array.isArray(profiles)) {
      throw new Error('Missing required parameters: query or profiles');
    }

    // Prepare structured profile data for the AI
    const structuredProfiles = profiles.map(profile => ({
      id: profile.id,
      name: profile.name,
      location: profile.location,
      skills: profile.skills.join(', ')
    }));

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: `You are an AI assistant helping to find matching profiles for collaboration.
            You will receive a user query and a list of profiles with their skills.
            Return ONLY profile IDs that match the query based on skills, location, or other relevant criteria.
            VERY IMPORTANT: You must respond with a JSON array containing ONLY the matching profile IDs, nothing else.
            If the search is ambiguous, interpret it as a search for skills.`
          },
          { 
            role: 'user', 
            content: `Search query: "${query}"\nAvailable profiles: ${JSON.stringify(structuredProfiles)}`
          }
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from OpenAI');
    }

    // Extract the JSON array of IDs from the response
    const content = data.choices[0].message.content.trim();
    let matchingIds;
    
    try {
      // Try to parse the response as a JSON array
      matchingIds = JSON.parse(content);
      
      // Ensure the response is an array
      if (!Array.isArray(matchingIds)) {
        throw new Error('Response is not an array');
      }
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      
      // Fallback: try to extract array from the text (in case AI included explanation)
      const arrayMatch = content.match(/\[(.*)\]/s);
      if (arrayMatch) {
        try {
          matchingIds = JSON.parse(arrayMatch[0]);
        } catch {
          // If all else fails, return an empty array
          matchingIds = [];
        }
      } else {
        matchingIds = [];
      }
    }

    return new Response(JSON.stringify({ matchingIds }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in search-with-ai function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
