"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { Loader2, RefreshCcw, Database, ShieldCheck, Newspaper, BarChart2 } from "lucide-react";
import { clsx } from "clsx";

type FinvizMode = "screener" | "insider";

export default function FinvizContainer() {
  const searchParams = useSearchParams();
  const urlSymbol = searchParams.get("symbol");
  
  const [mode, setMode] = useState<FinvizMode>("screener");
  const [searchSymbol, setSearchSymbol] = useState(urlSymbol || "AAPL");

  // 当 URL 中的 symbol 变化时，同步更新本地搜索状态
  useEffect(() => {
    if (urlSymbol) {
      setSearchSymbol(urlSymbol);
    }
  }, [urlSymbol]);

  // 统一采用 Tiingo API 数据源
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["finviz-tiingo-data", mode, searchSymbol],
    queryFn: async () => {
      const endpoint = mode === "screener" ? "daily" : "news";
      const { data } = await axios.get("/api/proxy/tiingo", {
        params: { endpoint, symbol: searchSymbol }
      });
      
      if (data.error) throw new Error(data.details || data.error);
      return data.data;
    },
    retry: false
  });

  return (
    <div className="container mx-auto py-4 px-4">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          {/* 模式切换 */}
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
              onClick={() => setMode("insider")}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all",
                mode === "insider" ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Newspaper className="w-4 h-4" />
              关联新闻
            </button>
          </div>

          {/* 状态标识 */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
            <Database className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Tiingo API Mode</span>
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
            <p className="font-bold tracking-tight text-slate-400">正在调取 Tiingo 实时接口...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-40 px-6 text-center">
            <div className="bg-red-50 p-4 rounded-full mb-4">
              <ShieldCheck className="w-10 h-10 text-red-400" />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2 uppercase italic">API Access Restricted</h3>
            <p className="text-sm text-slate-400 max-w-md">
              {error.message}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto p-2">
            {mode === "insider" ? (
              <div className="space-y-4 p-4">
                {data?.map((item: any, i: number) => (
                  <div key={i} className="border-b border-slate-50 pb-4 last:border-0 hover:bg-slate-50/50 p-4 rounded-xl transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] font-black bg-blue-100 text-blue-600 px-2 py-0.5 rounded">{item.source}</span>
                      <span className="text-[10px] text-slate-400 font-bold">{new Date(item.publishedDate).toLocaleDateString()}</span>
                    </div>
                    <h4 className="font-bold text-slate-800 leading-snug">{item.title}</h4>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2">{item.description}</p>
                  </div>
                ))}
              </div>
            ) : (
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
  if (typeof val === 'number' && val > 1000) return val.toLocaleString();
  return str;
}
