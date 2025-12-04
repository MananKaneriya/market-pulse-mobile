// Dummy data for MarketPulse demo

export const INDIAN_STOCKS = [
  { symbol: "RELIANCE", name: "Reliance Industries" },
  { symbol: "TCS", name: "Tata Consultancy Services" },
  { symbol: "HDFCBANK", name: "HDFC Bank" },
  { symbol: "INFY", name: "Infosys" },
  { symbol: "ICICIBANK", name: "ICICI Bank" },
  { symbol: "HINDUNILVR", name: "Hindustan Unilever" },
  { symbol: "ITC", name: "ITC Limited" },
  { symbol: "SBIN", name: "State Bank of India" },
  { symbol: "BHARTIARTL", name: "Bharti Airtel" },
  { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank" },
  { symbol: "LT", name: "Larsen & Toubro" },
  { symbol: "AXISBANK", name: "Axis Bank" },
  { symbol: "ASIANPAINT", name: "Asian Paints" },
  { symbol: "MARUTI", name: "Maruti Suzuki" },
  { symbol: "SUNPHARMA", name: "Sun Pharmaceutical" },
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
