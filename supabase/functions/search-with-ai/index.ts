
// Search with AI edge function - Enhanced with better location matching
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Function to identify location keywords in a search query
function extractLocationKeywords(query: string) {
  const words = query.toLowerCase().split(/\s+/);
  const locationKeywords = ['in', 'from', 'at', 'near', 'around'];
  let locations = [];
  
  for (let i = 0; i < words.length - 1; i++) {
    if (locationKeywords.includes(words[i])) {
      locations.push(words[i+1]);
      // Include potential multi-word location
      if (i < words.length - 2) {
        locations.push(`${words[i+1]} ${words[i+2]}`);
      }
    }
  }
  
  // Common large countries/locations that might be mentioned
  const commonLocations = [
    'india', 'usa', 'uk', 'china', 'japan', 'australia', 'canada', 
    'brazil', 'russia', 'germany', 'france', 'spain', 'italy', 
    'london', 'tokyo', 'delhi', 'mumbai', 'new york', 'singapore'
  ];
  
  for (const location of commonLocations) {
    if (query.toLowerCase().includes(location)) {
      locations.push(location);
    }
  }
  
  return [...new Set(locations)]; // remove duplicates
}

function locationMatchScore(profile: any, locations: string[]) {
  if (!profile.location || !locations.length) return 0;

  const profileLocation = profile.location.toLowerCase();
  
  for (const loc of locations) {
    if (profileLocation.includes(loc.toLowerCase())) {
      return 100; // Perfect location match
    }
  }
  
  // Partial matches
  for (const loc of locations) {
    const parts = loc.split(/\s+/);
    for (const part of parts) {
      if (part.length > 2 && profileLocation.includes(part.toLowerCase())) {
        return 70; // Partial location match
      }
    }
  }
  
  return 0;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { query, profiles, userLocation, potentialLocations } = await req.json()
    
    if (!query) {
      return new Response(
        JSON.stringify({
          matchingProfiles: [],
          searchExplanation: "Please enter a search query to find matching creatives."
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!Array.isArray(profiles) || profiles.length === 0) {
      return new Response(
        JSON.stringify({
          matchingProfiles: [],
          searchExplanation: "No creative profiles are available to search."
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Search query: "${query}" with ${profiles.length} profiles`)
    
    // Extract any location mentions from the query
    let locations = potentialLocations || [];
    if (!locations.length) {
      locations = extractLocationKeywords(query);
    }
    console.log("Detected locations:", locations);
    
    // Simple scoring algorithm with natural language understanding
    const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
    
    const results = profiles.map(profile => {
      let score = 0;
      let matchReasons = [];
      
      // Skill matching
      for (const skill of (profile.skills || [])) {
        for (const term of queryTerms) {
          if (term.length > 2 && skill.toLowerCase().includes(term)) {
            score += 30;
            matchReasons.push(`Has skill matching "${term}"`);
            break;
          }
        }
      }
      
      // Check for direct role/profession mentions
      if (profile.skills && profile.skills.length > 0) {
        const mainSkill = profile.skills[0].toLowerCase();
        if (query.toLowerCase().includes(mainSkill)) {
          score += 40;
          matchReasons.push(`Primary skill "${mainSkill}" matches query`);
        }
      }
      
      // Special handling for "anyone" or "everyone" queries
      if (query.toLowerCase().includes("anyone") || query.toLowerCase().includes("everyone")) {
        score = Math.max(score, 20); // Give some base score
        matchReasons.push("Matched general search for anyone");
      }
      
      // Location matching (boosted priority)
      if (locations.length > 0) {
        const locationScore = locationMatchScore(profile, locations);
        if (locationScore > 0) {
          score += locationScore;
          matchReasons.push(`Location "${profile.location}" matches search location`);
        }
      }
      
      // Normalize score to 0-100 range
      score = Math.min(100, score);
      
      return {
        id: profile.id,
        matchScore: score,
        matchReasons
      };
    });
    
    // Filter out low-scoring results and sort by score
    const matchingProfiles = results
      .filter(result => result.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);
    
    // Generate an explanation based on the query
    let searchExplanation = "";
    
    if (matchingProfiles.length === 0) {
      searchExplanation = `No creatives found matching "${query}". Try different keywords or skills.`;
    } else if (locations.length > 0) {
      searchExplanation = `Showing creatives matching "${query}" with priority on location${locations.length > 1 ? 's' : ''}: ${locations.join(", ")}`;
    } else if (query.toLowerCase().includes("anyone") || query.toLowerCase().includes("everyone")) {
      searchExplanation = `Showing all available creatives${locations.length > 0 ? ' with priority on location matches' : ''}.`;
    } else {
      searchExplanation = `Showing creatives matching "${query}" based on skills and expertise.`;
    }
    
    console.log(`Found ${matchingProfiles.length} matching profiles`);

    // Return the sorted and filtered profiles along with an explanation
    return new Response(
      JSON.stringify({
        matchingProfiles,
        searchExplanation
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in search-with-ai function:', error);
    return new Response(
      JSON.stringify({
        error: 'An error occurred while processing your search',
        details: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
