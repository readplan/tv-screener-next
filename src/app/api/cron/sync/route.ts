import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

const MACRO_SERIES = [
  { id: 'VIXCLS', name: 'data/vix-history.json' },
  { id: 'DGS10', name: 'data/macro/us10y-history.json' },
  { id: 'M2SL', name: 'data/macro/m2-history.json' },
  { id: 'UNRATE', name: 'data/macro/unemployment-history.json' },
  { id: 'CPIAUCSL', name: 'data/macro/cpi-history.json' },
  { id: 'BAMLH0A0HYM2', name: 'data/macro/yield_spread-history.json' }
];

export async function GET(request: Request) {
  const apiKey = process.env.FRED_API_KEY;
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

  if (!apiKey || !blobToken) {
    return NextResponse.json({ error: "Missing required environment keys" }, { status: 500 });
  }

  const results: any[] = [];

  try {
    console.log("🚀 Cron: Starting Macro Sync Pipeline...");

    for (const series of MACRO_SERIES) {
      // 从 FRED 获取数据
      const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${series.id}&api_key=${apiKey}&file_type=json`;
      const response = await fetch(url);
      
      if (!response.ok) {
        results.push({ id: series.id, status: "failed", error: response.status });
        continue;
      }

      const rawData: any = await response.json();
      const formatted = rawData.observations
        .map((obs: any) => ({
          date: obs.date,
          value: parseFloat(obs.value),
          close: parseFloat(obs.value) // 兼容 VIX 字段名
        }))
        .filter((d: any) => !isNaN(d.value));

      // 自动同步至 Vercel Blob
      const { url: blobUrl } = await put(series.name, JSON.stringify(formatted, null, 2), {
        access: 'private',
        addRandomSuffix: false,
        token: blobToken
      });

      results.push({ id: series.id, status: "synced", url: blobUrl });
    }

    return NextResponse.json({ 
      timestamp: new Date().toISOString(),
      summary: results
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
