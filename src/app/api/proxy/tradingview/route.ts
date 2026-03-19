import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      market = "global", 
      columns = ["name", "description", "close", "change", "volume", "market_cap_basic", "relative_volume_10d_calc", "Recommend.All"],
      filter = [],
      sort = { sortBy: "market_cap_basic", sortOrder: "desc" },
      range = [0, 50]
    } = body;

    const payload = {
      filter,
      options: { lang: "en" },
      markets: ["america"], // 默认美国市场，后续可扩展
      symbols: { query: { types: [] }, tickers: [] },
      columns,
      sort,
      range
    };

    const endpoint = `https://scanner.tradingview.com/${market}/scan`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`TradingView API error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
