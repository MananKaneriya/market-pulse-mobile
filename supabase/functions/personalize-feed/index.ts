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
    const { articles, selectedStocks, readingHistory } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Create a context about user preferences
    const stockContext = selectedStocks.length > 0 
      ? `User's portfolio stocks: ${selectedStocks.join(', ')}`
      : 'User has no selected stocks yet';
    
    const historyContext = readingHistory.length > 0
      ? `Recently read articles about: ${readingHistory.map((h: any) => `${h.article_stock} (${h.article_title.substring(0, 50)}...)`).slice(0, 5).join(', ')}`
      : 'No reading history available';

    // Build article summaries for AI to analyze
    const articleSummaries = articles.map((article: any, index: number) => 
      `[${index}] ${article.stock}: ${article.title}`
    ).join('\n');

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
            content: `You are a personalized news ranking AI for a stock market app. Your job is to rank articles based on user preferences and reading history.

RANKING CRITERIA:
1. Prioritize articles about stocks in the user's portfolio (highest priority)
2. Consider reading history patterns - which stocks/topics they engage with most
3. Look for topic continuity - if they read about earnings, show more earnings news
4. Balance between user's interests and important market news
5. Avoid showing only one stock if they have multiple in their portfolio

OUTPUT FORMAT:
Return ONLY a JSON array of article indices in ranked order (most relevant first).
Example: [2, 5, 0, 1, 3, 4]

Do not include any explanation, just the JSON array.` 
          },
          { 
            role: 'user', 
            content: `${stockContext}\n\n${historyContext}\n\nArticles to rank:\n${articleSummaries}\n\nReturn the ranked indices as a JSON array.` 
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
    const rankingText = data.choices?.[0]?.message?.content;

    if (!rankingText) {
      throw new Error('No ranking generated');
    }

    // Parse the ranking (should be a JSON array like [2, 5, 0, 1, 3, 4])
    let rankedIndices: number[];
    try {
      rankedIndices = JSON.parse(rankingText.trim());
    } catch (parseError) {
      console.error('Failed to parse AI ranking:', rankingText);
      // Fallback to original order
      rankedIndices = articles.map((_: any, i: number) => i);
    }

    return new Response(JSON.stringify({ rankedIndices }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in personalize-feed function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
