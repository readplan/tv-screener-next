import { NextResponse } from "next/server";

const MOCK_DATA: Record<string, any> = {
  daily: [
    { date: "2026-03-19", open: 150.2, high: 155.5, low: 149.8, close: 153.4, volume: 1200000, adjClose: 153.4 },
    { date: "2026-03-18", open: 148.5, high: 151.2, low: 147.0, close: 150.2, volume: 1100000, adjClose: 150.2 }
  ],
  daily_meta: {
    ticker: "AAPL", name: "Apple Inc.", exchangeCode: "NASDAQ", startDate: "1980-12-12", description: "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide."
  },
  news: [
    { publishedDate: "2026-03-20T08:00:00Z", title: "Tech Giants See Record Growth", description: "Analysts predict a strong quarter for the semiconductor industry...", source: "Financial Times", url: "#" },
    { publishedDate: "2026-03-19T14:30:00Z", title: "Market Volatility Hits 2-Year High", description: "VIX index spikes as investors react to new economic data...", source: "Reuters", url: "#" }
  ],
  crypto: { ticker: "BTCUSD", baseCurrency: "btc", quoteCurrency: "usd", priceData: [{ last: 68500.25, high: 69000, low: 67000, volume: 450.5 }] },
  crypto_top: [{ ticker: "BTCUSD", lastPrice: 68540.5, bidPrice: 68535.0, askPrice: 68545.0 }],
  forex: [{ ticker: "AUDUSD", quoteTimestamp: "2026-03-20", bidPrice: 0.6542, askPrice: 0.6545, midPrice: 0.6543 }],
  iex: [{ ticker: "AAPL", last: 249.94, prevClose: 251.0, open: 252.1, high: 254.0, low: 248.5, volume: 35000000 }],
  fundamentals: [
    { date: "2026-03-19", marketCap: 3200000000000, peRatio: 28.5, pbRatio: 12.4, revenueQ: 95000000000, enterpriseVal: 3300000000000 },
    { date: "2026-03-18", marketCap: 3150000000000, peRatio: 27.9, pbRatio: 12.1, revenueQ: 94000000000, enterpriseVal: 3250000000000 }
  ],
  fundamentals_defs: [{ name: "Market Cap", description: "Total value of a company's shares" }, { name: "PE Ratio", description: "Price-to-Earnings ratio" }],
  funds_metrics: { ticker: "SPY", expenseRatio: 0.0009, yield: 0.013, assetsUnderManagement: 500000000000 },
  dividends: [
    { date: "2026-02-15", amount: 0.24, frequency: "Quarterly" },
    { date: "2025-11-15", amount: 0.24, frequency: "Quarterly" }
  ],
  splits: [{ date: "2020-08-31", splitFactor: 4.0, fromSymbol: "AAPL", toSymbol: "AAPL" }],
  search: [{ ticker: "AAPL", name: "Apple Inc", assetType: "Stock" }, { ticker: "AAPL.DB", name: "Apple Bonds", assetType: "Debt" }]
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get("endpoint") || "daily";
    const isMock = searchParams.get("mock") !== "false"; // 默认开启 Mock

    if (isMock) {
      console.log(`Tiingo Mock: Serving ${endpoint} data`);
      const data = MOCK_DATA[endpoint] || MOCK_DATA.daily;
      return NextResponse.json({ data, _isMock: true });
    }

    // 只有明确指定 mock=false 时才走真实 API
    const symbol = searchParams.get("symbol") || "AAPL";
    const token = process.env.TIINGO_API_TOKEN;
    // ... (保留之前的真实请求逻辑，略)
    return NextResponse.json({ error: "Real API bypass enabled" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
