"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { 
  BarChart2, Newspaper, Coins, Landmark, Zap, Search,
  ChevronRight, ArrowUpRight, Activity, Loader2, AlertCircle, Link2, Wifi, Power, PowerOff, Terminal, ShieldAlert
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
  { category: "REST", label: "2.1 End-of-Day", endpoint: "daily", icon: BarChart2, url: "https://api.tiingo.com/tiingo/daily/<ticker>/prices" },
  { category: "REST", label: "2.1 Meta Data", endpoint: "daily_meta", icon: Search, url: "https://api.tiingo.com/tiingo/daily/<ticker>" },
  { category: "REST", label: "2.2 News", endpoint: "news", icon: Newspaper, url: "https://api.tiingo.com/tiingo/news" },
  { category: "REST", label: "2.3 Crypto", endpoint: "crypto", icon: Coins, url: "https://api.tiingo.com/tiingo/crypto/prices" },
  { category: "REST", label: "2.4 Forex", endpoint: "forex", icon: Zap, url: "https://api.tiingo.com/tiingo/fx/<ticker>/top" },
  { category: "REST", label: "2.5 IEX", endpoint: "iex", icon: Landmark, url: "https://api.tiingo.com/iex/<ticker>" },
  { category: "REST", label: "2.6 Fundamentals", endpoint: "fundamentals", icon: Activity, url: "https://api.tiingo.com/tiingo/fundamentals/<ticker>/daily" },
  { category: "REST", label: "2.8 Dividends", endpoint: "dividends", icon: ArrowUpRight, url: "https://api.tiingo.com/tiingo/corporate-actions/<ticker>/distributions" },
  { category: "REST", label: "2.9 Splits", endpoint: "splits", icon: ArrowUpRight, url: "https://api.tiingo.com/tiingo/corporate-actions/<ticker>/splits" },
  { category: "WebSocket", label: "3.1 WS Crypto", endpoint: "ws_crypto", icon: Wifi, url: "wss://api.tiingo.com/crypto" },
  { category: "WebSocket", label: "3.2 WS Forex", endpoint: "ws_forex", icon: Wifi, url: "wss://api.tiingo.com/fx" },
  { category: "WebSocket", label: "3.3 WS IEX", endpoint: "ws_iex", icon: Wifi, url: "wss://api.tiingo.com/iex" },
  { category: "Utility", label: "4.1 Search", endpoint: "search", icon: Search, url: "https://api.tiingo.com/tiingo/utilities/search?query=<query>" },
];

