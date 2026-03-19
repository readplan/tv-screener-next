import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const seriesId = searchParams.get("series_id") || "VIXCLS";
    const apiKey = process.env.FRED_API_KEY;

    if (!apiKey) throw new Error("Missing FRED_API_KEY in environment");

    // FRED API URL
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json`;

    console.log(`FRED Proxy: Fetching series ${seriesId}`);

    const response = await fetch(url, {
      next: { revalidate: 3600 } // FRED 数据通常每日更新，缓存 1 小时
    });

    if (!response.ok) throw new Error(`FRED API error: ${response.status}`);

    const data = await response.json();
    
    // 简单清洗：只保留有数值的日期
    const formattedData = data.observations
      .map((obs: any) => ({
        date: obs.date,
        close: parseFloat(obs.value)
      }))
      .filter((d: any) => !isNaN(d.close));

    return NextResponse.json({ data: formattedData });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
