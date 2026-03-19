import { NextResponse } from "next/server";
import { FRED_ENDPOINTS } from "@/lib/fred-api-config";

const FRED_MOCK_DATA: Record<string, any> = {
  releases: {
    releases: [
      { id: 9, name: "Advance Real GDP", notes: "Real gross domestic product is the inflation-adjusted value..." },
      { id: 10, name: "Consumer Price Index", notes: "The Consumer Price Index (CPI) is a measure of the average change..." }
    ]
  },
  release_observations: {
    observations: [
      { date: "2026-03-20", value: "2.4", release_id: 10 },
      { date: "2026-02-20", value: "2.1", release_id: 10 }
    ]
  },
  series: {
    series: [
      { id: "VIXCLS", title: "CBOE Volatility Index: VIX", frequency: "Daily", units: "Index" }
    ]
  },
  observations: {
    observations: [
      { date: "2026-03-19", value: "25.09" },
      { date: "2026-03-18", value: "24.80" }
    ]
  }
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get("endpoint") || "observations";
    const seriesId = searchParams.get("series_id") || "VIXCLS";
    const releaseId = searchParams.get("release_id") || "10";
    const isMock = searchParams.get("mock") !== "false";
    const apiKey = process.env.FRED_API_KEY;

    if (isMock) {
      return NextResponse.json({ data: FRED_MOCK_DATA[endpoint] || FRED_MOCK_DATA.observations, _isMock: true });
    }

    if (!apiKey) throw new Error("Missing FRED_API_KEY in environment");

    let url = "";
    switch (endpoint) {
      case "series": url = FRED_ENDPOINTS.SERIES.GET(seriesId); break;
      case "releases": url = FRED_ENDPOINTS.RELEASES.ALL; break;
      case "release_observations": url = FRED_ENDPOINTS.RELEASES.OBSERVATIONS(releaseId); break;
      default: url = FRED_ENDPOINTS.SERIES.OBSERVATIONS(seriesId);
    }

    const finalUrl = `${url}${url.includes('?') ? '&' : '?'}api_key=${apiKey}&file_type=json`;
    console.log(`FRED Proxy: Fetching ${finalUrl}`);

    const response = await fetch(finalUrl, { next: { revalidate: 3600 } });
    if (!response.ok) throw new Error(`FRED API error: ${response.status}`);

    const data = await response.json();
    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
