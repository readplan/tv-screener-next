import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { FINVIZ_HEADERS, FINVIZ_VIEWS } from "@/lib/finviz-constants";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") || "screener";
    const ticker = searchParams.get("ticker");
    const filters = searchParams.get("f") || "";
    const view = searchParams.get("v") || FINVIZ_VIEWS.OVERVIEW;
    const sort = searchParams.get("o") || "";

    let url = "";
    if (mode === "insider") {
      url = `https://finviz.com/insider.ashx`;
    } else if (mode === "quote" && ticker) {
      url = `https://finviz.com/quote.ashx?t=${ticker}`;
    } else {
      const params = new URLSearchParams();
      params.append("v", view);
      if (filters) params.append("f", filters);
      if (sort) params.append("o", sort);
      url = `https://finviz.com/screener.ashx?${params.toString()}`;
    }

    console.log(`Fetching Finviz data from: ${url}`);

    const response = await fetch(url, { 
      headers: FINVIZ_HEADERS,
      next: { revalidate: 300 } // 5分钟缓存
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Finviz fetch failed: ${response.status} ${response.statusText}`, errorText.substring(0, 200));
      return NextResponse.json({ 
        error: `Finviz API responded with ${response.status}`,
        details: response.status === 403 ? "Access Forbidden (Bot detected)" : "Service Unavailable"
      }, { status: response.status });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    if (mode === "insider") {
      const results: any[] = [];
      $(".insider-table tr").each((i, row) => {
        if (i === 0) return;
        const cols = $(row).find("td");
        if (cols.length < 10) return;
        results.push({
          ticker: $(cols[0]).text().trim(),
          owner: $(cols[1]).text().trim(),
          relationship: $(cols[2]).text().trim(),
          date: $(cols[3]).text().trim(),
          transaction: $(cols[4]).text().trim(),
          cost: $(cols[5]).text().trim(),
          shares: $(cols[6]).text().trim(),
          value: $(cols[7]).text().trim(),
          shares_total: $(cols[8]).text().trim(),
          sec_form_4: $(cols[9]).text().trim(),
        });
      });
      return NextResponse.json({ data: results });
    }

    if (mode === "screener") {
      const results: any[] = [];
      const table = $(".screener-table");
      if (table.length === 0) {
        // 检查是否显示 "No results found"
        if (html.includes("No results found")) {
          return NextResponse.json({ data: [], message: "No results found" });
        }
        console.warn("Screener table not found in HTML response");
        return NextResponse.json({ error: "Screener table not found. Finviz may have blocked the request." }, { status: 500 });
      }

      const headers: string[] = [];
      table.find("tr").first().find("td").each((i, el) => {
        headers.push($(el).text().trim());
      });

      table.find("tr").each((i, row) => {
        if (i === 0) return;
        const item: any = {};
        $(row).find("td").each((j, el) => {
          const key = headers[j] || `col_${j}`;
          item[key] = $(el).text().trim();
        });
        if (Object.keys(item).length > 0) results.push(item);
      });

      return NextResponse.json({ data: results });
    }

    if (mode === "quote") {
      const snapshot: any = {};
      $(".snapshot-table2 tr").each((i, row) => {
        const tds = $(row).find("td");
        for (let j = 0; j < tds.length; j += 2) {
          const label = $(tds[j]).text().trim();
          const value = $(tds[j+1]).text().trim();
          if (label) snapshot[label] = value;
        }
      });
      return NextResponse.json({ data: snapshot });
    }

    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  } catch (error: any) {
    console.error("Finviz Proxy Unexpected Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
