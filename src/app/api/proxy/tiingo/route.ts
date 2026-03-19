import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get("endpoint") || "daily";
    const symbol = searchParams.get("symbol") || "spy";
    const token = process.env.TIINGO_API_TOKEN;

    let url = "";
    const params = new URLSearchParams();
    params.append("token", token || "");

    switch (endpoint) {
      case "news":
        url = `https://api.tiingo.com/tiingo/news?tickers=${symbol}`;
        break;
      case "fundamentals":
        url = `https://api.tiingo.com/tiingo/fundamentals/${symbol}/daily`;
        break;
      case "crypto":
        url = `https://api.tiingo.com/tiingo/crypto/prices?tickers=${symbol}`;
        break;
      case "forex":
        url = `https://api.tiingo.com/tiingo/fx/top?tickers=${symbol}`;
        break;
      case "iex":
        url = `https://api.tiingo.com/iex/?tickers=${symbol}`;
        break;
      default:
        url = `https://api.tiingo.com/tiingo/daily/${symbol}/prices`;
    }

    const response = await fetch(`${url}${url.includes('?') ? '&' : '?'}${params.toString()}`, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 300 } 
    });

    if (!response.ok) throw new Error(`Tiingo API error: ${response.status}`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
