// Dummy data for MarketPulse demo

export interface IndianStockCompany {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  currentPrice: number;
  change: number;
  changePercent: number;
}

export const INDIAN_STOCKS: IndianStockCompany[] = [
  { id: "1", symbol: "RELIANCE", name: "Reliance Industries", sector: "Energy & Conglomerate", currentPrice: 2456.75, change: 45.20, changePercent: 1.88 },
  { id: "2", symbol: "TCS", name: "Tata Consultancy Services", sector: "Information Technology", currentPrice: 3890.50, change: -28.35, changePercent: -0.72 },
  { id: "3", symbol: "HDFCBANK", name: "HDFC Bank", sector: "Banking & Finance", currentPrice: 1678.25, change: 22.80, changePercent: 1.38 },
  { id: "4", symbol: "INFY", name: "Infosys", sector: "Information Technology", currentPrice: 1456.30, change: -15.60, changePercent: -1.06 },
  { id: "5", symbol: "ICICIBANK", name: "ICICI Bank", sector: "Banking & Finance", currentPrice: 1089.45, change: 18.90, changePercent: 1.77 },
  { id: "6", symbol: "HINDUNILVR", name: "Hindustan Unilever", sector: "FMCG", currentPrice: 2567.80, change: -8.45, changePercent: -0.33 },
  { id: "7", symbol: "ITC", name: "ITC Limited", sector: "FMCG", currentPrice: 456.25, change: 12.35, changePercent: 2.78 },
  { id: "8", symbol: "SBIN", name: "State Bank of India", sector: "Banking & Finance", currentPrice: 678.90, change: 8.65, changePercent: 1.29 },
  { id: "9", symbol: "BHARTIARTL", name: "Bharti Airtel", sector: "Telecommunications", currentPrice: 1234.55, change: 32.10, changePercent: 2.67 },
  { id: "10", symbol: "KOTAKBANK", name: "Kotak Mahindra Bank", sector: "Banking & Finance", currentPrice: 1789.30, change: -12.55, changePercent: -0.70 },
  { id: "11", symbol: "LT", name: "Larsen & Toubro", sector: "Infrastructure", currentPrice: 3456.70, change: 56.80, changePercent: 1.67 },
  { id: "12", symbol: "AXISBANK", name: "Axis Bank", sector: "Banking & Finance", currentPrice: 1123.45, change: 15.20, changePercent: 1.37 },
  { id: "13", symbol: "ASIANPAINT", name: "Asian Paints", sector: "Consumer Durables", currentPrice: 2890.60, change: -22.30, changePercent: -0.77 },
  { id: "14", symbol: "MARUTI", name: "Maruti Suzuki", sector: "Automobile", currentPrice: 12456.85, change: 189.50, changePercent: 1.55 },
  { id: "15", symbol: "SUNPHARMA", name: "Sun Pharmaceutical", sector: "Healthcare", currentPrice: 1567.40, change: 28.90, changePercent: 1.88 },
];

export interface NewsComment {
  id: string;
  user: string;
  content: string;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  source: string;
  timestamp: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  relatedCompanies: string[];
  likes: number;
  comments: NewsComment[];
  isBookmarked: boolean;
  stock: string;
  summary: string;
  imageUrl?: string;
}

