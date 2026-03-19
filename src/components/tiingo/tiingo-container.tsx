"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { 
  BarChart2, Newspaper, Coins, Landmark, Zap, Search,
  ChevronRight, ArrowUpRight, Activity, Loader2, AlertCircle, Link2, Wifi, Globe, Database
} from "lucide-react";
import { clsx } from "clsx";

type ApiProvider = "tiingo" | "fred";

interface APIConfig {
  label: string;
  endpoint: string;
  url: string;
  icon: any;
  category: "REST" | "WebSocket" | "Utility";
}

const TIINGO_STRUCTURE: APIConfig[] = [
  { category: "REST", label: "2.1 End-of-Day", endpoint: "daily", icon: BarChart2, url: "https://api.tiingo.com/tiingo/daily/<ticker>/prices" },
  { category: "REST", label: "2.1 Meta Data", endpoint: "daily_meta", icon: Search, url: "https://api.tiingo.com/tiingo/daily/<ticker>" },
  { category: "REST", label: "2.2 News", endpoint: "news", icon: Newspaper, url: "https://api.tiingo.com/tiingo/news" },
  { category: "WebSocket", label: "3.1 WS Crypto", endpoint: "ws_crypto", icon: Wifi, url: "wss://api.tiingo.com/crypto" },
  { category: "WebSocket", label: "3.3 WS IEX", endpoint: "ws_iex", icon: Wifi, url: "wss://api.tiingo.com/iex" },
  { category: "Utility", label: "4.1 Search", endpoint: "search", icon: Search, url: "https://api.tiingo.com/tiingo/utilities/search?query=<query>" },
];

const FRED_STRUCTURE: APIConfig[] = [
  { category: "REST", label: "Series Info", endpoint: "series", icon: Activity, url: "https://api.stlouisfed.org/fred/series?series_id=<id>" },
  { category: "REST", label: "Observations", endpoint: "observations", icon: BarChart2, url: "https://api.stlouisfed.org/fred/series/observations?series_id=<id>" },
  { category: "REST", label: "Releases", endpoint: "releases", icon: Globe, url: "https://api.stlouisfed.org/fred/releases" },
  { category: "REST", label: "Release Obs", endpoint: "release_observations", icon: Landmark, url: "https://api.stlouisfed.org/fred/release/observations?release_id=<id>" },
];

export default function TiingoContainer() {
  const [provider, setProvider] = useState<ApiProvider>("tiingo");
  const [activeEndpoint, setActiveEndpoint] = useState<string>("daily");
  const [searchSymbol, setSearchSymbol] = useState("AAPL");

  const currentStructure = provider === "tiingo" ? TIINGO_STRUCTURE : FRED_STRUCTURE;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["terminal-api-data", provider, activeEndpoint, searchSymbol],
    queryFn: async () => {
      const proxyPath = provider === "tiingo" ? "/api/proxy/tiingo" : "/api/proxy/fred";
      const params: any = { endpoint: activeEndpoint, mock: "true" };
      
      if (provider === "tiingo") params.symbol = searchSymbol;
      else {
        params.series_id = searchSymbol === "AAPL" ? "VIXCLS" : searchSymbol;
        params.release_id = "10";
      }

      const { data } = await axios.get(proxyPath, { params });
      if (data.error) throw new Error(data.details || data.error);
      return data.data;
    },
    retry: false,
  });

  const handleProviderChange = (p: ApiProvider) => {
    setProvider(p);
    setActiveEndpoint(p === "tiingo" ? "daily" : "series");
    setSearchSymbol(p === "tiingo" ? "AAPL" : "VIXCLS");
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#f8f9fc]">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-slate-200 overflow-y-auto flex flex-col shadow-sm">
        <div className="p-6 border-b border-slate-50 space-y-4">
          <div className="flex items-center gap-2 text-blue-600 font-black text-xl italic tracking-tighter uppercase">
            {provider} <span className="text-slate-400 not-italic">API</span>
          </div>
          
          {/* Provider Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button onClick={() => handleProviderChange("tiingo")} className={clsx("flex-1 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all", provider === "tiingo" ? "bg-white shadow-sm text-blue-600" : "text-slate-400")}>Tiingo</button>
            <button onClick={() => handleProviderChange("fred")} className={clsx("flex-1 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all", provider === "fred" ? "bg-white shadow-sm text-red-600" : "text-slate-400")}>FRED V2</button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {["REST", "WebSocket", "Utility"].map((cat) => {
            const items = currentStructure.filter(a => a.category === cat);
            if (items.length === 0) return null;
            return (
              <div key={cat} className="space-y-2">
                <div className="px-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{cat} Endpoints</div>
                {items.map((item) => (
                  <button key={item.endpoint} onClick={() => setActiveEndpoint(item.endpoint)}
                    className={clsx("w-full text-left p-3 rounded-xl transition-all", activeEndpoint === item.endpoint ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "hover:bg-slate-50 text-slate-600")}>
                    <div className="flex items-center gap-3 mb-1"><item.icon className={clsx("w-4 h-4", activeEndpoint === item.endpoint ? "text-white" : "text-blue-500")} /> <span className="text-sm font-black tracking-tight">{item.label}</span></div>
                    <div className={clsx("text-[9px] font-mono break-all opacity-60", activeEndpoint === item.endpoint ? "text-blue-50" : "text-slate-400")}>{item.url.replace('<ticker>', searchSymbol).replace('<id>', searchSymbol)}</div>
                  </button>
                ))}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Main Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-end mb-8 border-b pb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-100 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded uppercase">{provider} Protocol</span>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest italic ml-2">Sandbox Mode Enabled</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">{activeEndpoint.replace('_', ' ')} Terminal</h2>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" value={searchSymbol} onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())} className="bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-50 w-48 shadow-sm" placeholder="Ticker / Series ID" />
            </div>
            <button onClick={() => refetch()} className="bg-slate-900 text-white px-8 py-3 rounded-xl text-sm font-black uppercase tracking-wider hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 italic">Execute Query</button>
          </div>
        </header>

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center gap-2 mb-4">
            <Link2 className="w-4 h-4 text-blue-500" />
            <span className="text-[10px] font-mono text-slate-400 font-bold tracking-tight bg-slate-50 px-2 py-1 rounded border border-slate-100 italic break-all">
              GET {currentStructure.find(a => a.endpoint === activeEndpoint)?.url.replace('<ticker>', searchSymbol).replace('<id>', searchSymbol).replace('<query>', searchSymbol)}
            </span>
          </div>
          <pre className="text-xs bg-slate-900 text-emerald-400 p-8 rounded-2xl overflow-auto max-h-[700px] border border-slate-800 shadow-2xl leading-relaxed">
            {JSON.stringify(data, null, 2)}
          </pre>
        </section>
      </main>
    </div>
  );
}
