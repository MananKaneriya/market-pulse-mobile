import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StockQuote {
  symbol: string;
  shortName: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketVolume: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketOpen: number;
  regularMarketPreviousClose: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  marketCap: number;
}

async function fetchYahooQuote(symbol: string): Promise<StockQuote | null> {
  try {
    // Using Yahoo Finance API via query endpoint
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbol)}`;
    
    console.log("Fetching stock data for:", symbol);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.error("Yahoo Finance API error:", response.status);
      return null;
    }

    const data = await response.json();
    const quote = data.quoteResponse?.result?.[0];
    
    if (!quote) {
      console.log("No quote data found for:", symbol);
      return null;
    }

    return {
      symbol: quote.symbol,
      shortName: quote.shortName || quote.longName || symbol,
      regularMarketPrice: quote.regularMarketPrice || 0,
      regularMarketChange: quote.regularMarketChange || 0,
      regularMarketChangePercent: quote.regularMarketChangePercent || 0,
      regularMarketVolume: quote.regularMarketVolume || 0,
      regularMarketDayHigh: quote.regularMarketDayHigh || 0,
      regularMarketDayLow: quote.regularMarketDayLow || 0,
      regularMarketOpen: quote.regularMarketOpen || 0,
      regularMarketPreviousClose: quote.regularMarketPreviousClose || 0,
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh || 0,
      fiftyTwoWeekLow: quote.fiftyTwoWeekLow || 0,
      marketCap: quote.marketCap || 0,
    };
  } catch (error) {
    console.error("Error fetching Yahoo quote:", error);
    return null;
  }
}

async function fetchYahooChart(symbol: string, range: string = '1mo', interval: string = '1d'): Promise<any> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`;
    
    console.log("Fetching chart data for:", symbol, "range:", range);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.error("Yahoo Finance Chart API error:", response.status);
      return null;
    }

    const data = await response.json();
    const result = data.chart?.result?.[0];
    
    if (!result) {
      console.log("No chart data found for:", symbol);
      return null;
    }

    const timestamps = result.timestamp || [];
    const quotes = result.indicators?.quote?.[0] || {};
    
    return timestamps.map((timestamp: number, index: number) => ({
      date: new Date(timestamp * 1000).toISOString().split('T')[0],
      open: quotes.open?.[index] || 0,
      high: quotes.high?.[index] || 0,
      low: quotes.low?.[index] || 0,
      close: quotes.close?.[index] || 0,
      volume: quotes.volume?.[index] || 0,
    })).filter((item: any) => item.close > 0);
  } catch (error) {
    console.error("Error fetching Yahoo chart:", error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbols, type = 'quote', range = '1mo', interval = '1d' } = await req.json();
    
    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return new Response(
        JSON.stringify({ error: "symbols array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Limit to 10 symbols per request
    const limitedSymbols = symbols.slice(0, 10);
    
    if (type === 'quote') {
      // Fetch quotes for multiple symbols
      const quotes = await Promise.all(
        limitedSymbols.map(async (symbol: string) => {
          const quote = await fetchYahooQuote(symbol);
          return quote;
        })
      );
      
      return new Response(
        JSON.stringify({ quotes: quotes.filter(q => q !== null) }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else if (type === 'chart') {
      // Fetch chart data for a single symbol
      const chartData = await fetchYahooChart(limitedSymbols[0], range, interval);
      
      return new Response(
        JSON.stringify({ chart: chartData }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid type. Use 'quote' or 'chart'" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in fetch-stock-data:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});