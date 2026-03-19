"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { Loader2, RefreshCcw, Database, ShieldCheck, LineChart, LayoutGrid, Info, Activity } from "lucide-react";
import { clsx } from "clsx";
import { TVChart } from "@/components/charts/tradingview-chart";

type FinvizMode = "heatmap" | "chart";
type ChartRange = "1d" | "5d" | "1m" | "6m" | "ytd" | "1y" | "5y" | "10y" | "max";

const RANGES: { label: string; value: ChartRange }[] = [
  { label: "1D (Live)", value: "1d" }, { label: "5D", value: "5d" }, { label: "1M", value: "1m" },
  { label: "6M", value: "6m" }, { label: "YTD", value: "ytd" }, { label: "1Y", value: "1y" },
  { label: "5Y", value: "5y" }, { label: "MAX", value: "max" },
];

export default function FinvizContainer() {
  const searchParams = useSearchParams();
  const urlSymbol = searchParams.get("symbol");
  
  const [mode, setMode] = useState<FinvizMode>("heatmap");
  const [range, setRange] = useState<ChartRange>("1y");
  const [searchSymbol, setSearchSymbol] = useState(urlSymbol || "AAPL");

  useEffect(() => { if (urlSymbol) { setSearchSymbol(urlSymbol); setMode("chart"); } }, [urlSymbol]);

  // 1. 获取价格数据 (1D 使用 IEX, 其他使用 Daily)
  const isLiveMode = range === "1d";
  
  const startDate = useMemo(() => {
    if (isLiveMode) return null;
    const now = new Date();
    const start = new Date();
    switch (range) {
      case "5d": start.setDate(now.getDate() - 7); break;
      case "1m": start.setMonth(now.getMonth() - 1); break;
      case "6m": start.setMonth(now.getMonth() - 6); break;
      case "ytd": return `${now.getFullYear()}-01-01`;
      case "1y": start.setFullYear(now.getFullYear() - 1); break;
      case "5y": start.setFullYear(now.getFullYear() - 5); break;
      case "max": return "1970-01-01";
    }
    return start.toISOString().split('T')[0];
  }, [range, isLiveMode]);

  const { data: prices, isLoading: isPricesLoading, refetch } = useQuery({
    queryKey: ["tiingo-prices", searchSymbol, range],
    queryFn: async () => {
      // 1D 模式切换到 IEX 实时接口
      const endpoint = isLiveMode ? "iex" : "daily";
      const { data } = await axios.get("/api/proxy/tiingo", {
        params: { 
          endpoint, 
          symbol: searchSymbol, 
          startDate: startDate,
          mock: "false" // 确保行情数据真实
        }
      });
      return data.data;
    },
    enabled: mode === "chart",
    refetchInterval: isLiveMode ? 10000 : 0 // 1D 模式每 10 秒刷新一次
  });

  // 2. 获取元数据
  const { data: meta } = useQuery({
    queryKey: ["tiingo-meta", searchSymbol],
    queryFn: async () => {
      const { data } = await axios.get("/api/proxy/tiingo", {
        params: { endpoint: "daily_meta", symbol: searchSymbol }
      });
      return data.data;
    },
    enabled: mode === "chart"
  });

  const chartData = useMemo(() => {
    if (!prices || !Array.isArray(prices)) return [];
    
    if (isLiveMode) {
      // IEX 接口返回的是当前快照，我们需要构建成图表点
      return prices.map((d: any) => ({
        time: Math.floor(new Date(d.timestamp || Date.now()).getTime() / 1000) as any,
        open: d.open || d.last,
        high: d.high || d.last,
        low: d.low || d.last,
        close: d.last,
      }));
    }

    return prices.map((d: any) => ({
      time: d.date.split('T')[0],
      open: d.open, high: d.high, low: d.low, close: d.close,
    })).sort((a: any, b: any) => a.time.localeCompare(b.time));
  }, [prices, isLiveMode]);

  return (
    <div className="container mx-auto py-4 px-4">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-2 p-1 bg-muted rounded-lg shadow-inner">
            <button onClick={() => setMode("heatmap")} className={clsx("flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all", mode === "heatmap" ? "bg-white shadow-sm text-blue-600" : "text-slate-500")}>
              <LayoutGrid className="w-4 h-4" /> 市场热图
            </button>
            <button onClick={() => setMode("chart")} className={clsx("flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all", mode === "chart" ? "bg-white shadow-sm text-blue-600" : "text-slate-500")}>
              <LineChart className="w-4 h-4" /> 技术图表
            </button>
          </div>

          {mode === "chart" && (
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              {RANGES.map((r) => (
                <button key={r.value} onClick={() => setRange(r.value)} className={clsx("px-3 py-1 rounded-md text-[10px] font-black transition-all", range === r.value ? "bg-white shadow-sm text-blue-600" : "text-slate-400")}>
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <input type="text" value={searchSymbol} onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())} className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 w-32" placeholder="Symbol" />
          <button onClick={() => refetch()} className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
            <RefreshCcw className={clsx("w-4 h-4", isPricesLoading && "animate-spin")} />
          </button>
        </div>
      </div>

      <main className={clsx("grid gap-6", mode === "heatmap" ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-4")}>
        <div className={clsx(mode === "heatmap" ? "w-full" : "lg:col-span-3")}>
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xl shadow-slate-200/50 min-h-[600px] relative">
            {mode === "heatmap" ? (
              <TradingViewHeatmap />
            ) : isPricesLoading ? (
              <div className="flex flex-col items-center justify-center py-40 text-slate-300">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
                <p className="font-bold tracking-tight uppercase text-xs italic">
                  {isLiveMode ? "Streaming IEX Real-time Data..." : "Syncing Historical Data..."}
                </p>
              </div>
            ) : (
              <div className="p-4 animate-in fade-in duration-700">
                <TVChart data={chartData} symbol={searchSymbol} />
              </div>
            )}
          </div>
        </div>

        {mode === "chart" && (
          <aside className="space-y-6 animate-in slide-in-from-right duration-500">
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Activity className="w-20 h-20" /></div>
              <div className="relative z-10">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                  {isLiveMode ? "IEX Real-time Quote" : "Daily Close Quote"}
                </h3>
                {prices && prices.length > 0 ? (
                  <div className="space-y-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black tracking-tighter">
                        ${(isLiveMode ? prices[0].last : prices[prices.length-1].close).toFixed(2)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 border-t border-white/10 pt-4">
                      <MetaItem label="High" value={`$${(isLiveMode ? prices[0].high : prices[prices.length-1].high)?.toFixed(2)}`} light />
                      <MetaItem label="Low" value={`$${(isLiveMode ? prices[0].low : prices[prices.length-1].low)?.toFixed(2)}`} light />
                      <MetaItem label="Vol" value={((isLiveMode ? prices[0].volume : prices[prices.length-1].volume) / 1e6).toFixed(2) + 'M'} light />
                    </div>
                  </div>
                ) : <div className="text-xs text-slate-500 italic">Syncing price...</div>}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Info className="w-3.5 h-3.5" /> Company Profile</h3>
              {meta ? (
                <div className="space-y-4">
                  <div>
                    <div className="text-xl font-black text-slate-900 leading-tight">{meta.name}</div>
                    <div className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded inline-block mt-2 uppercase tracking-wider">{meta.exchangeCode}</div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-10">{meta.description}</p>
                </div>
              ) : <div className="text-xs text-slate-300 italic">Fetching profile...</div>}
            </div>
          </aside>
        )}
      </main>
    </div>
  );
}

function TradingViewHeatmap() {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!container.current) return;
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "exchanges": [], "dataSource": "sp500", "grouping": "sector", "blockSize": "market_cap_basic", "blockColor": "change", "locale": "zh_CN",
      "symbolUrl": "", "colorTheme": "light", "hasTopBar": false, "isDatasetEnabled": false, "isTransparent": false, "hasSymbolTooltip": true, "width": "100%", "height": "650"
    });
    container.current.appendChild(script);
    return () => { if (container.current) container.current.innerHTML = ""; };
  }, []);
  return <div className="tradingview-widget-container" ref={container} />;
}

function MetaItem({ label, value, light = false }: { label: string, value: any, light?: boolean }) {
  return (
    <div>
      <div className={clsx("text-[9px] font-black uppercase tracking-wider", light ? "text-slate-500" : "text-slate-400")}>{label}</div>
      <div className={clsx("text-sm font-black mt-0.5", light ? "text-white" : "text-slate-700")}>{value || '-'}</div>
    </div>
  );
}
