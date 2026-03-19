"use client";

import { useState } from "react";
import { useFinviz } from "@/hooks/use-finviz";
import { FINVIZ_FILTERS, FINVIZ_VIEWS } from "@/lib/finviz-constants";
import { Loader2, RefreshCcw, TrendingUp, Users } from "lucide-react";
import { clsx } from "clsx";

type FinvizMode = "screener" | "insider";

export default function FinvizContainer() {
  const [mode, setMode] = useState<FinvizMode>("screener");
  const [view, setView] = useState(FINVIZ_VIEWS.OVERVIEW);

  const { data, isLoading, isFetching, refetch } = useFinviz({
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

      <main className="bg-card border rounded-xl overflow-hidden shadow-md">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            正在解析 Finviz 数据...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-muted/50 border-b">
                  {data && data.length > 0 && Object.keys(data[0]).map((key) => (
                    <th key={key} className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {data?.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-muted/30 transition-colors">
                    {Object.values(row).map((val: any, j) => (
                      <td key={j} className="px-4 py-3 text-sm font-medium">
                        {renderFinvizCell(val)}
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

function renderFinvizCell(val: string) {
  if (val.includes("%")) {
    const num = parseFloat(val);
    return (
      <span className={clsx(num > 0 ? "text-green-500" : num < 0 ? "text-red-500" : "")}>
        {val}
      </span>
    );
  }
  if (val === "Buy") return <span className="text-green-500 font-bold">买入</span>;
  if (val === "Sale") return <span className="text-red-500 font-bold">卖出</span>;
  return val;
}
