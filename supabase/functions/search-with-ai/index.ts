
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.3.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface UserWithSkills {
  id: string;
  name: string;
  location: string;
  avatar: string | null;
  skills: string[];
}

// Function to extract skills or roles from a natural language query
const extractSkillsOrRoles = (query: string): string[] => {
  // Common skills or roles that might be mentioned in queries
  const commonSkills = [
    'developer', 'designer', 'artist', 'writer', 'marketing', 
    'react', 'javascript', 'typescript', 'python', 'java', 
    'figma', 'illustrator', 'photoshop', 'ui', 'ux', 
    'copywriting', 'content creation', 'video', 'photography',
    'web', 'mobile', 'graphic design', 'branding', 'illustration'
  ];
  
  const queryLower = query.toLowerCase();
  return commonSkills.filter(skill => queryLower.includes(skill.toLowerCase()));
};

// Detect the intent of the query
const detectQueryIntent = (query: string): 'skill' | 'location' | 'name' | 'general' => {
  const queryLower = query.toLowerCase();
  
  if (queryLower.includes('skill') || 
      queryLower.includes('good at') || 
      queryLower.includes('expertise') ||
      queryLower.includes('who can') ||
      queryLower.includes('who knows')) {
    return 'skill';
  }
  
  if (queryLower.includes('location') || 
      queryLower.includes('based in') || 
      queryLower.includes('live in') ||
      queryLower.includes('from')) {
    return 'location';
  }
  
  if (queryLower.includes('name') || 
      queryLower.includes('called') || 
      queryLower.includes('named')) {
    return 'name';
  }
  
  return 'general';
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Setup OpenAI
    const configuration = new Configuration({
      apiKey: Deno.env.get("OPENAI_API_KEY"),
    });
    const openai = new OpenAIApi(configuration);

    // Extract the search query from the request
    const { query } = await req.json();

    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Detect query intent and extract any explicit skills
    const queryIntent = detectQueryIntent(query);
    const extractedSkills = extractSkillsOrRoles(query);
    
    // Fetch all users with their skills
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, location, avatar');
      
    if (profilesError) {
      throw profilesError;
    }

    const { data: userSkills, error: skillsError } = await supabase
      .from('user_skills')
      .select('user_id, skills(name)');
      
    if (skillsError) {
      throw skillsError;
    }

    // Combine profiles with their skills
    const usersWithSkills: UserWithSkills[] = profiles.map(profile => {
      const skills = userSkills
        .filter(skill => skill.user_id === profile.id)
        .map(skill => skill.skills.name);
        
      return {
        ...profile,
        skills,
      };
    });

    // Use OpenAI to process the query and rank users
    let prompt = `I need to search for users matching the query: "${query}".\n\n`;
    prompt += `Here is a list of users with their skills and locations:\n\n`;
    
    usersWithSkills.forEach(user => {
      prompt += `User ID: ${user.id}\n`;
      prompt += `Name: ${user.name}\n`;
      prompt += `Location: ${user.location}\n`;
      prompt += `Skills: ${user.skills.join(', ')}\n\n`;
    });
    
    prompt += `Based on the query, rank the top 5 most relevant users in order of relevance. `;
    prompt += `Return their IDs in a JSON array format like this: ["id1", "id2", "id3", "id4", "id5"]. `;
    prompt += `If fewer than 5 users are relevant, return fewer IDs.`;

    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      max_tokens: 400,
      temperature: 0.3,
    });

    let rankedUserIds = [];

    try {
      // Try to extract the JSON array from the completion
      const text = completion.data.choices[0].text?.trim() || '';
      const match = text.match(/\[.*?\]/s);
      
      if (match) {
        rankedUserIds = JSON.parse(match[0]);
      }
    } catch (error) {
      console.error('Error parsing OpenAI output:', error);
    }

    // As a fallback or to improve results, do our own scoring
    // This improves results and handles cases where OpenAI output isn't properly formatted
    const scoredUsers = usersWithSkills.map(user => {
      let score = 0;
      
      // Score based on intent
      if (queryIntent === 'skill') {
        extractedSkills.forEach(skill => {
          if (user.skills.some(userSkill => 
            userSkill.toLowerCase().includes(skill.toLowerCase()))) {
            score += 5;
          }
        });
      } else if (queryIntent === 'location') {
        const locationTerms = query.toLowerCase().split(/\s+/);
        if (locationTerms.some(term => 
          user.location.toLowerCase().includes(term) && term.length > 2)) {
          score += 5;
        }
      } else if (queryIntent === 'name') {
        const nameTerms = query.toLowerCase().split(/\s+/);
        if (nameTerms.some(term => 
          user.name.toLowerCase().includes(term) && term.length > 2)) {
          score += 5;
        }
      }
      
      // Generic matching (lower priority than intent-based matching)
      const queryLower = query.toLowerCase();
      if (user.name.toLowerCase().includes(queryLower)) {
        score += 3;
      }
      
      if (user.location.toLowerCase().includes(queryLower)) {
        score += 2;
      }
      
      user.skills.forEach(skill => {
        if (skill.toLowerCase().includes(queryLower)) {
          score += 3;
        }
      });
      
      return { user, score };
    });
    
    // Sort users by score descending
    scoredUsers.sort((a, b) => b.score - a.score);
    
    // Get top 10 users by score
    const topScoredUsers = scoredUsers
      .filter(item => item.score > 0)
      .slice(0, 10)
      .map(item => item.user.id);
    
    // Merge OpenAI rankings with our own scoring
    let finalRankedIds = [...new Set([...rankedUserIds, ...topScoredUsers])].slice(0, 10);

    // Get the full user data for the ranked IDs
    const rankedUsers = finalRankedIds.map(id => 
      usersWithSkills.find(user => user.id === id)
    ).filter(Boolean);

    return new Response(
      JSON.stringify({ users: rankedUsers }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
