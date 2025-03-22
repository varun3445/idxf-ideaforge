
// Search with AI edge function - Enhanced with better location matching and natural language processing
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

// Function to extract potential skills or roles from natural language query
function extractSkillsAndRoles(query: string) {
  // Common creative skills and roles
  const commonSkills = [
    'design', 'developer', 'writer', 'artist', 'photographer', 'videographer',
    'marketing', 'illustrator', 'content creator', 'programmer', 'director',
    'editor', 'producer', 'animator', 'ui', 'ux', 'graphic', 'web', 'mobile',
    'react', 'javascript', 'typescript', 'python', 'php', 'ruby', 'coding',
    'video', 'photo', 'social media', 'branding', 'strategy', 'product',
    'project manager', 'consultant', 'advisor', 'mentor', 'coach', 'teacher',
    'speaker', 'presenter', 'host', 'model', 'actor', 'actress', 'influencer'
  ];
  
  const queryLower = query.toLowerCase();
  return commonSkills.filter(skill => queryLower.includes(skill));
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

// Process natural language queries to extract intent
function processNaturalLanguageQuery(query: string) {
  const queryLower = query.toLowerCase();
  
  // Check for intent patterns
  const findCollaboratorPatterns = [
    'looking for', 'need a', 'find me', 'who can', 'searching for',
    'want to work with', 'collaborate with', 'partner with'
  ];
  
  const isCollaboratorQuery = findCollaboratorPatterns.some(pattern => 
    queryLower.includes(pattern)
  );
  
  const locations = extractLocationKeywords(query);
  const skills = extractSkillsAndRoles(query);
  
  console.log('Query intent analysis:', {
    isCollaboratorQuery,
    extractedLocations: locations,
    extractedSkills: skills
  });
  
  return {
    isCollaboratorQuery,
    locations,
    skills
  };
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
    
    // Process natural language query
    const { isCollaboratorQuery, locations, skills } = processNaturalLanguageQuery(query);
    
    // Use extracted locations or fallback to provided potentialLocations
    let searchLocations = locations.length > 0 ? locations : (potentialLocations || []);
    console.log("Detected locations:", searchLocations);
    console.log("Detected skills:", skills);
    
    // Simple scoring algorithm with natural language understanding
    const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
    
    const results = profiles.map(profile => {
      let score = 0;
      let matchReasons = [];
      
      // Skill matching - enhanced with extracted skills
      const profileSkills = profile.skills || [];
      
      // Check explicit skills mentioned in the query
      if (skills.length > 0) {
        for (const skill of skills) {
          if (profileSkills.some(ps => ps.toLowerCase().includes(skill.toLowerCase()))) {
            score += 40;
            matchReasons.push(`Has "${skill}" skill that matches your query`);
          }
        }
      }
      
      // Also check for general term matches in skills
      for (const skill of profileSkills) {
        for (const term of queryTerms) {
          if (term.length > 2 && skill.toLowerCase().includes(term)) {
            score += 20;
            matchReasons.push(`Has skill matching "${term}"`);
            break;
          }
        }
      }
      
      // Check for direct role/profession mentions
      if (profileSkills && profileSkills.length > 0) {
        const mainSkill = profileSkills[0].toLowerCase();
        if (query.toLowerCase().includes(mainSkill)) {
          score += 30;
          matchReasons.push(`Primary skill "${mainSkill}" matches query`);
        }
      }
      
      // Special handling for "anyone" or "everyone" queries
      if (query.toLowerCase().includes("anyone") || query.toLowerCase().includes("everyone")) {
        score = Math.max(score, 20); // Give some base score
        matchReasons.push("Matched general search for anyone");
      }
      
      // Add bonus for collaborator-intent queries with matching skills
      if (isCollaboratorQuery && score > 0) {
        score += 15;
        matchReasons.push("Matches collaboration intent");
      }
      
      // Location matching (boosted priority)
      if (searchLocations.length > 0) {
        const locationScore = locationMatchScore(profile, searchLocations);
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
    
    // Generate an explanation based on the query and analysis
    let searchExplanation = "";
    
    if (matchingProfiles.length === 0) {
      searchExplanation = `No creatives found matching "${query}". Try different keywords, skills, or phrasing your question differently.`;
    } else if (isCollaboratorQuery) {
      searchExplanation = `Showing potential collaborators matching "${query}" based on the skills and expertise you're looking for.`;
    } else if (searchLocations.length > 0) {
      searchExplanation = `Showing creatives matching "${query}" with priority on location${searchLocations.length > 1 ? 's' : ''}: ${searchLocations.join(", ")}`;
    } else if (skills.length > 0) {
      searchExplanation = `Showing creatives with skills in: ${skills.join(", ")}`;
    } else if (query.toLowerCase().includes("anyone") || query.toLowerCase().includes("everyone")) {
      searchExplanation = `Showing all available creatives${searchLocations.length > 0 ? ' with priority on location matches' : ''}.`;
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
