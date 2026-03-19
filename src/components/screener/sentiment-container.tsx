"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Loader2, AlertCircle, TrendingDown, Info } from "lucide-react";
import { clsx } from "clsx";

export default function SentimentContainer() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["market-sentiment"],
    queryFn: async () => {
      const { data } = await axios.get("/api/proxy/sentiment");
      return data;
    },
    refetchInterval: 60000, // 每分钟刷新
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
        正在加载市场情绪数据...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto p-8 text-center text-red-500">
        <AlertCircle className="w-12 h-12 mx-auto mb-4" />
        <p>无法加载情绪数据: {error.message}</p>
      </div>
    );
  }

  const { vix, fearGreed } = data;

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* CNN Fear & Greed Section */}
        <section className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">恐惧与贪婪指数</h2>
              <p className="text-slate-400 text-sm mt-1">CNN Business 情绪指标</p>
            </div>
            {fearGreed && (
              <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Live
              </div>
            )}
          </div>

          {!fearGreed ? (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 text-amber-700 flex gap-4">
              <Info className="shrink-0" />
              <div>
                <p className="font-bold">无法访问 CNN 数据</p>
                <p className="text-sm opacity-80 mt-1">
                  由于 CNN 的反爬虫限制，暂时无法获取实时指数。您可以查看 VIX 指标作为参考。
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="relative pt-10 pb-4">
                {/* Visual Gauge */}
                <div className="h-4 w-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="absolute top-0 h-10 w-1 bg-slate-800 shadow-[0_0_10px_rgba(0,0,0,0.3)] transition-all duration-1000 ease-out"
                    style={{ left: `${fearGreed.now}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-2 py-1 rounded text-xs font-bold">
                      {Math.round(fearGreed.now)}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>极度恐惧</span>
                  <span>中性</span>
                  <span>极度贪婪</span>
                </div>
              </div>

              <div className="text-center py-4">
                <div className={clsx(
                  "text-5xl font-black mb-2",
                  getFnGColor(fearGreed.rating)
                )}>
                  {fearGreed.rating?.toUpperCase()}
                </div>
                <p className="text-slate-400 text-sm">当前市场处于 {translateRating(fearGreed.rating)} 状态</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <SentimentCard label="上周" value={fearGreed.oneWeekAgo} />
                <SentimentCard label="上月" value={fearGreed.oneMonthAgo} />
              </div>
            </div>
          )}
        </section>

        {/* VIX Section */}
        <section className="bg-slate-900 rounded-2xl shadow-xl text-white p-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <TrendingDown className="w-32 h-32" />
          </div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-bold">VIX 波动率指数</h2>
                <p className="text-slate-400 text-sm mt-1">CBOE 恐慌指数</p>
              </div>
              <div className="bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Index
              </div>
            </div>

            <div className="py-10">
              <div className="flex items-baseline gap-4 mb-4">
                <span className="text-6xl font-black tracking-tighter">
                  {vix.price.toFixed(2)}
                </span>
                <span className={clsx(
                  "text-lg font-bold px-2 py-0.5 rounded",
                  vix.change >= 0 ? "text-red-400 bg-red-400/10" : "text-green-400 bg-green-400/10"
                )}>
                  {vix.change >= 0 ? "+" : ""}{vix.change.toFixed(2)}%
                </span>
              </div>
              <p className="text-slate-400 font-medium">
                当前状态: <span className="text-white">{vix.status}</span>
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">什么是 VIX?</h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  VIX 被称为“恐慌指数”，衡量标普 500 指数期权的隐含波动率。通常 VIX 高于 30 表示市场处于高度恐慌状态。
                </p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

function SentimentCard({ label, value }: { label: string, value: any }) {
  if (!value) return null;
  return (
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">{label}</div>
      <div className="flex justify-between items-baseline">
        <span className="text-lg font-bold text-slate-700">{Math.round(value.score)}</span>
        <span className={clsx("text-xs font-medium", getFnGColor(value.rating))}>
          {translateRating(value.rating)}
        </span>
      </div>
    </div>
  );
}

function getFnGColor(rating: string) {
  if (!rating) return "text-slate-400";
  const r = rating.toLowerCase();
  if (r.includes("extreme fear")) return "text-red-600";
  if (r.includes("fear")) return "text-orange-500";
  if (r.includes("neutral")) return "text-yellow-500";
  if (r.includes("extreme greed")) return "text-green-600";
  if (r.includes("greed")) return "text-green-500";
  return "text-slate-500";
}

function translateRating(rating: string) {
  if (!rating) return "-";
  const r = rating.toLowerCase();
  if (r === "extreme fear") return "极度恐惧";
  if (r === "fear") return "恐惧";
  if (r === "neutral") return "中性";
  if (r === "greed") return "贪婪";
  if (r === "extreme greed") return "极度贪婪";
  return rating;
}
