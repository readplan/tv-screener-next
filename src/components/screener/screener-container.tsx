"use client";

import { useState } from "react";
import { useTVScreener } from "@/hooks/use-tv-screener";
import { PRESETS, COLUMN_LABELS, DEFAULT_COLUMNS } from "@/lib/tv-constants";
import { Loader2, RefreshCcw } from "lucide-react";
import { clsx } from "clsx";

export default function ScreenerContainer() {
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof PRESETS>("MOST_ACTIVE");
  
  const { data, isLoading, isFetching, refetch } = useTVScreener({
    filter: PRESETS[selectedPreset].filter,
    sort: PRESETS[selectedPreset].sort,
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">TradingView 筛选器</h1>
          <p className="text-muted-foreground mt-2">实时市场数据仪表盘</p>
        </div>
        <button 
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-md hover:bg-secondary/80 transition-colors"
        >
          <RefreshCcw className={clsx("w-4 h-4", isFetching && "animate-spin")} />
          刷新
        </button>
      </header>

      <nav className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(Object.keys(PRESETS) as Array<keyof typeof PRESETS>).map((key) => (
          <button
            key={key}
            onClick={() => setSelectedPreset(key)}
            className={clsx(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              selectedPreset === key 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            )}
          >
            {PRESETS[key].label}
          </button>
        ))}
      </nav>

      <main className="bg-card border rounded-lg overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            正在从 TradingView 获取数据...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-bottom">
                  {DEFAULT_COLUMNS.map((col) => (
                    <th key={col} className="px-4 py-3 text-sm font-semibold text-muted-foreground">
                      {COLUMN_LABELS[col] || col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {data?.data.map((row: any) => (
                  <tr key={row.ticker} className="hover:bg-muted/30 transition-colors group">
                    {DEFAULT_COLUMNS.map((col) => (
                      <td key={col} className="px-4 py-3 text-sm">
                        {renderCell(col, row[col])}
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

function renderCell(col: string, value: any) {
  if (value === null || value === undefined) return "-";

  if (col === "change") {
    const isPositive = value > 0;
    return (
      <span className={clsx("font-medium", isPositive ? "text-green-500" : "text-red-500")}>
        {isPositive ? "+" : ""}{value.toFixed(2)}%
      </span>
    );
  }

  if (col === "close") {
    return <span className="font-mono font-medium">${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>;
  }

  if (col === "volume" || col === "market_cap_basic") {
    return formatNumber(value);
  }

  if (col === "Recommend.All") {
    const label = getRecommendationLabel(value);
    return (
      <span className={clsx(
        "px-2 py-1 rounded text-xs font-bold",
        value > 0.5 ? "bg-green-100 text-green-700" : value < -0.5 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
      )}>
        {label}
      </span>
    );
  }

  return value;
}

function formatNumber(num: number) {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
  return num.toString();
}

function getRecommendationLabel(val: number) {
  if (val > 0.5) return "强力买入";
  if (val > 0.1) return "买入";
  if (val > -0.1) return "中性";
  if (val > -0.5) return "卖出";
  return "强力卖出";
}
