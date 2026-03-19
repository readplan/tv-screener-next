"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

type ViewMode = "overview" | "timeline";

export default function SentimentContainer() {
  const [viewMode, setViewMode] = useState<ViewMode>("overview");

  const { data, isLoading } = useQuery({
    queryKey: ["market-sentiment"],
    queryFn: async () => {
      const { data } = await axios.get("/api/proxy/sentiment");
      return data;
    },
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
        同步中...
      </div>
    );
  }

  const { fearGreed } = data || {};
  const currentScore = fearGreed?.now || 16;

  return (
    <div className="container mx-auto py-12 px-4 max-w-6xl bg-white rounded-3xl mt-4 shadow-sm">
      <div className="flex justify-end mb-12">
        <div className="bg-slate-100 p-1 rounded-full flex gap-1 shadow-inner">
          <button onClick={() => setViewMode("overview")} className={clsx("px-6 py-1.5 rounded-full text-xs font-bold transition-all uppercase tracking-wider", viewMode === "overview" ? "bg-white shadow-md text-slate-800" : "text-slate-400")}>Overview</button>
          <button onClick={() => setViewMode("timeline")} className={clsx("px-6 py-1.5 rounded-full text-xs font-bold transition-all uppercase tracking-wider", viewMode === "timeline" ? "bg-white shadow-md text-slate-800" : "text-slate-400")}>Timeline</button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === "overview" ? (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-8 flex flex-col items-center">
              <div className="relative w-full max-w-[550px]">
                {/* 使用你提供的官方路径重新构建 */}
                <svg version="1.1" id="fear-and-greed-dial" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 338 173" style={{ enableBackground: "new 0 0 338 173" }} aria-labelledby="market-fng-gauge__title">
                  <title id="market-fng-gauge__title">Fear & Greed Index</title>
                  
                  {/* 背景扇区 */}
                  <g className="dial-areas">
                    <path id="neutral" className={clsx("transition-all duration-500", currentScore > 45 && currentScore <= 55 ? "fill-amber-100 stroke-amber-500" : "fill-slate-50 stroke-slate-100")} d="M201.9,4.3C191.2,2.1,180.1,1,168.8,1c-11.3,0-22.4,1.1-33.1,3.2l16.1,61.6c5.5-0.9,11.2-1.4,17-1.4c5.8,0,11.5,0.5,17,1.4L201.9,4.3z"></path>
                    <path id="greed" className={clsx("transition-all duration-500", currentScore > 55 && currentScore <= 75 ? "fill-green-100 stroke-green-500" : "fill-slate-50 stroke-slate-100")} d="M204.9,4.9l-16.1,61.5c21.1,4.1,40,14.4,54.6,29.1L289,51.3C266.4,28.4,237.4,12,204.9,4.9L204.9,4.9z"></path>
                    <path id="extreme-greed" className={clsx("transition-all duration-500", currentScore > 75 ? "fill-green-200 stroke-green-600" : "fill-slate-50 stroke-slate-100")} d="M291.1,53.4l-45.6,44.2c17.8,18.9,28.7,44.3,28.7,72.2h63.4C337.6,124.7,319.9,83.7,291.1,53.4L291.1,53.4z"></path>
                    <path id="fear" className={clsx("transition-all duration-500", currentScore > 25 && currentScore <= 45 ? "fill-red-50 stroke-red-400" : "fill-slate-50 stroke-slate-100")} d="M132.8,4.9c-32.6,7.1-61.6,23.5-84.2,46.4l45.6,44.2c14.6-14.7,33.5-25,54.7-29.1L132.8,4.9z"></path>
                    <path id="extreme-fear" className={clsx("transition-all duration-500", currentScore <= 25 ? "fill-red-200 stroke-red-700" : "fill-slate-50 stroke-slate-100")} d="M46.5,53.4l45.6,44.2c-17.8,18.9-28.7,44.3-28.7,72.2H0C0,124.7,17.7,83.7,46.5,53.4L46.5,53.4z"></path>
                  </g>

                  {/* 官方文本路径集成 */}
                  <g className="dial-texts fill-slate-400 font-bold uppercase" style={{ fontSize: '10px' }}>
                    <text x="45" y="130" transform="rotate(-65, 45, 130)" className={clsx(currentScore <= 25 && "fill-slate-900")}>Extreme Fear</text>
                    <text x="85" y="60" transform="rotate(-35, 85, 60)" className={clsx(currentScore > 25 && currentScore <= 45 && "fill-slate-900")}>Fear</text>
                    <text x="169" y="40" textAnchor="middle" className={clsx(currentScore > 45 && currentScore <= 55 && "fill-slate-900")}>Neutral</text>
                    <text x="255" y="60" transform="rotate(35, 255, 60)" className={clsx(currentScore > 55 && currentScore <= 75 && "fill-slate-900")}>Greed</text>
                    <text x="290" y="130" transform="rotate(65, 290, 130)" className={clsx(currentScore > 75 && "fill-slate-900")}>Extreme Greed</text>
                  </g>

                  {/* 刻度点 */}
                  <path className="fill-slate-300" d="M263,153.1c-0.5-0.3-1.1-0.1-1.4,0.4c-0.3,0.5-0.1,1.1,0.4,1.4s1.1,0.1,1.4-0.4C263.6,154,263.5,153.4,263,153.1 M259.5,138.6c-0.5-0.3-1.1-0.1-1.4,0.4c-0.3,0.5-0.1,1.1,0.4,1.4c0.5,0.3,1.1,0.1,1.4-0.4C260.2,139.5,260,138.9,259.5,138.6 M253.7,124.9c-0.5-0.3-1.1-0.1-1.4,0.4c-0.3,0.5-0.1,1.1,0.4,1.4c0.5,0.3,1.1,0.1,1.4-0.4C254.3,125.8,254.2,125.2,253.7,124.9 M246,112.2c-0.5-0.3-1.1-0.1-1.4,0.4c-0.3,0.5-0.1,1.1,0.4,1.4c0.5,0.3,1.1,0.1,1.4-0.4C246.6,113.1,246.5,112.5,246,112.2 M224.8,91.1c-0.5-0.3-1.1-0.1-1.4,0.4c-0.3,0.5-0.1,1.1,0.4,1.4c0.5,0.3,1.1,0.1,1.4-0.4C225.5,92,225.3,91.3,224.8,91.1 M212.3,83.5c-0.5-0.3-1.1-0.1-1.4,0.4c-0.3,0.5-0.1,1.1,0.4,1.4c0.5,0.3,1.1,0.1,1.4-0.4C213,84.4,212.8,83.8,212.3,83.5 M198.6,77.8c-0.5-0.3-1.1-0.1-1.4,0.4c-0.3,0.5-0.1,1.1,0.4,1.4c0.5,0.3,1.1,0.1,1.4-0.4C199.2,78.7,199.1,78.1,198.6,77.8 M184.1,74.5c-0.5-0.3-1.1-0.1-1.4,0.4c-0.3,0.5-0.1,1.1,0.4,1.4c0.5,0.3,1.1,0.1,1.4-0.4C184.7,75.4,184.6,74.8,184.1,74.5 M154.8,74.5c-0.5-0.3-1.1-0.1-1.4,0.4c-0.3,0.5-0.1,1.1,0.4,1.4c0.5,0.3,1.1,0.1,1.4-0.4C155.4,75.4,155.3,74.8,154.8,74.5 M140,77.8c-0.5-0.3-1.1-0.1-1.4,0.4c-0.3,0.5-0.1,1.1,0.4,1.4c0.5,0.3,1.1,0.1,1.4-0.4C140.7,78.7,140.5,78.1,140,77.8 M126.3,83.5c-0.5-0.3-1.1-0.1-1.4,0.4c-0.3,0.5-0.1,1.1,0.4,1.4c0.5,0.3,1.1,0.1,1.4-0.4C126.9,84.4,126.8,83.8,126.3,83.5 M113.8,91.5c-0.5-0.3-1.1-0.1-1.4,0.4c-0.3,0.5-0.1,1.1,0.4,1.4c0.5,0.3,1.1,0.1,1.4-0.4C114.4,92.4,114.3,91.8,113.8,91.5 M92.8,112.3c-0.5-0.3-1.1-0.1-1.4,0.4c-0.3,0.5-0.1,1.1,0.4,1.4c0.5,0.3,1.1,0.1,1.4-0.4C93.4,113.2,93.3,112.6,92.8,112.3 M84.7,124.9c-0.5-0.3-1.1-0.1-1.4,0.4c-0.3,0.5-0.1,1.1,0.4,1.4c0.5,0.3,1.1,0.1,1.4-0.4C85.4,125.7,85.2,125.1,84.7,124.9 M78.9,138.6c-0.6,0-1,0.4-1,1c0,0.6,0.4,1,1,1c0.6,0,1-0.4,1-1C79.9,139,79.4,138.6,78.9,138.6M76.2,154c0,0.6-0.4,1-1,1c-0.6,0-1-0.4-1-1c0-0.6,0.4-1,1-1C75.7,153,76.2,153.4,76.2,154"></path>
                  
                  {/* 数字 */}
                  <g className="scales fill-slate-400 font-bold" style={{ fontSize: '10px' }}>
                    <text x="70" y="165" textAnchor="middle">0</text>
                    <text x="105" y="105" textAnchor="middle">25</text>
                    <text x="169" y="78" textAnchor="middle">50</text>
                    <text x="235" y="105" textAnchor="middle">75</text>
                    <text x="260" y="165" textAnchor="middle">100</text>
                  </g>

                  {/* 动态指针 */}
                  <motion.g
                    initial={{ rotate: -90 }}
                    animate={{ rotate: (currentScore / 100) * 180 - 180 }}
                    transition={{ type: "spring", stiffness: 30, damping: 10 }}
                    style={{ originX: "169px", originY: "172px" }}
                  >
                    <path d="M169,172 L40,168 L40,176 Z" fill="#1e293b" />
                  </motion.g>

                  {/* 中心数值 */}
                  <circle cx="169" cy="172" r="35" fill="white" className="shadow-lg" />
                  <text x="169" y="185" textAnchor="middle" className="text-[36px] font-black fill-slate-900">{Math.round(currentScore)}</text>
                </svg>
              </div>
              <div className="mt-8 text-[11px] font-medium text-slate-400 self-start ml-4">
                Last updated {fearGreed?.timestamp || new Date().toLocaleString()}
              </div>
            </div>

            <div className="lg:col-span-4 space-y-10 pl-8 lg:border-l border-slate-100">
              <HistoryItem label="Previous close" rating={fearGreed?.rating || "Extreme Fear"} score={fearGreed?.previousClose || 18} />
              <HistoryItem label="1 week ago" rating="Extreme Fear" score={fearGreed?.oneWeekAgo || 22} />
              <HistoryItem label="1 month ago" rating="Fear" score={fearGreed?.oneMonthAgo || 39} />
              <HistoryItem label="1 year ago" rating="Extreme Fear" score={fearGreed?.oneYearAgo || 21} />
            </div>
          </motion.div>
        ) : (
          <div className="h-[450px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockTimeline()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} minTickGap={40} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip />
                <ReferenceLine y={75} stroke="#e2e8f0" strokeDasharray="3 3" label={{ position: 'left', value: 'Extreme Greed', fill: '#cbd5e1', fontSize: 10 }} />
                <ReferenceLine y={25} stroke="#e2e8f0" strokeDasharray="3 3" label={{ position: 'left', value: 'Extreme Fear', fill: '#cbd5e1', fontSize: 10 }} />
                <Line type="monotone" dataKey="value" stroke="#0369a1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HistoryItem({ label, rating, score }: { label: string, rating: string, score: any }) {
  const val = typeof score === 'object' ? score.score : score;
  const rate = typeof score === 'object' ? score.rating : rating;

  return (
    <div className="relative flex items-center justify-between group">
      <div className="z-10 bg-white pr-4">
        <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">{label}</div>
        <div className="text-sm font-black text-slate-800 uppercase tracking-tight">{rate}</div>
      </div>
      <div className="absolute left-0 right-0 top-1/2 border-b border-dotted border-slate-200 -z-0" />
      <div className={clsx(
        "z-10 w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm border-2 bg-white transition-transform group-hover:scale-110",
        val <= 25 ? "text-red-600 border-red-200" : 
        val <= 45 ? "text-orange-500 border-orange-200" :
        val <= 55 ? "text-yellow-600 border-yellow-200" :
        "text-green-600 border-green-200"
      )}>
        {Math.round(val)}
      </div>
    </div>
  );
}

function mockTimeline() {
  return Array.from({ length: 100 }, (_, i) => ({
    date: `2025-${(i % 12) + 1}-01`,
    value: 20 + Math.random() * 60,
  }));
}
