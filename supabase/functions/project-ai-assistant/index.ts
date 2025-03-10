
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
    const { title, description, requestType } = await req.json();
    
    if (!title || !description) {
      throw new Error('Title and description are required');
    }
    
    let prompt;
    
    if (requestType === 'steps') {
      prompt = `Based on the following project details, suggest 3-5 main steps needed to complete the project. Format the response as JSON with an array of steps objects, each with "title" and "description" fields. Do not include any explanations outside the JSON.
      
Project Title: ${title}
Project Description: ${description}

Example response format:
{
  "steps": [
    {
      "title": "Step 1 Title",
      "description": "Step 1 description"
    },
    {
      "title": "Step 2 Title",
      "description": "Step 2 description"
    }
  ]
}`;
    } else if (requestType === 'team') {
      prompt = `Based on the following project details, suggest 2-4 roles or specialists who would be valuable to have on the team to complete this project. Format the response as JSON with an array of team member objects, each with "role" and "skills" fields. Do not include any explanations outside the JSON.
      
Project Title: ${title}
Project Description: ${description}

Example response format:
{
  "team": [
    {
      "role": "Role/Position Title",
      "skills": "Brief description of skills and responsibilities"
    },
    {
      "role": "Another Role/Position",
      "skills": "Brief description of skills and responsibilities"
    }
  ]
}`;
    } else {
      throw new Error('Invalid request type');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that generates structured project planning information.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Try to parse JSON from the response
    try {
      // Find JSON in the response (in case there's text before or after)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      const parsedData = JSON.parse(jsonString);
      
      return new Response(JSON.stringify(parsedData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('Error parsing JSON from OpenAI response:', parseError);
      console.log('Raw content:', content);
      
      // Return a structured error response
      return new Response(JSON.stringify({ 
        error: 'Failed to parse AI response',
        rawContent: content
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in project-ai-assistant function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
