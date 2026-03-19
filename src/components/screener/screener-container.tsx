"use client";

import { useState } from "react";
import { useTVScreener } from "@/hooks/use-tv-screener";
import { PRESETS, COLUMN_LABELS, DEFAULT_COLUMNS, MARKET_CAP_OPTIONS } from "@/lib/tv-constants";
import { Loader2, RefreshCcw, ChevronDown } from "lucide-react";
import { clsx } from "clsx";
import { useRouter } from "next/navigation";

export default function ScreenerContainer() {
  const router = useRouter();
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof PRESETS>("MOST_ACTIVE");
  const [marketCapFilter, setMarketCapFilter] = useState<any>(null);
  
  const currentFilters = [
    ...PRESETS[selectedPreset].filter,
    ...(marketCapFilter ? [marketCapFilter] : []),
  ];

  const { data, isLoading, isFetching, refetch } = useTVScreener({
    filter: currentFilters,
    sort: PRESETS[selectedPreset].sort,
  });

  const handleTickerClick = (ticker: string) => {
    // 处理 Ticker 格式，某些可能带市场前缀，我们提取主体
    const cleanTicker = ticker.split(':').pop() || ticker;
    router.push(`?tab=finviz&symbol=${cleanTicker}`);
  };

  const renderCell = (col: string, value: any, ticker: string) => {
    if (value === null || value === undefined) return "-";

    if (col === "change") {
      const isPositive = value > 0;
      return (
        <span className={clsx("font-bold px-2 py-1 rounded text-xs", isPositive ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50")}>
          {isPositive ? "+" : ""}{value.toFixed(2)}%
        </span>
      );
    }

    if (col === "close") {
      return <span className="font-mono font-bold text-slate-900">${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>;
    }

    if (col === "volume" || col === "market_cap_basic") {
      return <span className="text-slate-500 font-semibold">{formatNumber(value)}</span>;
    }

    if (col === "Recommend.All") {
      const label = getRecommendationLabel(value);
      return (
        <span className={clsx(
          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight",
          value > 0.5 ? "bg-green-600 text-white" : value < -0.5 ? "bg-red-600 text-white" : "bg-slate-100 text-slate-600"
        )}>
          {label}
        </span>
      );
    }

    if (col === "name") {
      return (
        <button 
          onClick={() => handleTickerClick(ticker)}
          className="font-black text-blue-600 hover:underline underline-offset-4 cursor-pointer text-left"
        >
          {value}
        </button>
      );
    }

    return value;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">TradingView 筛选器</h1>
          <p className="text-muted-foreground mt-2">实时市场数据仪表盘</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <select 
              className="appearance-none bg-white border border-slate-200 rounded-lg px-4 py-2 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer shadow-sm"
              onChange={(e) => {
                const idx = parseInt(e.target.value);
                setMarketCapFilter(MARKET_CAP_OPTIONS[idx].value);
              }}
            >
              {MARKET_CAP_OPTIONS.map((opt, i) => (
                <option key={i} value={i}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          <button 
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCcw className={clsx("w-4 h-4", isFetching && "animate-spin")} />
            刷新
          </button>
        </div>
      </header>

      <nav className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {(Object.keys(PRESETS) as Array<keyof typeof PRESETS>).map((key) => (
          <button
            key={key}
            onClick={() => setSelectedPreset(key)}
            className={clsx(
              "px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all",
              selectedPreset === key 
                ? "bg-blue-600 text-white shadow-md shadow-blue-100" 
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            )}
          >
            {PRESETS[key].label}
          </button>
        ))}
      </nav>

      <main className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xl shadow-slate-200/50">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
            正在从 TradingView 获取数据...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  {DEFAULT_COLUMNS.map((col) => (
                    <th key={col} className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {COLUMN_LABELS[col] || col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data?.data.map((row: any) => (
                  <tr key={row.ticker} className="hover:bg-blue-50/30 transition-colors group">
                    {DEFAULT_COLUMNS.map((col) => (
                      <td key={col} className="px-6 py-4 text-sm font-medium text-slate-700">
                        {renderCell(col, row[col], row.ticker)}
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

function formatNumber(num: number) {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
  return num.toString();
}

function getRecommendationLabel(val: number) {
  if (val > 0.5) return "Strong Buy";
  if (val > 0.1) return "Buy";
  if (val > -0.1) return "Neutral";
  if (val > -0.5) return "Sell";
  return "Strong Sell";
}
