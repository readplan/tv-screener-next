import { NextResponse } from "next/server";
import { TIINGO_ENDPOINTS } from "@/lib/tiingo-api-config";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get("endpoint") || "daily";
    const symbol = searchParams.get("symbol") || "AAPL";
    const token = process.env.TIINGO_API_TOKEN;

    if (!token) throw new Error("Missing TIINGO_API_TOKEN in environment");

    let url = "";
    
    // 动态匹配配置中的端点逻辑
    switch (endpoint) {
      case "daily": url = TIINGO_ENDPOINTS.DAILY.PRICES(symbol); break;
      case "daily_meta": url = TIINGO_ENDPOINTS.DAILY.META(symbol); break;
      case "news": url = `${TIINGO_ENDPOINTS.NEWS}?tickers=${symbol}`; break;
      case "crypto": url = TIINGO_ENDPOINTS.CRYPTO.PRICES(symbol); break;
      case "crypto_top": url = TIINGO_ENDPOINTS.CRYPTO.TOP(symbol); break;
      case "forex": url = TIINGO_ENDPOINTS.FOREX.TOP(symbol); break;
      case "iex": url = TIINGO_ENDPOINTS.IEX.TICKER(symbol); break;
      case "iex_all": url = TIINGO_ENDPOINTS.IEX.ALL; break;
      case "fundamentals": url = TIINGO_ENDPOINTS.FUNDAMENTALS.DAILY(symbol); break;
      case "fundamentals_meta": url = TIINGO_ENDPOINTS.FUNDAMENTALS.META; break;
      case "fundamentals_defs": url = TIINGO_ENDPOINTS.FUNDAMENTALS.DEFINITIONS; break;
      case "fundamentals_stmts": url = TIINGO_ENDPOINTS.FUNDAMENTALS.STATEMENTS(symbol); break;
      case "funds_meta": url = TIINGO_ENDPOINTS.FUNDS.META(symbol); break;
      case "funds_metrics": url = TIINGO_ENDPOINTS.FUNDS.METRICS(symbol); break;
      case "dividends": url = TIINGO_ENDPOINTS.DIVIDENDS.TICKER(symbol); break;
      case "dividends_yield": url = TIINGO_ENDPOINTS.DIVIDENDS.YIELD(symbol); break;
      case "splits": url = TIINGO_ENDPOINTS.SPLITS.TICKER(symbol); break;
      case "search": url = TIINGO_ENDPOINTS.SEARCH(symbol); break;
      default: url = TIINGO_ENDPOINTS.DAILY.PRICES(symbol);
    }

    const commonParams = `token=${token}`;
    const finalUrl = `${url}${url.includes('?') ? '&' : '?'}${commonParams}`;

    console.log(`Tiingo Proxy [Structured]: Fetching ${finalUrl}`);

    const response = await fetch(finalUrl, {
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
