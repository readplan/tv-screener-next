"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { 
  BarChart2, Newspaper, Coins, Landmark, Zap, Search,
  ChevronRight, ArrowUpRight, Activity, Loader2, AlertCircle
} from "lucide-react";
import { clsx } from "clsx";

type TiingoEndpoint = "daily" | "news" | "crypto" | "forex" | "iex" | "fundamentals" | "dividends" | "splits";

export default function TiingoContainer() {
  const [activeEndpoint, setActiveEndpoint] = useState<TiingoEndpoint>("daily");
  const [searchSymbol, setSearchSymbol] = useState("AAPL");

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["tiingo-data", activeEndpoint, searchSymbol],
    queryFn: async () => {
      const { data } = await axios.get("/api/proxy/tiingo", {
        params: { endpoint: activeEndpoint, symbol: searchSymbol }
      });
      // 这里的 data.data 是因为后端代理返回的是 { data: [...] }
      if (data.error) throw new Error(data.details || data.error);
      return data.data;
    },
    retry: false, // 403 错误重试没意义
  });

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#f8f9fc]">
      {/* Sidebar - 复刻文档结构 */}
      <aside className="w-64 bg-white border-r border-slate-200 overflow-y-auto p-6 flex flex-col gap-8">
        <div>
          <div className="flex items-center gap-2 text-purple-700 font-bold text-lg mb-6">
            <Activity className="w-5 h-5" />
            <span>2. REST</span>
          </div>
          <nav className="space-y-1">
            <MenuLink label="2.1 End-of-Day" icon={<BarChart2 className="w-4 h-4"/>} active={activeEndpoint === "daily"} onClick={() => setActiveEndpoint("daily")} />
            <MenuLink label="2.2 News" icon={<Newspaper className="w-4 h-4"/>} active={activeEndpoint === "news"} onClick={() => setActiveEndpoint("news")} />
            <MenuLink label="2.3 Crypto" icon={<Coins className="w-4 h-4"/>} active={activeEndpoint === "crypto"} onClick={() => { setSearchSymbol("BTCUSD"); setActiveEndpoint("crypto"); }} />
            <MenuLink label="2.4 Forex" icon={<Zap className="w-4 h-4"/>} active={activeEndpoint === "forex"} onClick={() => { setSearchSymbol("AUDUSD"); setActiveEndpoint("forex"); }} />
            <MenuLink label="2.5 IEX" icon={<Landmark className="w-4 h-4"/>} active={activeEndpoint === "iex"} onClick={() => setActiveEndpoint("iex")} />
            <MenuLink label="2.6 Fundamentals" icon={<Activity className="w-4 h-4"/>} active={activeEndpoint === "fundamentals"} onClick={() => setActiveEndpoint("fundamentals")} />
            <MenuLink label="2.8 Dividends" icon={<ArrowUpRight className="w-4 h-4"/>} active={activeEndpoint === "dividends"} onClick={() => setActiveEndpoint("dividends")} />
            <MenuLink label="2.9 Splits" icon={<ArrowUpRight className="w-4 h-4"/>} active={activeEndpoint === "splits"} onClick={() => setActiveEndpoint("splits")} />
          </nav>
        </div>

        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-lg mb-6">
            <Zap className="w-5 h-5" />
            <span>3. Websockets</span>
          </div>
          <nav className="space-y-1">
            <div className="px-4 py-2 text-xs text-slate-400 font-medium italic">Streaming Coming Soon...</div>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
              {activeEndpoint === "daily" ? "Historical Prices" : activeEndpoint}
            </h2>
            <p className="text-slate-400 text-sm mt-1">Real-time data powered by Tiingo API</p>
          </div>
          
          <div className="flex gap-2">
            <input 
              type="text" 
              value={searchSymbol}
              onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
              className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Symbol (e.g. AAPL, BTCUSD)"
            />
            <button 
              onClick={() => refetch()}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-100"
            >
              Update
            </button>
          </div>
        </header>

        {/* Data Display Content */}
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm min-h-[500px] p-6 relative">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full py-32 text-slate-300">
              <Loader2 className="w-12 h-12 animate-spin mb-4" />
              <span>Fetching from Tiingo...</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center h-full py-32 text-red-400">
              <AlertCircle className="w-12 h-12 mb-4" />
              <span>{error.message}</span>
            </div>
          ) : (
            <div className="animate-in fade-in duration-500">
              {activeEndpoint === "news" && <NewsDisplay news={data} />}
              {activeEndpoint === "fundamentals" && <FundamentalsDisplay data={data} />}
              {activeEndpoint === "daily" && <HistoricalDisplay data={data} />}
              {(activeEndpoint === "crypto" || activeEndpoint === "iex" || activeEndpoint === "forex") && (
                <RawJsonDisplay data={data} />
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function MenuLink({ label, icon, active, onClick }: { label: string, icon: any, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={clsx(
        "w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-all group",
        active 
          ? "bg-purple-50 text-purple-700 shadow-sm" 
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
      )}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
      <ChevronRight className={clsx("w-4 h-4 opacity-0 transition-all", active ? "opacity-100 translate-x-0" : "group-hover:opacity-100 group-hover:translate-x-1")} />
    </button>
  );
}

function RawJsonDisplay({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      <div className="text-xs font-bold text-slate-400 uppercase">Raw Response</div>
      <pre className="text-xs bg-slate-900 text-emerald-400 p-6 rounded-xl overflow-auto max-h-[600px] border border-slate-800 shadow-2xl">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

function NewsDisplay({ news }: { news: any[] }) {
  if (!news || !Array.isArray(news)) return null;
  return (
    <div className="space-y-6">
      {news.map((item, i) => (
        <article key={i} className="group border-b border-slate-50 pb-6 last:border-0">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase tracking-wider">{item.source}</span>
                <span className="text-[10px] text-slate-400 font-medium">{new Date(item.publishedDate).toLocaleString()}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 group-hover:text-purple-600 transition-colors cursor-pointer leading-tight">
                {item.title}
              </h3>
              <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            </div>
            {item.url && (
              <a href={item.url} target="_blank" className="p-2 bg-slate-50 rounded-full text-slate-400 hover:bg-purple-50 hover:text-purple-600 transition-all">
                <ArrowUpRight className="w-5 h-5" />
              </a>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

function FundamentalsDisplay({ data }: { data: any[] }) {
  if (!data || !Array.isArray(data)) return <div className="text-center py-24 text-slate-400">No fundamental data available for this symbol.</div>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
            <th className="py-4">Date</th>
            <th className="py-4">Market Cap</th>
            <th className="py-4">PE Ratio</th>
            <th className="py-4">PB Ratio</th>
            <th className="py-4">Revenue (TTM)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {data.map((row, i) => (
            <tr key={i} className="text-sm font-bold text-slate-700 hover:bg-slate-50/50">
              <td className="py-4 font-mono">{row.date}</td>
              <td className="py-4">{(row.marketCap / 1e9).toFixed(2)}B</td>
              <td className="py-4 text-purple-600">{row.peRatio?.toFixed(2) || 'N/A'}</td>
              <td className="py-4">{row.pbRatio?.toFixed(2) || 'N/A'}</td>
              <td className="py-4">{(row.revenueQ / 1e9).toFixed(2) || 'N/A'}B</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HistoricalDisplay({ data }: { data: any[] }) {
  if (!data || !Array.isArray(data)) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {data.map((d: any, i: number) => (
        <div key={i} className="p-4 border border-slate-100 rounded-xl hover:shadow-md transition-all group">
          <div className="text-[10px] text-slate-400 font-bold mb-2 group-hover:text-purple-500">{d.date.split('T')[0]}</div>
          <div className="flex justify-between items-end">
            <div className="text-xl font-black text-slate-800">${d.close.toFixed(2)}</div>
            <div className={clsx("text-xs font-bold", d.close >= d.open ? "text-green-500" : "text-red-500")}>
              {((d.close - d.open) / d.open * 100).toFixed(2)}%
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
