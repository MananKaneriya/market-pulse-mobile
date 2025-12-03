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
    const { title, content, stocks } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Handle single article summary (existing behavior)
    if (title && content) {
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
    }

    // Handle multiple stocks summaries (new behavior)
    if (stocks && Array.isArray(stocks)) {
      const stocksToProcess = stocks.slice(0, 7);
      
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
              content: `You are a professional financial analyst AI. Your ONLY job is to generate high-quality Market Feed summaries.

TASK:
For every stock provided, you MUST generate a professional financial summary of EXACTLY **100 words**. 
Not 99 words. Not 101 words. Exactly 100.

MARKET FEED SUMMARY RULES:
- Each summary must be exactly 100 words.
- Tone: professional, financial-news style.
- Content must mention: the stock's recent performance, investor sentiment, catalysts, risks, and short outlook.
- No bullet points, no lists — use a single clean paragraph.
- No repeated phrases or template-like writing.
- Each summary should be unique and specific to the stock.

OUTPUT FORMAT (strict JSON array):
[
  {"ticker": "TICKER1", "summary": "EXACT 100 WORD SUMMARY"},
  {"ticker": "TICKER2", "summary": "EXACT 100 WORD SUMMARY"}
]

PROCESS:
1. Generate EXACT 100-word summaries for each stock.
2. Output them in the exact JSON array format above.
3. Return ONLY the JSON array, no other text.` 
            },
            { 
              role: 'user', 
              content: `Generate professional 100-word market summaries for these stocks: ${stocksToProcess.map(s => s.symbol || s).join(', ')}\n\nReturn ONLY a valid JSON array with ticker and summary for each stock.` 
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
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('No summaries generated');
      }

      // Parse JSON from response
      try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        const summaries = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
        return new Response(JSON.stringify({ summaries }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (parseError) {
        console.error('Failed to parse AI response:', content);
        throw new Error('Failed to parse summaries');
      }
    }

    throw new Error('Invalid request: provide either title/content or stocks array');
  } catch (error) {
    console.error('Error in generate-summary function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
