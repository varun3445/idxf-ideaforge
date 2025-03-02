
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { query, userSkills, userLocation } = await req.json();

    if (!query || typeof query !== 'string') {
      throw new Error('Query parameter is required');
    }

    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    // Call OpenAI API to enhance the search query
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
            content: 'You are a search query processor for a creative collaboration platform. Extract the key themes, skills, and requirements from the user query to enhance search relevance.'
          },
          { 
            role: 'user', 
            content: `Analyze this search query for a creative collaboration platform: "${query}". Extract relevant skills, themes, and requirements.` 
          }
        ],
        temperature: 0.3,
        max_tokens: 150,
      }),
    });

    const data = await response.json();
    const enhancedQuery = data.choices[0].message.content;
    
    // Create mock search results based on the query
    // In a real implementation, this would query your database
    const mockPeople = [
      {
        id: "p1",
        name: "Sarah Johnson",
        bio: "UX designer specializing in user research and wireframing",
        skills: ["UX Design", "Wireframing", "User Research"],
        match_percentage: 85
      },
      {
        id: "p2",
        name: "Michael Chen",
        bio: "Full-stack developer with 5 years of experience in React and Node.js",
        skills: ["React", "Node.js", "JavaScript", "TypeScript"],
        match_percentage: 92
      },
      {
        id: "p3",
        name: "Jessica Williams",
        bio: "Graphic designer and illustrator with a background in brand identity",
        skills: ["Graphic Design", "Illustration", "Brand Design"],
        match_percentage: 78
      }
    ];
    
    const mockProjects = [
      {
        id: "proj1",
        title: "E-commerce Platform Redesign",
        description: "Looking for a UX designer and frontend developer to collaborate on redesigning an e-commerce platform",
        skills_required: ["UX Design", "Frontend Development", "React"],
        match_percentage: 88
      },
      {
        id: "proj2",
        title: "Mobile App Development",
        description: "Seeking developers experienced in React Native for a new fitness tracking application",
        skills_required: ["React Native", "Mobile Development", "API Integration"],
        match_percentage: 75
      }
    ];
    
    // Filter mock results based on query content
    // This is simplistic - a real implementation would use more sophisticated matching
    const query_lower = query.toLowerCase();
    const filtered_people = mockPeople.filter(person => 
      person.name.toLowerCase().includes(query_lower) || 
      person.bio.toLowerCase().includes(query_lower) ||
      person.skills.some(skill => skill.toLowerCase().includes(query_lower))
    );
    
    const filtered_projects = mockProjects.filter(project =>
      project.title.toLowerCase().includes(query_lower) ||
      project.description.toLowerCase().includes(query_lower) ||
      project.skills_required.some(skill => skill.toLowerCase().includes(query_lower))
    );

    return new Response(JSON.stringify({ 
      originalQuery: query,
      enhancedQuery,
      people: filtered_people,
      projects: filtered_projects,
      success: true 
    }), {
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
