"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { Loader2, RefreshCcw, Database, ShieldCheck, LineChart, BarChart2, Info } from "lucide-react";
import { clsx } from "clsx";
import { TVChart } from "@/components/charts/tradingview-chart";

type FinvizMode = "screener" | "chart";
type ChartRange = "1d" | "5d" | "1m" | "6m" | "ytd" | "1y" | "5y" | "10y" | "max";

const RANGES: { label: string; value: ChartRange }[] = [
  { label: "1D", value: "1d" },
  { label: "5D", value: "5d" },
  { label: "1M", value: "1m" },
  { label: "6M", value: "6m" },
  { label: "YTD", value: "ytd" },
  { label: "1Y", value: "1y" },
  { label: "5Y", value: "5y" },
  { label: "10Y", value: "10y" },
  { label: "MAX", value: "max" },
];

export default function FinvizContainer() {
  const searchParams = useSearchParams();
  const urlSymbol = searchParams.get("symbol");
  
  const [mode, setMode] = useState<FinvizMode>("screener");
  const [range, setRange] = useState<ChartRange>("1y");
  const [searchSymbol, setSearchSymbol] = useState(urlSymbol || "AAPL");

  useEffect(() => { if (urlSymbol) setSearchSymbol(urlSymbol); }, [urlSymbol]);

  // 计算开始日期
  const startDate = useMemo(() => {
    const now = new Date();
    const start = new Date();
    switch (range) {
      case "1d": return null; // 使用 Latest Price 接口
      case "5d": start.setDate(now.getDate() - 7); break;
      case "1m": start.setMonth(now.getMonth() - 1); break;
      case "6m": start.setMonth(now.getMonth() - 6); break;
      case "ytd": return `${now.getFullYear()}-01-01`;
      case "1y": start.setFullYear(now.getFullYear() - 1); break;
      case "5y": start.setFullYear(now.getFullYear() - 5); break;
      case "10y": start.setFullYear(now.getFullYear() - 10); break;
      case "max": return "1970-01-01";
    }
    return start.toISOString().split('T')[0];
  }, [range]);

  // 获取价格数据
  const { data: prices, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["tiingo-prices", searchSymbol, range],
    queryFn: async () => {
      const { data } = await axios.get("/api/proxy/tiingo", {
        params: { 
          endpoint: "daily", 
          symbol: searchSymbol,
          startDate: startDate
        }
      });
      if (data.error) throw new Error(data.details || data.error);
      return data.data;
    },
    retry: false
  });

  // 获取元数据 (Meta Data)
  const { data: meta } = useQuery({
    queryKey: ["tiingo-meta", searchSymbol],
    queryFn: async () => {
      const { data } = await axios.get("/api/proxy/tiingo", {
        params: { endpoint: "daily_meta", symbol: searchSymbol }
      });
      return data.data;
    },
  });

  const chartData = useMemo(() => {
    if (!prices || !Array.isArray(prices)) return [];
    return prices.map((d: any) => ({
      time: d.date.split('T')[0],
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    })).sort((a: any, b: any) => a.time.localeCompare(b.time));
  }, [prices]);

  return (
    <div className="container mx-auto py-4 px-4">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-2 p-1 bg-muted rounded-lg shadow-inner">
            <TabButton active={mode === "screener"} onClick={() => setMode("screener")} icon={<BarChart2 className="w-4 h-4" />} label="市场概览" />
            <TabButton active={mode === "chart"} onClick={() => setMode("chart")} icon={<LineChart className="w-4 h-4" />} label="技术图表" />
          </div>

          {mode === "chart" && (
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              {RANGES.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRange(r.value)}
                  className={clsx(
                    "px-3 py-1 rounded-md text-[10px] font-black transition-all",
                    range === r.value ? "bg-white shadow-sm text-blue-600" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <input 
            type="text" value={searchSymbol}
            onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
            className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
            placeholder="Symbol"
          />
          <button onClick={() => refetch()} className="flex items-center gap-2 text-sm bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow-lg">
            <RefreshCcw className={clsx("w-4 h-4", isLoading && "animate-spin")} />
            更新数据
          </button>
        </div>
      </div>

      <main className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xl shadow-slate-200/50 min-h-[500px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-40 text-muted-foreground">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
                <p className="font-bold tracking-tight text-slate-400 uppercase italic">Loading Market Insights...</p>
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-40 px-6 text-center text-red-400">
                <ShieldCheck className="w-10 h-10 mb-4" />
                <h3 className="font-black uppercase mb-2">Sync Failed</h3>
                <p className="text-sm opacity-70">{error.message}</p>
              </div>
            ) : (
              <div className="p-2">
                {mode === "chart" ? (
                  <div className="p-4"><TVChart data={chartData} symbol={searchSymbol} /></div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                          {prices && prices.length > 0 && Object.keys(prices[0]).map((key) => (
                            <th key={key} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {prices?.map((row: any, i: number) => (
                          <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                            {Object.values(row).map((val: any, j) => (
                              <td key={j} className="px-6 py-4 text-sm font-bold text-slate-600">{renderCell(val)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Meta Data */}
        <aside className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Info className="w-3.5 h-3.5" /> Company Profile
            </h3>
            {meta ? (
              <div className="space-y-4">
                <div>
                  <div className="text-xl font-black text-slate-900">{meta.name}</div>
                  <div className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded inline-block mt-1 uppercase">
                    {meta.exchangeCode}
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-6">{meta.description}</p>
                <div className="pt-4 border-t border-slate-50 grid grid-cols-2 gap-4">
                  <MetaItem label="Ticker" value={meta.ticker} />
                  <MetaItem label="Start Date" value={meta.startDate} />
                </div>
              </div>
            ) : <div className="text-xs text-slate-300 italic">No metadata found</div>}
          </div>
        </aside>
      </main>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button onClick={onClick} className={clsx("flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all", active ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700")}>
      {icon} {label}
    </button>
  );
}

function MetaItem({ label, value }: { label: string, value: string }) {
  return (
    <div>
      <div className="text-[9px] font-black text-slate-400 uppercase">{label}</div>
      <div className="text-xs font-bold text-slate-700 mt-0.5">{value}</div>
    </div>
  );
}

function renderCell(val: any) {
  if (val === null || val === undefined) return "-";
  const str = String(val);
  if (str.includes("T00:00:00")) return str.split('T')[0];
  if (typeof val === 'number') {
    if (val > 1000000) return (val / 1000000).toFixed(2) + "M";
    return val.toLocaleString();
  }
  return str;
}
