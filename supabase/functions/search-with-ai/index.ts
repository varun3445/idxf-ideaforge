
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
            Analyze the user's search query and find relevant profiles based on skills, location, or other criteria.
            For each profile, calculate a match percentage (0-100) based on how well it matches the query.
            Return a JSON object with two properties:
            1. "matchingProfiles": an array of objects with "id" and "matchScore" (percentage as a number)
            2. "searchExplanation": a brief explanation of how you interpreted the search`
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

    // Extract the JSON response from OpenAI
    const content = data.choices[0].message.content.trim();
    let aiResponse;
    
    try {
      // Try to parse the response as JSON
      aiResponse = JSON.parse(content);
      
      // Ensure the expected properties exist
      if (!aiResponse.matchingProfiles || !Array.isArray(aiResponse.matchingProfiles)) {
        throw new Error('Response does not contain matchingProfiles array');
      }
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      console.log('Raw response:', content);
      
      // Return a simple error response
      return new Response(JSON.stringify({ 
        error: 'Failed to parse AI response',
        matchingProfiles: [],
        searchExplanation: 'Error processing your search'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }

    return new Response(JSON.stringify(aiResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in search-with-ai function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      matchingProfiles: [],
      searchExplanation: 'An error occurred while processing your search'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
