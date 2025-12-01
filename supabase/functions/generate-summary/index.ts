import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, content } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: `You are an expert financial content generator. 
Your ONLY responsibility is to generate a Market Feed summary that is EXACTLY 100 WORDS. 
Not 99, not 101 — EXACTLY 100 words. No exceptions.

INSTRUCTIONS FOR MARKET FEED SUMMARY:
- The summary must be EXACTLY 100 words.
- Use a professional financial-news tone.
- Include: 
  • a headline-style opening sentence,
  • 2–3 sentences covering market reaction, performance, or financial context,
  • 1–2 sentences about risks or opportunities,
  • a short concluding outlook.
- No bullet points.
- No lists.
- No extra spaces or hidden characters.
- Do NOT include the word count in the summary.
- After writing the summary, count the words and ensure it's exactly 100.

BEFORE OUTPUTTING:
- Count the words yourself.
- If the summary is NOT exactly 100 words, REWRITE it until it IS exactly 100 words.
- Only output once the summary is exactly 100 words.` 
          },
          { 
            role: 'user', 
            content: `Generate a financial analysis summary of EXACTLY 100 words for this article:\n\nTitle: ${title}\n\nContent: ${content}\n\nMake sure the summary is exactly 100 words - no more, no less.` 
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded, please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required, please add credits to your Lovable AI workspace.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'AI gateway error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content;

    if (!summary) {
      throw new Error('No summary generated');
    }

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-summary function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
