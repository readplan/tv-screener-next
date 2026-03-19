import { NextResponse } from "next/server";
import { FRED_ENDPOINTS } from "@/lib/fred-api-config";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get("endpoint") || "observations";
    const seriesId = searchParams.get("series_id") || "VIXCLS";
    const releaseId = searchParams.get("release_id") || "10";
    const categoryId = searchParams.get("category_id") || "0";
    const sourceId = searchParams.get("source_id") || "1";
    const tagName = searchParams.get("tag") || "monetary+policy";
    const isMock = searchParams.get("mock") !== "false";
    const apiKey = process.env.FRED_API_KEY;

    if (isMock) return NextResponse.json({ data: { message: `Mock ${endpoint} data enabled` }, _isMock: true });
    if (!apiKey) throw new Error("Missing FRED_API_KEY");

    let url = "";
    switch (endpoint) {
      // Series
      case "series": url = FRED_ENDPOINTS.SERIES.GET(seriesId); break;
      case "observations": url = FRED_ENDPOINTS.SERIES.OBSERVATIONS(seriesId); break;
      case "series_updates": url = FRED_ENDPOINTS.SERIES.UPDATES; break;
      // Category
      case "category": url = FRED_ENDPOINTS.CATEGORY.GET(categoryId); break;
      case "category_children": url = FRED_ENDPOINTS.CATEGORY.CHILDREN(categoryId); break;
      case "category_series": url = FRED_ENDPOINTS.CATEGORY.SERIES(categoryId); break;
      // Release
      case "releases": url = FRED_ENDPOINTS.RELEASES.ALL; break;
      case "release": url = FRED_ENDPOINTS.RELEASES.GET(releaseId); break;
      case "release_observations": url = FRED_ENDPOINTS.RELEASES.OBSERVATIONS(releaseId); break;
      // Source
      case "sources": url = FRED_ENDPOINTS.SOURCES.ALL; break;
      case "source": url = FRED_ENDPOINTS.SOURCES.GET(sourceId); break;
      // Tags
      case "tags": url = FRED_ENDPOINTS.TAGS.ALL; break;
      case "tag_series": url = FRED_ENDPOINTS.TAGS.SERIES(tagName); break;
      default: url = FRED_ENDPOINTS.SERIES.OBSERVATIONS(seriesId);
    }

    const finalUrl = `${url}${url.includes('?') ? '&' : '?'}api_key=${apiKey}&file_type=json`;
    const response = await fetch(finalUrl, { next: { revalidate: 3600 } });
    if (!response.ok) throw new Error(`FRED API ${response.status}`);
    return NextResponse.json({ data: await response.json() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
