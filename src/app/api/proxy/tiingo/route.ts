import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get("endpoint") || "daily";
    const symbol = searchParams.get("symbol") || "AAPL";
    const token = process.env.TIINGO_API_TOKEN;

    if (!token) throw new Error("Missing TIINGO_API_TOKEN in environment");

    let url = "";
    const commonParams = `token=${token}`;

    switch (endpoint) {
      case "news":
        // 2.2 News Endpoint
        url = `https://api.tiingo.com/tiingo/news?tickers=${symbol}&${commonParams}`;
        break;
      case "crypto":
        // 2.3 Crypto Top of Book / Daily
        url = `https://api.tiingo.com/tiingo/crypto/prices?tickers=${symbol}&${commonParams}`;
        break;
      case "forex":
        // 2.4 Forex Top of Book
        url = `https://api.tiingo.com/tiingo/fx/top?tickers=${symbol}&${commonParams}`;
        break;
      case "iex":
        // 2.5 IEX Real-time
        url = `https://api.tiingo.com/iex/?tickers=${symbol}&${commonParams}`;
        break;
      case "fundamentals":
        // 2.6 Fundamentals Daily Metrics
        url = `https://api.tiingo.com/tiingo/fundamentals/${symbol}/daily?${commonParams}`;
        break;
      case "daily":
      default:
        // 2.1 End-of-Day Prices
        url = `https://api.tiingo.com/tiingo/daily/${symbol}/prices?${commonParams}`;
    }

    console.log(`Tiingo Proxy: Fetching ${url}`);

    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 300 }
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Tiingo API Error (${response.status}):`, errorData);
      throw new Error(`Tiingo API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("Tiingo Proxy Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
