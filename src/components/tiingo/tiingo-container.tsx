"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { 
  BarChart2, Newspaper, Coins, Landmark, Zap, Search,
  ChevronRight, ArrowUpRight, Activity, Loader2, AlertCircle, Link2, Wifi
} from "lucide-react";
import { clsx } from "clsx";

type TiingoEndpoint = 
  | "daily" | "daily_meta" | "news" | "crypto" | "forex" | "iex" 
  | "fundamentals" | "dividends" | "splits" | "search"
  | "ws_crypto" | "ws_forex" | "ws_iex";

interface APIConfig {
  label: string;
  endpoint: TiingoEndpoint;
  url: string;
  icon: any;
  category: "REST" | "WebSocket" | "Utility";
}

const API_STRUCTURE: APIConfig[] = [
  // 2. REST
  { category: "REST", label: "2.1 End-of-Day", endpoint: "daily", icon: BarChart2, url: "https://api.tiingo.com/tiingo/daily/<ticker>/prices" },
  { category: "REST", label: "2.1 Meta Data", endpoint: "daily_meta", icon: Search, url: "https://api.tiingo.com/tiingo/daily/<ticker>" },
  { category: "REST", label: "2.2 News", endpoint: "news", icon: Newspaper, url: "https://api.tiingo.com/tiingo/news" },
  { category: "REST", label: "2.3 Crypto", endpoint: "crypto", icon: Coins, url: "https://api.tiingo.com/tiingo/crypto/prices" },
  { category: "REST", label: "2.4 Forex", endpoint: "forex", icon: Zap, url: "https://api.tiingo.com/tiingo/fx/<ticker>/top" },
  { category: "REST", label: "2.5 IEX", endpoint: "iex", icon: Landmark, url: "https://api.tiingo.com/iex/<ticker>" },
  { category: "REST", label: "2.6 Fundamentals", endpoint: "fundamentals", icon: Activity, url: "https://api.tiingo.com/tiingo/fundamentals/<ticker>/daily" },
  { category: "REST", label: "2.8 Dividends", endpoint: "dividends", icon: ArrowUpRight, url: "https://api.tiingo.com/tiingo/corporate-actions/<ticker>/distributions" },
  { category: "REST", label: "2.9 Splits", endpoint: "splits", icon: ArrowUpRight, url: "https://api.tiingo.com/tiingo/corporate-actions/<ticker>/splits" },
  
  // 3. WebSockets
  { category: "WebSocket", label: "3.1 WS Crypto", endpoint: "ws_crypto", icon: Wifi, url: "wss://api.tiingo.com/crypto" },
  { category: "WebSocket", label: "3.2 WS Forex", endpoint: "ws_forex", icon: Wifi, url: "wss://api.tiingo.com/fx" },
  { category: "WebSocket", label: "3.3 WS IEX", endpoint: "ws_iex", icon: Wifi, url: "wss://api.tiingo.com/iex" },

  // 4. Utilities
  { category: "Utility", label: "4.1 Search", endpoint: "search", icon: Search, url: "https://api.tiingo.com/tiingo/utilities/search?query=<query>" },
];

