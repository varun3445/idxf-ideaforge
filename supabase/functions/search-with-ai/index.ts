import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

// Set up CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface UserProfile {
  id: string;
  name: string;
  email: string;
  location: string;
  skills: string[];
}

interface SearchBody {
  query: string;
  profiles: UserProfile[];
  userLocation?: string | null;
}

interface ProfileMatch {
  id: string;
  matchScore: number;
  reasons: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract request data
    const requestData: SearchBody = await req.json();
    const { query, profiles, userLocation } = requestData;
    
    if (!query || !profiles || !Array.isArray(profiles)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    console.log(`Search query: "${query}" with ${profiles.length} profiles`);
    
    // Process the search query to identify key terms
    const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
    const locationTerms: string[] = [];
    const skillTerms: string[] = [];
    
    // Try to separate location terms from skill terms
    queryTerms.forEach(term => {
      const isLocationIndicator = ['in', 'at', 'near', 'from'].includes(term);
      const nextTermIndex = queryTerms.indexOf(term) + 1;
      
      if (isLocationIndicator && nextTermIndex < queryTerms.length) {
        // The term after a location indicator is likely a location
        locationTerms.push(queryTerms[nextTermIndex]);
      } else if (!isLocationIndicator) {
        // Filter out common words and keep potential skill terms
        if (!['the', 'and', 'with', 'for', 'any', 'anyone', 'someone'].includes(term)) {
          skillTerms.push(term);
        }
      }
    });
    
    console.log(`Identified terms - Locations: ${locationTerms.join(', ')} | Skills: ${skillTerms.join(', ')}`);
    
    // If "anyone" or similar generic terms are used with a location, prioritize location matching
    const isGenericPersonSearch = query.toLowerCase().includes('anyone') || 
                                query.toLowerCase().includes('someone') ||
                                query.toLowerCase().includes('people');
    
    // Match profiles using our own algorithm instead of calling an external API
    const matchingProfiles: ProfileMatch[] = profiles.map(profile => {
      let matchScore = 0;
      const reasons: string[] = [];
      
      // Location matching
      const profileLocation = profile.location.toLowerCase();
      const hasLocationMatch = locationTerms.some(term => 
        profileLocation.includes(term) || 
        (userLocation && profileLocation.includes(userLocation.toLowerCase()))
      );
      
      // Check for location match to prioritize profiles from that location
      if (hasLocationMatch) {
        matchScore += 60; // Significant boost for location match
        reasons.push(`Location matches "${locationTerms.join(', ')}"`);
      }
      
      // Skills matching - only if we have skill terms or it's not just a generic search
      if (skillTerms.length > 0 || !isGenericPersonSearch) {
        const lowerSkills = profile.skills.map(s => s.toLowerCase());
        const matchingSkills = skillTerms.filter(term => 
          lowerSkills.some(skill => skill.includes(term) || term.includes(skill))
        );
        
        if (matchingSkills.length > 0) {
          // Calculate skill match percentage
          const skillMatchPercentage = (matchingSkills.length / skillTerms.length) * 100;
          matchScore += skillMatchPercentage;
          reasons.push(`Skills match: ${matchingSkills.join(', ')}`);
        }
      } else if (isGenericPersonSearch && hasLocationMatch) {
        // For generic searches like "anyone in India", give them a full 100% if location matches
        matchScore = 100;
        reasons.push('Matches location search for any creative');
      }
      
      return {
        id: profile.id,
        matchScore: Math.min(100, matchScore), // Cap at 100%
        reasons
      };
    }).filter(profile => profile.matchScore > 0);
    
    // Sort by matchScore (highest first) and limit to 10 results
    matchingProfiles.sort((a, b) => b.matchScore - a.matchScore);
    
    let searchExplanation = '';
    if (matchingProfiles.length > 0) {
      if (locationTerms.length > 0 && skillTerms.length > 0) {
        searchExplanation = `Found ${matchingProfiles.length} creatives matching your search for ${skillTerms.join(', ')} in ${locationTerms.join(', ')}`;
      } else if (locationTerms.length > 0) {
        searchExplanation = `Found ${matchingProfiles.length} creatives in ${locationTerms.join(', ')}`;
      } else if (skillTerms.length > 0) {
        searchExplanation = `Found ${matchingProfiles.length} creatives with skills in ${skillTerms.join(', ')}`;
      } else {
        searchExplanation = `Found ${matchingProfiles.length} creatives matching "${query}"`;
      }
    } else {
      searchExplanation = `No creatives found matching "${query}"`;
    }
    
    console.log(`Returning ${matchingProfiles.length} matches with explanation: ${searchExplanation}`);
    
    return new Response(
      JSON.stringify({ 
        matchingProfiles, 
        searchExplanation 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error processing search request:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process search request', 
        details: error.message 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
