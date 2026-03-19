"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { Loader2, RefreshCcw, Database, ShieldCheck, LineChart, BarChart2 } from "lucide-react";
import { clsx } from "clsx";
import { TVChart } from "@/components/charts/tradingview-chart";

type FinvizMode = "screener" | "chart";

export default function FinvizContainer() {
  const searchParams = useSearchParams();
  const urlSymbol = searchParams.get("symbol");
  
  const [mode, setMode] = useState<FinvizMode>("screener");
  const [searchSymbol, setSearchSymbol] = useState(urlSymbol || "AAPL");

  useEffect(() => {
    if (urlSymbol) {
      setSearchSymbol(urlSymbol);
    }
  }, [urlSymbol]);

  // 统一采用 Tiingo API 数据源
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["finviz-tiingo-data", mode, searchSymbol],
    queryFn: async () => {
      // 无论是概览还是图表，都请求长周期的历史数据 (10年)
      const { data } = await axios.get("/api/proxy/tiingo", {
        params: { 
          endpoint: "daily", 
          symbol: searchSymbol,
          startDate: "2016-01-01" // 获取 10 年数据
        }
      });
      
      if (data.error) throw new Error(data.details || data.error);
      return data.data;
    },
    retry: false
  });

  // 转换 Tiingo 数据为 Lightweight Charts 格式
  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return data.map((d: any) => ({
      time: d.date.split('T')[0],
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    })).sort((a, b) => a.time.localeCompare(b.time));
  }, [data]);

  return (
    <div className="container mx-auto py-4 px-4">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-2 p-1 bg-muted rounded-lg shadow-inner">
            <button
              onClick={() => setMode("screener")}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all",
                mode === "screener" ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <BarChart2 className="w-4 h-4" />
              市场概览
            </button>
            <button
              onClick={() => setMode("chart")}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all",
                mode === "chart" ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <LineChart className="w-4 h-4" />
              技术图表
            </button>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
            <Database className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Tiingo Stable Mode</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input 
            type="text" 
            value={searchSymbol}
            onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
            className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
            placeholder="Symbol"
          />
          <button 
            onClick={() => refetch()}
            className="flex items-center gap-2 text-sm bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
          >
            <RefreshCcw className="w-4 h-4" />
            更新数据
          </button>
        </div>
      </div>

      <main className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xl shadow-slate-200/50 min-h-[500px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 text-muted-foreground">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
            <p className="font-bold tracking-tight text-slate-400">正在生成技术分析视图...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-40 px-6 text-center">
            <div className="bg-red-50 p-4 rounded-full mb-4">
              <ShieldCheck className="w-10 h-10 text-red-400" />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2 uppercase italic">API Access Restricted</h3>
            <p className="text-sm text-slate-400 max-w-md">{error.message}</p>
          </div>
        ) : (
          <div className="p-2">
            {mode === "chart" ? (
              <div className="p-4 animate-in zoom-in-95 duration-500">
                {chartData.length > 0 ? (
                  <TVChart data={chartData} symbol={searchSymbol} />
                ) : (
                  <div className="py-32 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                    No Price Data Available for Chart
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      {data && data.length > 0 && Object.keys(data[0]).map((key) => (
                        <th key={key} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data?.map((row: any, i: number) => (
                      <tr key={i} className="hover:bg-blue-50/30 transition-colors group">
                        {Object.values(row).map((val: any, j) => (
                          <td key={j} className="px-6 py-4 text-sm font-bold text-slate-600">
                            {renderCell(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
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
