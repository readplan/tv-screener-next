"use client";

import { useState } from "react";
import ScreenerContainer from "@/components/screener/screener-container";
import FinvizContainer from "@/components/screener/finviz-container";
import SentimentContainer from "@/components/screener/sentiment-container";
import { BarChart3, PieChart, Activity } from "lucide-react";
import { clsx } from "clsx";

type DataSource = "tradingview" | "finviz" | "sentiment";

export default function Home() {
  const [source, setSource] = useState<DataSource>("tradingview");

  return (
    <main className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <BarChart3 className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight">MarketScreener</span>
            </div>
            
            <div className="hidden md:flex items-center bg-muted p-1 rounded-lg">
              <button
                onClick={() => setSource("tradingview")}
                className={clsx(
                  "px-4 py-1.5 rounded-md text-sm font-semibold transition-all",
                  source === "tradingview" ? "bg-white shadow-sm text-blue-600" : "text-muted-foreground hover:text-foreground"
                )}
              >
                TradingView
              </button>
              <button
                onClick={() => setSource("finviz")}
                className={clsx(
                  "px-4 py-1.5 rounded-md text-sm font-semibold transition-all",
                  source === "finviz" ? "bg-white shadow-sm text-blue-600" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Finviz (Scraper)
              </button>
              <button
                onClick={() => setSource("sentiment")}
                className={clsx(
                  "px-4 py-1.5 rounded-md text-sm font-semibold transition-all flex items-center gap-2",
                  source === "sentiment" ? "bg-white shadow-sm text-blue-600" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Activity className="w-4 h-4" />
                VIX / Fear-Greed
              </button>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border">
            Market Status: <span className="text-green-600 font-bold">Open</span>
          </div>
        </div>
      </nav>

      <div className="py-2">
        {source === "tradingview" && <ScreenerContainer />}
        {source === "finviz" && <FinvizContainer />}
        {source === "sentiment" && <SentimentContainer />}
      </div>
    </main>
  );
}