export const DUMMY_NEWS_ARTICLES: NewsItem[] = [
  {
    id: "news-1",
    title: "Reliance Industries Q3 Results Beat Estimates",
    content: "Reliance Industries reported stellar Q3 results with net profit surging 15% YoY, driven by strong retail and digital services performance. The company's retail arm saw revenue growth of 18% while Jio Platforms added 12 million new subscribers this quarter.",
    source: "Economic Times",
    timestamp: "2h ago",
    sentiment: "positive",
    relatedCompanies: ["RELIANCE", "JIO"],
    likes: 245,
    comments: [
      { id: "c1", user: "@investorpro", content: "Great results! Bullish on retail expansion" },
      { id: "c2", user: "@marketwatch", content: "Jio growth is impressive" }
    ],
    isBookmarked: false,
    stock: "RELIANCE",
    summary: "Reliance Industries reported stellar Q3 results with net profit surging 15% YoY, driven by strong retail and digital services performance.",
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop",
  },
  {
    id: "news-2",
    title: "TCS Announces Major AI Partnership with Google Cloud",
    content: "TCS signs landmark deal with Google Cloud to develop AI-powered enterprise solutions, expected to boost revenue by 8-10% in next fiscal. The partnership will focus on generative AI implementations across banking, healthcare, and manufacturing sectors.",
    source: "Business Standard",
    timestamp: "4h ago",
    sentiment: "positive",
    relatedCompanies: ["TCS", "GOOGL"],
    likes: 189,
    comments: [
      { id: "c3", user: "@techtrader", content: "AI partnerships driving IT stocks higher" }
    ],
    isBookmarked: false,
    stock: "TCS",
    summary: "TCS signs landmark deal with Google Cloud to develop AI-powered enterprise solutions, expected to boost revenue by 8-10% in next fiscal.",
    imageUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop",
  },
  {
    id: "news-3",
    title: "HDFC Bank Expands Digital Banking Services",
    content: "HDFC Bank launches new mobile-first features, targeting millennials and Gen-Z customers with instant loans and investment options. The digital transformation initiative includes AI-powered credit scoring and real-time portfolio tracking.",
    source: "Mint",
    timestamp: "6h ago",
    sentiment: "positive",
    relatedCompanies: ["HDFCBANK"],
    likes: 156,
    comments: [
      { id: "c4", user: "@bankinginsider", content: "Digital push is the future" },
      { id: "c5", user: "@financegeek", content: "Competition heating up with neobanks" }
    ],
    isBookmarked: false,
    stock: "HDFCBANK",
    summary: "HDFC Bank launches new mobile-first features, targeting millennials and Gen-Z customers with instant loans and investment options.",
    imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=400&fit=crop",
  },
  {
    id: "news-4",
    title: "Infosys Faces Client Budget Cuts in Key Markets",
    content: "Infosys reports slowdown in discretionary spending from US and European clients, particularly in BFSI segment. Management maintains guidance but warns of near-term headwinds affecting deal closures.",
    source: "Reuters",
    timestamp: "8h ago",
    sentiment: "negative",
    relatedCompanies: ["INFY"],
    likes: 87,
    comments: [
      { id: "c6", user: "@cautiousinvestor", content: "IT sector facing headwinds globally" }
    ],
    isBookmarked: false,
    stock: "INFY",
    summary: "Infosys reports slowdown in discretionary spending from US and European clients, particularly in BFSI segment.",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
  },
  {
    id: "news-5",
    title: "Bharti Airtel 5G Rollout Ahead of Schedule",
    content: "Airtel completes 5G rollout in 500+ cities, 3 months ahead of target, with plans to cover rural areas by year-end. The telecom giant expects 5G to contribute significantly to ARPU growth in coming quarters.",
    source: "Financial Express",
    timestamp: "10h ago",
    sentiment: "positive",
    relatedCompanies: ["BHARTIARTL", "JIO"],
    likes: 312,
    comments: [
      { id: "c7", user: "@telecomanalyst", content: "Impressive execution by Airtel" },
      { id: "c8", user: "@5Gwatcher", content: "Rural coverage will be game changer" }
    ],
    isBookmarked: false,
    stock: "BHARTIARTL",
    summary: "Airtel completes 5G rollout in 500+ cities, 3 months ahead of target, with plans to cover rural areas by year-end.",
    imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=400&fit=crop",
  },
  {
    id: "news-6",
    title: "ICICI Bank Reports Strong Loan Growth",
    content: "ICICI Bank's loan book grows 16% YoY with healthy asset quality metrics. Retail lending drives growth while corporate demand remains subdued. NIM expansion expected to continue in H2.",
    source: "Moneycontrol",
    timestamp: "12h ago",
    sentiment: "neutral",
    relatedCompanies: ["ICICIBANK"],
    likes: 134,
    comments: [],
    isBookmarked: false,
    stock: "ICICIBANK",
    summary: "ICICI Bank's loan book grows 16% YoY with healthy asset quality metrics.",
    imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop",
  },
];

