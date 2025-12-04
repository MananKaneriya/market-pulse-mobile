import { supabase } from '@/integrations/supabase/client';

// For Yahoo Finance, Indian stocks need .NS (NSE) or .BO (BSE) suffix
export const YAHOO_STOCK_SYMBOLS: Record<string, string> = {
  RELIANCE: 'RELIANCE.NS',
  TCS: 'TCS.NS',
  HDFCBANK: 'HDFCBANK.NS',
  INFY: 'INFY.NS',
  ICICIBANK: 'ICICIBANK.NS',
  HINDUNILVR: 'HINDUNILVR.NS',
  ITC: 'ITC.NS',
  SBIN: 'SBIN.NS',
  BHARTIARTL: 'BHARTIARTL.NS',
  KOTAKBANK: 'KOTAKBANK.NS',
  LT: 'LT.NS',
  AXISBANK: 'AXISBANK.NS',
  ASIANPAINT: 'ASIANPAINT.NS',
  MARUTI: 'MARUTI.NS',
  SUNPHARMA: 'SUNPHARMA.NS',
};

export interface StockQuote {
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

export interface ChartDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Tweet {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  public_metrics?: {
    like_count: number;
    retweet_count: number;
    reply_count: number;
  };
}

// Fetch stock quotes from Yahoo Finance
export async function fetchStockQuotes(symbols: string[]): Promise<StockQuote[]> {
  try {
    // Convert to Yahoo Finance symbols
    const yahooSymbols = symbols.map(s => YAHOO_STOCK_SYMBOLS[s] || s);
    
    const { data, error } = await supabase.functions.invoke('fetch-stock-data', {
      body: { symbols: yahooSymbols, type: 'quote' }
    });

    if (error) {
      console.error('Error fetching stock quotes:', error);
      return [];
    }

    return data?.quotes || [];
  } catch (error) {
    console.error('Error in fetchStockQuotes:', error);
    return [];
  }
}

// Fetch chart data from Yahoo Finance
export async function fetchStockChart(
  symbol: string, 
  range: '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '5y' = '1mo',
  interval: '1m' | '5m' | '15m' | '1d' | '1wk' | '1mo' = '1d'
): Promise<ChartDataPoint[]> {
  try {
    const yahooSymbol = YAHOO_STOCK_SYMBOLS[symbol] || symbol;
    
    const { data, error } = await supabase.functions.invoke('fetch-stock-data', {
      body: { symbols: [yahooSymbol], type: 'chart', range, interval }
    });

    if (error) {
      console.error('Error fetching stock chart:', error);
      return [];
    }

    return data?.chart || [];
  } catch (error) {
    console.error('Error in fetchStockChart:', error);
    return [];
  }
}

// Fetch tweets about a stock
export async function fetchStockTweets(stockSymbol: string, stockName?: string): Promise<any> {
  try {
    const { data, error } = await supabase.functions.invoke('fetch-tweets', {
      body: { stockSymbol, stockName }
    });

    if (error) {
      console.error('Error fetching tweets:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in fetchStockTweets:', error);
    return null;
  }
}

// Format price for display
export function formatPrice(price: number, currency: string = '₹'): string {
  return `${currency}${price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Format change percentage
export function formatChangePercent(percent: number): string {
  const sign = percent >= 0 ? '+' : '';
  return `${sign}${percent.toFixed(2)}%`;
}

// Format market cap
export function formatMarketCap(cap: number): string {
  if (cap >= 1e12) return `₹${(cap / 1e12).toFixed(2)}L Cr`;
  if (cap >= 1e9) return `₹${(cap / 1e9).toFixed(2)}K Cr`;
  if (cap >= 1e7) return `₹${(cap / 1e7).toFixed(2)} Cr`;
  return `₹${cap.toLocaleString('en-IN')}`;
}