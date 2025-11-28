import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

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
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const { 
      dietary_preferences, 
      allergies, 
      cuisine_preference, 
      meal_type, 
      cooking_time, 
      difficulty_level,
      available_ingredients 
    } = await req.json();

    console.log('Generating meal suggestions with preferences:', {
      dietary_preferences,
      allergies,
      cuisine_preference,
      meal_type,
      cooking_time,
      difficulty_level
    });

    // Create detailed prompt for Gemini
    const prompt = `You are a professional nutritionist and chef assistant for SmartEats. Generate 3 personalized meal suggestions based on these preferences:

Dietary Preferences: ${dietary_preferences || 'None specified'}
Allergies/Restrictions: ${allergies || 'None'}
Cuisine Preference: ${cuisine_preference || 'Any'}
Meal Type: ${meal_type || 'Dinner'}
Cooking Time: ${cooking_time || '30 minutes'}
Difficulty Level: ${difficulty_level || 'Medium'}
Available Ingredients: ${available_ingredients || 'Common pantry items'}

For each meal suggestion, provide:
1. Recipe name
2. Brief description (2-3 sentences)
3. Estimated cooking time
4. Difficulty level (Easy/Medium/Hard)
5. Key ingredients (5-7 main items)
6. Basic cooking instructions (4-5 steps)
7. Nutritional highlights (calories, protein, key vitamins/minerals)
8. Why this meal fits their preferences

Format the response as a JSON array with exactly 3 meal objects. Each object should have these properties:
- name: string
- description: string
- cookingTime: string
- difficulty: string
- ingredients: array of strings
- instructions: array of strings
- nutrition: object with calories, protein, highlights
- whyRecommended: string

Ensure meals are practical, healthy, and match the specified preferences exactly.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini API response:', JSON.stringify(data, null, 2));

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response format from Gemini API');
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Parse the JSON response from Gemini
    let mealSuggestions;
    try {
      // Clean the response and parse JSON
      const cleanText = generatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      mealSuggestions = JSON.parse(cleanText);
      
      // Validate the response structure
      if (!Array.isArray(mealSuggestions) || mealSuggestions.length !== 3) {
        throw new Error('Invalid meal suggestions format');
      }
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      console.error('Raw response:', generatedText);
      
      // Fallback: create structured response from text
      mealSuggestions = [{
        name: "Personalized Meal Suggestion",
        description: "A nutritious meal tailored to your preferences based on AI analysis.",
        cookingTime: cooking_time || "30 minutes",
        difficulty: difficulty_level || "Medium",
        ingredients: ["Fresh ingredients", "Pantry staples", "Seasonal produce"],
        instructions: ["Prepare ingredients", "Follow cooking method", "Serve and enjoy"],
        nutrition: {
          calories: "400-600",
          protein: "20-30g",
          highlights: "Balanced macro and micronutrients"
        },
        whyRecommended: "This meal matches your dietary preferences and cooking constraints."
      }];
    }

    return new Response(JSON.stringify({ 
      success: true,
      mealSuggestions,
      preferences: {
        dietary_preferences,
        allergies,
        cuisine_preference,
        meal_type,
        cooking_time,
        difficulty_level
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-meal-suggestions function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      fallbackSuggestions: [{
        name: "Quick Healthy Bowl",
        description: "A simple, nutritious bowl with fresh ingredients.",
        cookingTime: "15 minutes",
        difficulty: "Easy",
        ingredients: ["Mixed greens", "Protein of choice", "Seasonal vegetables", "Healthy dressing"],
        instructions: ["Wash and prepare vegetables", "Cook protein if needed", "Combine in bowl", "Add dressing and serve"],
        nutrition: {
          calories: "350-500",
          protein: "15-25g",
          highlights: "High fiber, vitamins, and minerals"
        },
        whyRecommended: "Quick, healthy, and customizable to your preferences."
      }]
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});