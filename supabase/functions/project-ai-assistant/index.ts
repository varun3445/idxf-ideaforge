
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
    const { action, projectInfo } = await req.json();
    
    let systemPrompt = '';
    let userPrompt = '';
    
    if (action === 'suggestSteps') {
      systemPrompt = 'You are a project management expert. Create a structured list of project steps for the given project title and description.';
      userPrompt = `Project Title: ${projectInfo.title}\nProject Description: ${projectInfo.description || 'No description provided'}\n\nPlease suggest a comprehensive list of 4-5 main steps needed to complete this project. For each step, provide a title and brief description.`;
    } else if (action === 'suggestTeam') {
      systemPrompt = 'You are a team composition expert. Recommend team roles needed for completing a project based on the project description.';
      userPrompt = `Project Title: ${projectInfo.title}\nProject Description: ${projectInfo.description || 'No description provided'}\n\nPlease suggest 3-4 key team roles/collaborators needed to successfully complete this project. For each role, provide a title and brief explanation of their responsibilities.`;
    } else {
      throw new Error('Invalid action specified');
    }

    console.log(`Making OpenAI request for action: ${action}`);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }
    
    const generatedContent = data.choices[0].message.content;
    console.log('Generated content:', generatedContent);

    return new Response(JSON.stringify({ result: generatedContent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in project-ai-assistant function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
