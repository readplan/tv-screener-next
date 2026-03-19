"use client";

import { useState } from "react";
import ScreenerContainer from "@/components/screener/screener-container";
import FinvizContainer from "@/components/screener/finviz-container";
import SentimentContainer from "@/components/screener/sentiment-container";
import TiingoContainer from "@/components/tiingo/tiingo-container";
import { BarChart3, Activity, Database } from "lucide-react";
import { clsx } from "clsx";

type DataSource = "tradingview" | "finviz" | "sentiment" | "tiingo";

export default function Home() {
  const [source, setSource] = useState<DataSource>("tradingview");

  return (
    <main className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center shadow-lg shadow-blue-100">
                <BarChart3 className="text-white w-5 h-5" />
              </div>
              <span className="font-black text-xl tracking-tighter text-slate-900 italic">Terminal X</span>
            </div>
            
            <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/50">
              <NavTab active={source === "tradingview"} onClick={() => setSource("tradingview")} label="TradingView" />
              <NavTab active={source === "finviz"} onClick={() => setSource("finviz")} label="Finviz" />
              <NavTab active={source === "sentiment"} onClick={() => setSource("sentiment")} label="恐慌贪婪指数" icon={<Activity className="w-3.5 h-3.5" />} />
              <NavTab active={source === "tiingo"} onClick={() => setSource("tiingo")} label="Tiingo Data" icon={<Database className="w-3.5 h-3.5" />} />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Market Status</span>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-black text-slate-700 uppercase">Live Open</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-0">
        {source === "tradingview" && <ScreenerContainer />}
        {source === "finviz" && <FinvizContainer />}
        {source === "sentiment" && <SentimentContainer />}
        {source === "tiingo" && <TiingoContainer />}
      </div>
    </main>
  );
}

function NavTab({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon?: any }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 uppercase tracking-wide",
        active 
          ? "bg-white shadow-sm text-blue-600" 
          : "text-slate-500 hover:text-slate-800"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
