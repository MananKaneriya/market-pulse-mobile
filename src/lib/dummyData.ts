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

export const DUMMY_NEWS_ARTICLES = [
  {
    id: "news-1",
    title: "Reliance Industries Q3 Results Beat Estimates",
    source: "Economic Times",
    summary: "Reliance Industries reported stellar Q3 results with net profit surging 15% YoY, driven by strong retail and digital services performance.",
    content: "Full article content here...",
    stock: "RELIANCE",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop",
  },
  {
    id: "news-2",
    title: "TCS Announces Major AI Partnership",
    source: "Business Standard",
    summary: "TCS signs landmark deal with Google Cloud to develop AI-powered enterprise solutions, expected to boost revenue by 8-10% in next fiscal.",
    content: "Full article content here...",
    stock: "TCS",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop",
  },
  {
    id: "news-3",
    title: "HDFC Bank Expands Digital Banking Services",
    source: "Mint",
    summary: "HDFC Bank launches new mobile-first features, targeting millennials and Gen-Z customers with instant loans and investment options.",
    content: "Full article content here...",
    stock: "HDFCBANK",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=400&fit=crop",
  },
  {
    id: "news-4",
    title: "Infosys Wins $500M Contract from European Bank",
    source: "Reuters",
    summary: "Infosys secures major digital transformation deal worth $500 million, strengthening its position in European banking sector.",
    content: "Full article content here...",
    stock: "INFY",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
  },
  {
    id: "news-5",
    title: "Bharti Airtel 5G Rollout Ahead of Schedule",
    source: "Financial Express",
    summary: "Airtel completes 5G rollout in 500+ cities, 3 months ahead of target, with plans to cover rural areas by year-end.",
    content: "Full article content here...",
    stock: "BHARTIARTL",
    timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=400&fit=crop",
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
