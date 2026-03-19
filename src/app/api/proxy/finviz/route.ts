import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";
import { FINVIZ_HEADERS, FINVIZ_VIEWS } from "@/lib/finviz-constants";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") || "screener"; // screener, insider, quote
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
      url = `https://finviz.com/screener.ashx?v=${view}&f=${filters}&o=${sort}`;
    }

    const response = await axios.get(url, { headers: FINVIZ_HEADERS });
    const $ = cheerio.load(response.data);

    if (mode === "insider") {
      const results: any[] = [];
      $(".insider-table tr").each((i, row) => {
        if (i === 0) return; // Skip header
        const cols = $(row).find("td");
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
      const headers: string[] = [];
      
      // 提取表头
      table.find("tr").first().find("td").each((i, el) => {
        headers.push($(el).text().trim());
      });

      // 提取数据行
      table.find("tr").each((i, row) => {
        if (i === 0) return; // Skip header
        const item: any = {};
        $(row).find("td").each((j, el) => {
          const key = headers[j] || `col_${j}`;
          item[key] = $(el).text().trim();
        });
        results.push(item);
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
    console.error("Finviz Proxy Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
