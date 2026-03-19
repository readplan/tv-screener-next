"use client";

import { useState } from "react";
import { useFinviz } from "@/hooks/use-finviz";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { FINVIZ_FILTERS, FINVIZ_VIEWS } from "@/lib/finviz-constants";
import { Loader2, RefreshCcw, TrendingUp, Users, AlertCircle, Database, ShieldCheck } from "lucide-react";
import { clsx } from "clsx";

type FinvizMode = "screener" | "insider";
type DataSource = "finviz" | "tiingo";

export default function FinvizContainer() {
  const [mode, setMode] = useState<FinvizMode>("screener");
  const [dataSource, setDataSource] = useState<DataSource>("finviz");
  const [view, setView] = useState(FINVIZ_VIEWS.OVERVIEW);

  // Finviz Scraper 数据
  const { 
    data: finvizData, 
    isLoading: isFinvizLoading, 
    isError: isFinvizError, 
    error: finvizError, 
    refetch: refetchFinviz 
  } = useFinviz({
    mode,
    view,
    filters: mode === "screener" ? FINVIZ_FILTERS.INDEX.SP500 : "",
    enabled: dataSource === "finviz"
  });

  // Tiingo API 降级数据 (演示模式：抓取 AAPL 的新闻或价格)
  const {
    data: tiingoData,
    isLoading: isTiingoLoading,
    isError: isTiingoError,
    refetch: refetchTiingo
  } = useQuery({
    queryKey: ["tiingo-fallback", mode],
    queryFn: async () => {
      const endpoint = mode === "screener" ? "daily" : "news";
      const { data } = await axios.get("/api/proxy/tiingo", {
        params: { endpoint, symbol: "AAPL" }
      });
      return data.data;
    },
    enabled: dataSource === "tiingo"
  });

  const isLoading = dataSource === "finviz" ? isFinvizLoading : isTiingoLoading;
  const isError = dataSource === "finviz" ? isFinvizError : isTiingoError;
  const displayData = dataSource === "finviz" ? finvizData : tiingoData;

  return (
    <div className="container mx-auto py-4 px-4">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          {/* 模式切换 */}
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setMode("screener")}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                mode === "screener" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <TrendingUp className="w-4 h-4" />
              筛选器
            </button>
            <button
              onClick={() => setMode("insider")}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                mode === "insider" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Users className="w-4 h-4" />
              内幕交易
            </button>
          </div>

          {/* 数据源切换 */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Source:</span>
            <button 
              onClick={() => setDataSource("finviz")}
              className={clsx(
                "px-3 py-1 rounded-full text-[10px] font-bold transition-all",
                dataSource === "finviz" ? "bg-slate-800 text-white" : "text-slate-500"
              )}
            >
              Finviz (Web)
            </button>
            <button 
              onClick={() => setDataSource("tiingo")}
              className={clsx(
                "px-3 py-1 rounded-full text-[10px] font-bold transition-all",
                dataSource === "tiingo" ? "bg-blue-600 text-white" : "text-slate-500"
              )}
            >
              Tiingo (API)
            </button>
          </div>
        </div>

        <button 
          onClick={() => dataSource === "finviz" ? refetchFinviz() : refetchTiingo()}
          className="flex items-center gap-2 text-sm bg-secondary px-4 py-2 rounded-md hover:bg-secondary/80 transition-colors"
        >
          <RefreshCcw className="w-4 h-4" />
          刷新
        </button>
      </div>

      <main className="bg-card border rounded-xl overflow-hidden shadow-md min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
            <p className="font-medium">正在获取 {dataSource === "finviz" ? "Finviz" : "Tiingo"} 数据...</p>
          </div>
        ) : isError && dataSource === "finviz" ? (
          <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
            <div className="bg-red-100 p-3 rounded-full mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Finviz 访问受限 (403)</h3>
            <p className="text-sm text-gray-500 max-w-md mb-8">
              当前 IP 抓取请求过多被拦截。建议切换至更稳定的 Tiingo API 数据源。
            </p>
            <button 
              onClick={() => setDataSource("tiingo")} 
              className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl text-sm font-black uppercase tracking-wider hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              <Database className="w-4 h-4" />
              切换至 Tiingo API 模式
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {dataSource === "tiingo" && (
              <div className="bg-blue-50/50 px-6 py-3 border-b border-blue-100 flex items-center gap-2 text-blue-700 text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
                已自动降级至 Tiingo API 稳定模式
              </div>
            )}
            
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-muted/50 border-b">
                  {displayData && displayData.length > 0 && Object.keys(displayData[0]).map((key) => (
                    <th key={key} className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y bg-white text-slate-700">
                {displayData?.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                    {Object.values(row).map((val: any, j) => (
                      <td key={j} className="px-4 py-3 text-sm font-medium border-r last:border-r-0 border-gray-50 max-w-[300px] truncate">
                        {renderCell(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

function renderCell(val: any) {
  if (val === null || val === undefined) return "-";
  const str = String(val);
  
  if (str.includes("%")) {
    const num = parseFloat(str);
    return (
      <span className={clsx("font-mono", num > 0 ? "text-green-600" : num < 0 ? "text-red-600" : "text-gray-600")}>
        {num > 0 ? "+" : ""}{str}
      </span>
    );
  }
  
  if (str === "Buy" || str.includes("Strong Buy")) return <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">买入</span>;
  if (str === "Sale" || str.includes("Strong Sell")) return <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold">卖出</span>;
  
  return str;
}