export default function TiingoContainer() {
  const [activeEndpoint, setActiveEndpoint] = useState<TiingoEndpoint>("daily");
  const [searchSymbol, setSearchSymbol] = useState("AAPL");

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["tiingo-api-data", activeEndpoint, searchSymbol],
    queryFn: async () => {
      // 对 WS 请求返回对应的 Mock 说明或实时连接示例
      if (activeEndpoint.startsWith("ws_")) {
        return {
          message: "WebSocket connection simulated",
          instructions: "To connect, use a WS client with your API token in the initial message.",
          handshake_example: {
            "eventName": "subscribe",
            "authorization": "YOUR_API_TOKEN",
            "eventData": { "tickers": [searchSymbol] }
          }
        };
      }

      const { data } = await axios.get("/api/proxy/tiingo", {
        params: { endpoint: activeEndpoint, symbol: searchSymbol, mock: "true" }
      });
      if (data.error) throw new Error(data.details || data.error);
      return data.data;
    },
    retry: false,
  });

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#f8f9fc]">
      {/* Sidebar - API 交互文档结构 */}
      <aside className="w-80 bg-white border-r border-slate-200 overflow-y-auto flex flex-col shadow-sm">
        <div className="p-6 border-b border-slate-50">
          <div className="flex items-center gap-2 text-blue-600 font-black text-xl italic tracking-tighter">
            TIINGO <span className="text-slate-400 not-italic">API</span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Full Endpoints Spec</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {["REST", "WebSocket", "Utility"].map((cat) => (
            <div key={cat} className="space-y-2">
              <div className="px-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{cat} Endpoints</div>
              {API_STRUCTURE.filter(a => a.category === cat).map((item) => (
                <button 
                  key={item.endpoint}
                  onClick={() => setActiveEndpoint(item.endpoint)}
                  className={clsx(
                    "w-full text-left p-3 rounded-xl transition-all group relative overflow-hidden",
                    activeEndpoint === item.endpoint 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-100" 
                      : "hover:bg-slate-50 text-slate-600"
                  )}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <item.icon className={clsx("w-4 h-4", activeEndpoint === item.endpoint ? "text-white" : "text-blue-500")} />
                    <span className="text-sm font-black tracking-tight">{item.label}</span>
                  </div>
                  <div className={clsx(
                    "text-[9px] font-mono break-all opacity-60",
                    activeEndpoint === item.endpoint ? "text-blue-50" : "text-slate-400"
                  )}>
                    {item.url.replace('<ticker>', searchSymbol).replace('<query>', searchSymbol)}
                  </div>
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-end mb-8 border-b border-slate-100 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={clsx(
                "text-[10px] font-black px-2 py-0.5 rounded uppercase",
                activeEndpoint.startsWith("ws_") ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"
              )}>
                {activeEndpoint.startsWith("ws_") ? "Real-time Stream" : "REST Endpoint"}
              </span>
              <span className="text-slate-300 text-[10px] font-bold">●</span>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Mock Debugging</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">
              {activeEndpoint.replace('ws_', '').replace('_', ' ')} <span className={activeEndpoint.startsWith("ws_") ? "text-purple-600" : "text-blue-600"}>Interface</span>
            </h2>
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                value={searchSymbol}
                onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
                className="bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all w-48 shadow-sm"
                placeholder="Ticker / Query"
              />
            </div>
            <button 
              onClick={() => refetch()}
              className="bg-slate-900 text-white px-8 py-3 rounded-xl text-sm font-black uppercase tracking-wider hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
            >
              Fetch / Test
            </button>
          </div>
        </header>

        {/* Data Display Content */}
        <section className="min-h-[500px] relative">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-40 text-slate-300">
              <Loader2 className="w-12 h-12 animate-spin mb-4" />
              <span className="font-black uppercase tracking-[0.2em] text-xs">Simulating Response...</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-40 text-red-400">
              <AlertCircle className="w-12 h-12 mb-4" />
              <span className="font-bold">{error.message}</span>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-2 mb-4">
                <Link2 className={clsx("w-4 h-4", activeEndpoint.startsWith("ws_") ? "text-purple-500" : "text-blue-500")} />
                <span className="text-[10px] font-mono text-slate-400 font-bold tracking-tight bg-slate-50 px-2 py-1 rounded border border-slate-100 italic">
                  {activeEndpoint.startsWith("ws_") ? "WSS" : "GET"} {API_STRUCTURE.find(a => a.endpoint === activeEndpoint)?.url.replace('<ticker>', searchSymbol).replace('<query>', searchSymbol)}
                </span>
              </div>
              <pre className={clsx(
                "text-xs p-8 rounded-2xl overflow-auto max-h-[700px] border shadow-2xl leading-relaxed",
                activeEndpoint.startsWith("ws_") 
                  ? "bg-slate-900 text-purple-400 border-purple-900/30" 
                  : "bg-slate-900 text-emerald-400 border-slate-800"
              )}>
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