export default function TiingoContainer() {
  const [activeEndpoint, setActiveEndpoint] = useState<TiingoEndpoint>("daily");
  const [searchSymbol, setSearchSymbol] = useState("AAPL");
  
  // WebSocket 状态
  const [wsStatus, setWsStatus] = useState<"disconnected" | "connecting" | "connected" | "mocking">("disconnected");
  const [wsMessages, setWsMessages] = useState<any[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const mockIntervalRef = useRef<any>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // REST Query
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["tiingo-api-data", activeEndpoint, searchSymbol],
    queryFn: async () => {
      if (activeEndpoint.startsWith("ws_")) return null;
      const { data } = await axios.get("/api/proxy/tiingo", {
        params: { endpoint: activeEndpoint, symbol: searchSymbol, mock: "true" }
      });
      return data.data;
    },
    enabled: !activeEndpoint.startsWith("ws_"),
  });

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [wsMessages]);

  const startMockStreaming = () => {
    if (mockIntervalRef.current) clearInterval(mockIntervalRef.current);
    setWsStatus("mocking");
    setWsMessages([{ type: "system", msg: "Simulating high-fidelity stream (Local Mock Mode)..." }]);
    
    let lastPrice = searchSymbol === "BTCUSD" ? 68000 : 150;
    
    mockIntervalRef.current = setInterval(() => {
      const change = (Math.random() - 0.5) * 2;
      lastPrice += change;
      const mockMsg = {
        service: activeEndpoint.replace('ws_', ''),
        symbol: searchSymbol,
        price: parseFloat(lastPrice.toFixed(2)),
        size: Math.floor(Math.random() * 100),
        timestamp: new Date().toISOString()
      };
      setWsMessages(prev => [...prev.slice(-49), { type: "data", msg: mockMsg }]);
    }, 1000);
  };

  const handleConnect = () => {
    if (wsRef.current) wsRef.current.close();
    if (mockIntervalRef.current) clearInterval(mockIntervalRef.current);
    
    const config = API_STRUCTURE.find(a => a.endpoint === activeEndpoint);
    if (!config) return;

    setWsStatus("connecting");
    setWsMessages([{ type: "system", msg: `Connecting to ${config.url}...` }]);

    try {
      const ws = new WebSocket(config.url);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsStatus("connected");
        const sub = {
          'eventName': 'subscribe',
          'authorization': 'e59abb611d5498c2d2859c505590c95dc648024f',
          'eventData': { 'thresholdLevel': 6, 'tickers': [searchSymbol.toLowerCase()] }
        };
        ws.send(JSON.stringify(sub));
      };

      ws.onmessage = (e) => {
        setWsMessages(prev => [...prev.slice(-49), { type: "data", msg: JSON.parse(e.data) }]);
      };

      ws.onerror = () => {
        setWsMessages(prev => [...prev, { type: "error", msg: "Connection Refused (403 Forbidden). Handshake failed." }]);
        setWsStatus("disconnected");
      };

      ws.onclose = () => {
        setWsStatus("disconnected");
      };
    } catch (e) {
      setWsStatus("disconnected");
    }
  };

  const handleDisconnect = () => {
    wsRef.current?.close();
    if (mockIntervalRef.current) clearInterval(mockIntervalRef.current);
    setWsStatus("disconnected");
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#f8f9fc]">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-slate-200 overflow-y-auto flex flex-col">
        <div className="p-6 border-b border-slate-50">
          <div className="flex items-center gap-2 text-blue-600 font-black text-xl italic tracking-tighter">
            TIINGO <span className="text-slate-400 not-italic">API</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-6">
          {["REST", "WebSocket", "Utility"].map((cat) => (
            <div key={cat} className="space-y-2">
              <div className="px-3 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{cat} Endpoints</div>
              {API_STRUCTURE.filter(a => a.category === cat).map((item) => (
                <button key={item.endpoint} onClick={() => { setActiveEndpoint(item.endpoint); setWsMessages([]); }}
                  className={clsx("w-full text-left p-3 rounded-xl transition-all", activeEndpoint === item.endpoint ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "hover:bg-slate-50 text-slate-600")}>
                  <div className="flex items-center gap-3 mb-1"><item.icon className="w-4 h-4" /> <span className="text-sm font-black tracking-tight">{item.label}</span></div>
                  <div className="text-[9px] font-mono break-all opacity-60">{item.url.replace('<ticker>', searchSymbol)}</div>
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-end mb-8 border-b pb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">{activeEndpoint.replace('ws_', '')}</h2>
          </div>
          <div className="flex gap-2">
            {!activeEndpoint.startsWith("ws_") ? (
              <button onClick={() => refetch()} className="bg-slate-900 text-white px-8 py-3 rounded-xl text-sm font-black uppercase tracking-wider">Execute REST</button>
            ) : (
              <div className="flex gap-2">
                {wsStatus === "disconnected" ? (
                  <>
                    <button onClick={handleConnect} className="bg-purple-600 text-white px-6 py-3 rounded-xl text-sm font-black uppercase flex items-center gap-2 shadow-lg shadow-purple-100"><Power className="w-4 h-4" /> Live Connect</button>
                    <button onClick={startMockStreaming} className="bg-slate-100 text-slate-600 px-6 py-3 rounded-xl text-sm font-black uppercase flex items-center gap-2 hover:bg-slate-200 transition-all"><Zap className="w-4 h-4" /> Run Mock Stream</button>
                  </>
                ) : (
                  <button onClick={handleDisconnect} className="bg-red-500 text-white px-8 py-3 rounded-xl text-sm font-black uppercase flex items-center gap-2"><PowerOff className="w-4 h-4" /> Terminate</button>
                )}
              </div>
            )}
          </div>
        </header>

        <section className="h-full">
          {activeEndpoint.startsWith("ws_") ? (
            <div className="flex flex-col h-[650px]">
              {wsStatus === "disconnected" && wsMessages.some(m => m.type === "error") && (
                <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 text-red-600 animate-in fade-in zoom-in-95">
                  <ShieldAlert className="w-6 h-6 flex-shrink-0" />
                  <div className="text-xs font-bold leading-relaxed">
                    Account Restriction Detected: Tiingo returned 403. Free accounts may have limited WebSocket access or exceeded quotas.
                    <br />Try "Run Mock Stream" to test UI logic without API limits.
                  </div>
                </div>
              )}
              <div ref={logContainerRef} className="bg-[#0f172a] rounded-3xl p-8 flex-1 overflow-y-auto border border-slate-800 shadow-2xl font-mono text-[11px] leading-relaxed relative">
                <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full text-[9px] font-black uppercase text-slate-400">
                  <div className={clsx("w-1.5 h-1.5 rounded-full", wsStatus === "mocking" ? "bg-blue-500 animate-pulse" : wsStatus === "connected" ? "bg-green-500" : "bg-red-500")} />
                  {wsStatus}
                </div>
                {wsMessages.map((m, i) => (
                  <div key={i} className={clsx("mb-2", m.type === "system" ? "text-blue-400" : m.type === "error" ? "text-red-400" : "text-emerald-400")}>
                    <span className="opacity-30 mr-2">[{new Date().toLocaleTimeString()}]</span>
                    {typeof m.msg === 'object' ? JSON.stringify(m.msg, null, 2) : m.msg}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <pre className="text-xs bg-slate-900 text-emerald-400 p-8 rounded-3xl overflow-auto border border-slate-800 shadow-2xl">{JSON.stringify(data, null, 2)}</pre>
          )}
        </section>
      </main>
    </div>
  );
}
