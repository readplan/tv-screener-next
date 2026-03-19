"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { 
  BarChart2, Newspaper, Coins, Landmark, Zap, Search, HelpCircle, 
  ChevronRight, ArrowUpRight, ArrowDownRight, Activity, Loader2
} from "lucide-react";
import { clsx } from "clsx";

type TiingoSection = "rest" | "websockets" | "utilities";
type TiingoEndpoint = "daily" | "news" | "crypto" | "forex" | "iex" | "fundamentals";

export default function TiingoContainer() {
  const [activeEndpoint, setActiveEndpoint] = useState<TiingoEndpoint>("news");
  const [searchSymbol, setSearchSymbol] = useState("AAPL");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["tiingo-data", activeEndpoint, searchSymbol],
    queryFn: async () => {
      const { data } = await axios.get("/api/proxy/tiingo", {
        params: { endpoint: activeEndpoint, symbol: searchSymbol }
      });
      return data;
    },
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
            <MenuLink label="2.3 Crypto" icon={<Coins className="w-4 h-4"/>} active={activeEndpoint === "crypto"} onClick={() => setActiveEndpoint("crypto")} />
            <MenuLink label="2.4 Forex" icon={<Zap className="w-4 h-4"/>} active={activeEndpoint === "forex"} onClick={() => setActiveEndpoint("forex")} />
            <MenuLink label="2.5 IEX" icon={<Landmark className="w-4 h-4"/>} active={activeEndpoint === "iex"} onClick={() => setActiveEndpoint("iex")} />
            <MenuLink label="2.6 Fundamentals" icon={<Activity className="w-4 h-4"/>} active={activeEndpoint === "fundamentals"} onClick={() => setActiveEndpoint("fundamentals")} />
          </nav>
        </div>

        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-lg mb-6">
            <Zap className="w-5 h-5" />
            <span>3. Websockets</span>
          </div>
          <nav className="space-y-1">
            <MenuLink label="3.1 Crypto" icon={<Coins className="w-4 h-4"/>} active={false} onClick={() => {}} />
            <MenuLink label="3.2 Forex" icon={<Zap className="w-4 h-4"/>} active={false} onClick={() => {}} />
            <MenuLink label="3.3 IEX" icon={<Landmark className="w-4 h-4"/>} active={false} onClick={() => {}} />
          </nav>
        </div>

        <div className="mt-auto pt-8">
          <div className="flex items-center gap-2 text-slate-500 font-bold text-lg mb-4">
            <Search className="w-5 h-5" />
            <span>4. Utilities</span>
          </div>
          <MenuLink label="4.1 Search" icon={<Search className="w-4 h-4"/>} active={false} onClick={() => {}} />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
              {activeEndpoint} Analysis
            </h2>
            <p className="text-slate-400 text-sm mt-1">Real-time data powered by Tiingo API</p>
          </div>
          
          <div className="flex gap-2">
            <input 
              type="text" 
              value={searchSymbol}
              onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
              className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Ticker (e.g. AAPL)"
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
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm min-h-[500px] p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full py-32 text-slate-300">
              <Loader2 className="w-12 h-12 animate-spin mb-4" />
              <span>Fetching from Tiingo...</span>
            </div>
          ) : (
            <div className="animate-in fade-in duration-500">
              {activeEndpoint === "news" && <NewsDisplay news={data} />}
              {activeEndpoint === "fundamentals" && <FundamentalsDisplay data={data} />}
              {(activeEndpoint === "crypto" || activeEndpoint === "iex" || activeEndpoint === "forex") && (
                <pre className="text-xs bg-slate-50 p-4 rounded-xl overflow-auto max-h-[600px]">
                  {JSON.stringify(data, null, 2)}
                </pre>
              )}
              {activeEndpoint === "daily" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {data?.map((d: any, i: number) => (
                    <div key={i} className="p-4 border rounded-xl">
                      <div className="text-xs text-slate-400 font-bold mb-2">{d.date.split('T')[0]}</div>
                      <div className="text-lg font-black text-slate-800">${d.close}</div>
                    </div>
                  ))}
                </div>
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
  if (!data || !Array.isArray(data)) return null;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
            <th className="py-4">Date</th>
            <th className="py-4">Market Cap</th>
            <th className="py-4">PE Ratio</th>
            <th className="py-4">PB Ratio</th>
            <th className="py-4">Enterprise Value</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {data.map((row, i) => (
            <tr key={i} className="text-sm font-bold text-slate-700 hover:bg-slate-50/50">
              <td className="py-4 font-mono">{row.date}</td>
              <td className="py-4">{(row.marketCap / 1e9).toFixed(2)}B</td>
              <td className="py-4 text-purple-600">{row.peRatio?.toFixed(2)}</td>
              <td className="py-4">{row.pbRatio?.toFixed(2)}</td>
              <td className="py-4">{(row.enterpriseVal / 1e9).toFixed(2)}B</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
