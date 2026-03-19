import { NextResponse } from "next/server";
import { FINVIZ_HEADERS } from "@/lib/finviz-constants";

export async function GET() {
  try {
    // 1. 获取 VIX (通过 TradingView 内部 API 的简化版请求，或者直接请求全局 scan)
    const vixPayload = {
      symbols: { tickers: ["CBOE:VIX"], query: { types: [] } },
      columns: ["close", "change", "description"],
    };

    const vixResponse = await fetch("https://scanner.tradingview.com/global/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vixPayload),
    });
    
    const vixData = await vixResponse.json();
    const vixInfo = vixData.data?.[0]?.d || [0, 0, "VIX"];

    // 2. 尝试获取 CNN 恐惧贪婪指数 (带上更全的 Headers)
    let fearGreed = null;
    try {
      const cnnResponse = await fetch("https://production.dataviz.cnn.io/index/fearandgreed/staticdata", {
        headers: {
          ...FINVIZ_HEADERS,
          "Referer": "https://www.cnn.com/markets/fear-and-greed",
          "Origin": "https://www.cnn.com",
        },
        next: { revalidate: 600 } 
      });
      
      if (cnnResponse.ok) {
        const data = await cnnResponse.json();
        fearGreed = {
          now: data.fear_and_greed?.score,
          rating: data.fear_and_greed?.rating,
          previousClose: data.fear_and_greed?.previous_close,
          oneWeekAgo: data.fear_and_greed?.previous_1_week,
          oneMonthAgo: data.fear_and_greed?.previous_1_month,
          oneYearAgo: data.fear_and_greed?.previous_1_year,
          timestamp: data.fear_and_greed?.timestamp,
        };
      } else {
        console.warn("CNN Fear & Greed fetch failed with status:", cnnResponse.status);
      }
    } catch (e) {
      console.error("CNN Fear & Greed fetch error:", e);
    }

    return NextResponse.json({
      vix: {
        price: vixInfo[0],
        change: vixInfo[1],
        name: vixInfo[2],
        status: getVixStatus(vixInfo[0])
      },
      fearGreed: fearGreed
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function getVixStatus(val: number) {
  if (val < 15) return "Low (Complacency)";
  if (val < 20) return "Normal";
  if (val < 30) return "Elevated (Nervous)";
  if (val < 40) return "High (Fear)";
  return "Extreme (Panic)";
}
