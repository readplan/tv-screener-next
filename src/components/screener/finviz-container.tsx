"use client";

import { useState } from "react";
import { useFinviz } from "@/hooks/use-finviz";
import { FINVIZ_FILTERS, FINVIZ_VIEWS } from "@/lib/finviz-constants";
import { Loader2, RefreshCcw, TrendingUp, Users, AlertCircle } from "lucide-react";
import { clsx } from "clsx";

type FinvizMode = "screener" | "insider";

export default function FinvizContainer() {
  const [mode, setMode] = useState<FinvizMode>("screener");
  const [view, setView] = useState(FINVIZ_VIEWS.OVERVIEW);

  const { data, isLoading, isFetching, isError, error, refetch } = useFinviz({
    mode,
    view,
    filters: mode === "screener" ? FINVIZ_FILTERS.INDEX.SP500 : "",
  });

  return (
    <div className="container mx-auto py-4 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
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

        <button 
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 text-sm bg-secondary px-4 py-2 rounded-md hover:bg-secondary/80 transition-colors"
        >
          <RefreshCcw className={clsx("w-4 h-4", isFetching && "animate-spin")} />
          刷新数据
        </button>
      </div>

      <main className="bg-card border rounded-xl overflow-hidden shadow-md min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
            <p className="font-medium">正在通过代理请求并解析 Finviz 数据...</p>
            <p className="text-xs mt-2 opacity-70">这可能需要几秒钟，取决于 Finviz 的响应速度</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
            <div className="bg-red-100 p-3 rounded-full mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">数据获取失败</h3>
            <p className="text-sm text-gray-500 max-w-md mb-6">
              {((error as any)?.response?.data?.error || error.message)}
              <br />
              <span className="text-xs mt-2 block opacity-80">
                Finviz 似乎检测到了自动化脚本并拦截了请求 (403 Forbidden)。
                建议在不同的时间段重试，或者检查代理服务器的 IP 是否被风控。
              </span>
            </p>
            <button 
              onClick={() => refetch()} 
              className="bg-gray-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              再次尝试抓取
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-muted/50 border-b">
                  {data && data.length > 0 && Object.keys(data[0]).map((key) => (
                    <th key={key} className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y bg-white">
                {data?.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                    {Object.values(row).map((val: any, j) => (
                      <td key={j} className="px-4 py-3 text-sm font-medium border-r last:border-r-0 border-gray-50">
                        {renderFinvizCell(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {(!data || data.length === 0) && (
              <div className="py-24 text-center text-muted-foreground">
                没有找到匹配的数据。
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function renderFinvizCell(val: string) {
  if (!val) return "-";
  
  if (val.includes("%")) {
    const num = parseFloat(val);
    return (
      <span className={clsx("font-mono", num > 0 ? "text-green-600" : num < 0 ? "text-red-600" : "text-gray-600")}>
        {num > 0 ? "+" : ""}{val}
      </span>
    );
  }
  
  if (val === "Buy" || val.includes("Strong Buy")) return <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">买入</span>;
  if (val === "Sale" || val.includes("Strong Sell")) return <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold">卖出</span>;
  
  return val;
}