export const DUMMY_TWEETS = [
  {
    id: "tweet-1",
    username: "@marketguru",
    text: "Reliance crushing it this quarter! Retail segment up 18%, Jio adding millions of subscribers. Perfect storm for growth. #RELIANCE #BullishOutlook",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    likes: 245,
    sentiment: "positive" as const,
  },
  {
    id: "tweet-2",
    username: "@traderpro",
    text: "TCS margins holding steady at 25% despite wage hikes. Strong deal pipeline for Q4. This is quality you can trust. #TCS #TechStocks",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    likes: 189,
    sentiment: "positive" as const,
  },
  {
    id: "tweet-3",
    username: "@financegeek",
    text: "HDFC Bank NPA ratio dropping to 1.1%. Digital banking push bringing in younger customers. Asset quality improving consistently. #HDFCBANK #Banking",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    likes: 312,
    sentiment: "positive" as const,
  },
  {
    id: "tweet-4",
    username: "@investsmart",
    text: "Watching Infosys carefully. Client budget cuts in BFSI segment concerning. Guidance might be conservative next quarter. #INFY #CautiousOutlook",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    likes: 156,
    sentiment: "neutral" as const,
  },
  {
    id: "tweet-5",
    username: "@riskanalyst",
    text: "ICICI Bank's loan growth impressive at 16% YoY but rising interest rates could pressure margins. Monitoring credit quality closely. #ICICIBANK",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    likes: 198,
    sentiment: "neutral" as const,
  },
  {
    id: "tweet-6",
    username: "@bearishbets",
    text: "Bharti Airtel spending too much on 5G capex. ARPU growth not keeping pace. Debt levels concerning for long-term investors. #BHARTIARTL #Bearish",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    likes: 87,
    sentiment: "negative" as const,
  },
  {
    id: "tweet-7",
    username: "@valueinvestor",
    text: "Asian Paints facing raw material headwinds. Volume growth slowing. Premium valuations not justified at current levels. #ASIANPAINT #Overvalued",
    timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
    likes: 143,
    sentiment: "negative" as const,
  },
  {
    id: "tweet-8",
    username: "@portfoliomanager",
    text: "Maruti struggling with chip shortage and EV transition risks. Competition from Tata Motors heating up. Market share declining. #MARUTI",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    likes: 201,
    sentiment: "negative" as const,
  },
];

export const DAILY_TIPS = [
  "Diversification reduces risk. Never put all your eggs in one basket!",
  "Dollar-cost averaging helps smooth out market volatility over time.",
  "Focus on long-term goals. Short-term market fluctuations are normal.",
  "Research before investing. Understand what you're buying and why.",
  "Emergency fund first! Have 6 months of expenses saved before investing.",
  "Review your portfolio quarterly. Stay informed about your investments.",
  "Tax-loss harvesting can help offset capital gains and reduce tax liability.",
  "Compounding is powerful. Start investing early to benefit from it.",
];

export const generateChartData = (days: number = 30) => {
  const data = [];
  const basePrice = 2800;
  let price = basePrice;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Generate realistic price movements
    const change = (Math.random() - 0.48) * 50;
    price = Math.max(price + change, basePrice * 0.85);
    
    data.push({
      date: date.toISOString().split('T')[0],
      price: Math.round(price * 100) / 100,
      volume: Math.floor(Math.random() * 1000000) + 500000,
    });
  }
  
  return data;
};

export const FUNDAMENTAL_DATA = {
  RELIANCE: { pe: 24.5, eps: 98.5, roe: 12.3, marketCap: "17.8L Cr" },
  TCS: { pe: 28.2, eps: 125.6, roe: 45.2, marketCap: "12.5L Cr" },
  HDFCBANK: { pe: 19.8, eps: 67.8, roe: 16.5, marketCap: "11.2L Cr" },
  INFY: { pe: 26.5, eps: 62.4, roe: 28.9, marketCap: "6.8L Cr" },
  BHARTIARTL: { pe: 32.1, eps: 28.5, roe: 18.4, marketCap: "4.9L Cr" },
};
