"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

type ViewMode = "overview" | "timeline";
type TimeRange = "3m" | "6m" | "YTD" | "1y" | "2y" | "3y" | "5y" | "10y" | "all";

const TIME_RANGES: { label: string; value: TimeRange }[] = [
  { label: "3M", value: "3m" },
  { label: "6M", value: "6m" },
  { label: "YTD", value: "YTD" },
  { label: "1Y", value: "1y" },
  { label: "2Y", value: "2y" },
  { label: "3Y", value: "3y" },
  { label: "5Y", value: "5y" },
  { label: "10Y", value: "10y" },
  { label: "ALL", value: "all" },
];

export default function SentimentContainer() {
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [timeRange, setTimeRange] = useState<TimeRange>("1y");

  const { data, isLoading } = useQuery({
    queryKey: ["market-sentiment"],
    queryFn: async () => {
      const { data } = await axios.get("/api/proxy/sentiment");
      return data;
    },
    refetchInterval: 60000,
  });

  const { data: historyData } = useQuery({
    queryKey: ["fear-greed-history"],
    queryFn: async () => {
      const { data } = await axios.get("/data/fear-greed-history.json");
      return data;
    },
    enabled: viewMode === "timeline",
  });

  const filteredTimeline = useMemo(() => {
    if (!historyData) return [];
    if (timeRange === "all") return historyData;

    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case "3m": startDate.setMonth(now.getMonth() - 3); break;
      case "6m": startDate.setMonth(now.getMonth() - 6); break;
      case "YTD": startDate = new Date(now.getFullYear(), 0, 1); break;
      case "1y": startDate.setFullYear(now.getFullYear() - 1); break;
      case "2y": startDate.setFullYear(now.getFullYear() - 2); break;
      case "3y": startDate.setFullYear(now.getFullYear() - 3); break;
      case "5y": startDate.setFullYear(now.getFullYear() - 5); break;
      case "10y": startDate.setFullYear(now.getFullYear() - 10); break;
    }

    return historyData.filter((item: any) => new Date(item.date) >= startDate);
  }, [historyData, timeRange]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
        正在获取市场情绪...
      </div>
    );
  }

  const { fearGreed } = data || {};
  const currentScore = fearGreed?.now || 16;
  const needleRotation = (currentScore / 100) * 180 - 90;

  return (
    <div className="container mx-auto py-12 px-4 bg-white rounded-3xl mt-4 border border-slate-50 shadow-sm">
      <div className="flex justify-between items-center mb-12">
        <div className="flex gap-2">
          {viewMode === "timeline" && (
            <div className="bg-slate-50 p-1 rounded-lg flex gap-1 border border-slate-100">
              {TIME_RANGES.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setTimeRange(range.value)}
                  className={clsx(
                    "px-3 py-1 rounded-md text-[10px] font-bold transition-all",
                    timeRange === range.value ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {range.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="bg-slate-100 p-1 rounded-full flex gap-1 shadow-inner">
          <button onClick={() => setViewMode("overview")} className={clsx("px-6 py-1.5 rounded-full text-xs font-bold transition-all uppercase tracking-wider", viewMode === "overview" ? "bg-white shadow-md text-slate-800" : "text-slate-400")}>Overview</button>
          <button onClick={() => setViewMode("timeline")} className={clsx("px-6 py-1.5 rounded-full text-xs font-bold transition-all uppercase tracking-wider", viewMode === "timeline" ? "bg-white shadow-md text-slate-800" : "text-slate-400")}>Timeline</button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === "overview" ? (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-8 flex flex-col items-center">
              <div className="relative w-full max-w-[480px] aspect-[338/173]">
                <div className="absolute inset-0">
                  <svg viewBox="0 0 338 173" className="w-full h-full overflow-visible">
                    <path id="neutral" className={clsx("transition-all duration-700", currentScore > 45 && currentScore <= 55 ? "fill-amber-100 stroke-amber-400" : "fill-[#f4f4f4] stroke-[#e5e5e5]")} d="M201.9,4.3C191.2,2.1,180.1,1,168.8,1c-11.3,0-22.4,1.1-33.1,3.2l16.1,61.6c5.5-0.9,11.2-1.4,17-1.4c5.8,0,11.5,0.5,17,1.4L201.9,4.3z" strokeWidth="1"></path>
                    <path id="greed" className={clsx("transition-all duration-700", currentScore > 55 && currentScore <= 75 ? "fill-green-100 stroke-green-400" : "fill-[#f4f4f4] stroke-[#e5e5e5]")} d="M204.9,4.9l-16.1,61.5c21.1,4.1,40,14.4,54.6,29.1L289,51.3C266.4,28.4,237.4,12,204.9,4.9L204.9,4.9z" strokeWidth="1"></path>
                    <path id="extreme-greed" className={clsx("transition-all duration-700", currentScore > 75 ? "fill-green-200 stroke-green-600" : "fill-[#f4f4f4] stroke-[#e5e5e5]")} d="M291.1,53.4l-45.6,44.2c17.8,18.9,28.7,44.3,28.7,72.2h63.4C337.6,124.7,319.9,83.7,291.1,53.4L291.1,53.4z" strokeWidth="1"></path>
                    <path id="fear" className={clsx("transition-all duration-700", currentScore > 25 && currentScore <= 45 ? "fill-red-50 stroke-red-400" : "fill-[#f4f4f4] stroke-[#e5e5e5]")} d="M132.8,4.9c-32.6,7.1-61.6,23.5-84.2,46.4l45.6,44.2c14.6-14.7,33.5-25,54.7-29.1L132.8,4.9z" strokeWidth="1"></path>
                    <path id="extreme-fear" className={clsx("transition-all duration-700", currentScore <= 25 ? "fill-red-200 stroke-red-700" : "fill-[#f4f4f4] stroke-[#e5e5e5]")} d="M46.5,53.4l45.6,44.2c-17.8,18.9-28.7,44.3-28.7,72.2H0C0,124.7,17.7,83.7,46.5,53.4L46.5,53.4z" strokeWidth="1"></path>
                    <path className="fill-slate-300" d="M263,153.1c-0.5-0.3-1.1-0.1-1.4,0.4c-0.3,0.5-0.1,1.1,0.4,1.4s1.1,0.1,1.4-0.4C263.6,154,263.5,153.4,263,153.1 M259.5,138.6c-0.5-0.3-1.1-0.1-1.4,0.4c-0.3,0.5-0.1,1.1,0.4,1.4c0.5,0.3,1.1,0.1,1.4-0.4C260.2,139.5,260,138.9,259.5,138.6 M253.7,124.9c-0.5-0.3-1.1-0.1-1.4,0.4c-0.3,0.5-0.1,1.1,0.4,1.4c0.5,0.3,1.1,0.1,1.4-0.4C254.3,125.8,254.2,125.2,253.7,124.9 M246,112.2c-0.5-0.3-1.1-0.1-1.4,0.4c-0.3,0.5-0.1,1.1,0.4,1.4c0.5,0.3,1.1,0.1,1.4-0.4C246.6,113.1,246.5,112.5,246,112.2 M224.8,91.1c-0.5-0.3-1.1-0.1-1.4,0.4c-0.3,0.5-0.1,1.1,0.4,1.4c0.5,0.3,1.1,0.1,1.4-0.4C225.5,92,225.3,91.3,224.8,91.1 M212.3,83.5c-0.5-0.3-1.1-0.1-1.4,0.4c-0.3,0.5-0.1,1.1,0.4,1.4c0.5,0.3,1.1,0.1,1.4-0.4C213,84.4,212.8,83.8,212.3,83.5 M198.6,77.8c-0.5-0.3-1.1-0.1-1.4,0.4c-0.3,0.5-0.1,1.1,0.4,1.4c0.5,0.3,1.1,0.1,1.4-0.4C199.2,78.7,199.1,78.1,198.6,77.8 M184.1,74.5c-0.5-0.3-1.1-0.1-1.4,0.4c-0.3,0.5-0.1,1.1,0.4,1.4c0.5,0.3,1.1,0.1,1.4-0.4C184.7,75.4,184.6,74.8,184.1,74.5 M154.8,74.5c-0.5-0.3-1.1-0.1-1.4,0.4c-0.3,0.5-0.1,1.1,0.4,1.4c0.5,0.3,1.1,0.1,1.4-0.4C155.4,75.4,155.3,74.8,154.8,74.5 M140,77.8c-0.5-0.3-1.1-0.1-1.4,0.4c-0.3,0.5-0.1,1.1,0.4,1.4c0.5,0.3,1.1,0.1,1.4-0.4C140.7,78.7,140.5,78.1,140,77.8 M126.3,83.5c-0.5-0.3-1.1-0.1-1.4,0.4c-0.3,0.5-0.1,1.1,0.4,1.4c0.5,0.3,1.1,0.1,1.4-0.4C126.9,84.4,126.8,83.8,126.3,83.5 M113.8,91.5c-0.5-0.3-1.1-0.1-1.4,0.4c-0.3,0.5-0.1,1.1,0.4,1.4c0.5,0.3,1.1,0.1,1.4-0.4C114.4,92.4,114.3,91.8,113.8,91.5 M92.8,112.3c-0.5-0.3-1.1-0.1-1.4,0.4c-0.3,0.5-0.1,1.1,0.4,1.4c0.5,0.3,1.1,0.1,1.4-0.4C93.4,113.2,93.3,112.6,92.8,112.3 M84.7,124.9c-0.5-0.3-1.1-0.1-1.4,0.4c-0.3,0.5-0.1,1.1,0.4,1.4c0.5,0.3,1.1,0.1,1.4-0.4C85.4,125.7,85.2,125.1,84.7,124.9 M78.9,138.6c-0.6,0-1,0.4-1,1c0,0.6,0.4,1,1,1c0.6,0,1-0.4,1-1C79.9,139,79.4,138.6,78.9,138.6M76.2,154c0,0.6-0.4,1-1,1c-0.6,0-1-0.4-1-1c0-0.6,0.4-1,1-1C75.7,153,76.2,153.4,76.2,154" />
                    <g className="fill-slate-400 font-black" style={{ fontSize: '9px' }}>
                      <text x="65" y="168" textAnchor="middle">0</text>
                      <text x="100" y="108" textAnchor="middle">25</text>
                      <text x="169" y="82" textAnchor="middle">50</text>
                      <text x="238" y="108" textAnchor="middle">75</text>
                      <text x="273" y="168" textAnchor="middle">100</text>
                    </g>
                    <g className="uppercase font-black tracking-tighter" style={{ fontSize: '11px' }}>
                      <text x="15" y="120" transform="rotate(-62, 15, 120)" className={clsx(currentScore <= 25 ? "fill-slate-900" : "fill-slate-400/40")}>Extreme Fear</text>
                      <text x="85" y="55" transform="rotate(-35, 85, 55)" className={clsx(currentScore > 25 && currentScore <= 45 ? "fill-slate-900" : "fill-slate-400/40")}>Fear</text>
                      <text x="169" y="35" textAnchor="middle" className={clsx(currentScore > 45 && currentScore <= 55 ? "fill-slate-900" : "fill-slate-400/40")}>Neutral</text>
                      <text x="220" y="65" transform="rotate(35, 220, 65)" className={clsx(currentScore > 55 && currentScore <= 75 ? "fill-slate-900" : "fill-slate-400/40")}>Greed</text>
                      <text x="250" y="125" transform="rotate(62, 250, 125)" className={clsx(currentScore > 75 ? "fill-slate-900" : "fill-slate-400/40")}>Extreme Greed</text>
                    </g>
                  </svg>
                </div>
                <motion.div 
                  className="market-fng-gauge__hand absolute inset-0 flex items-center justify-center z-10"
                  initial={{ rotate: -90 }}
                  animate={{ rotate: needleRotation }}
                  transition={{ type: "spring", stiffness: 35, damping: 12 }}
                  style={{ originX: "50%", originY: "99.5%" }}
                >
                  <svg className="w-[10px] h-[124px] -translate-y-[50%] overflow-visible" viewBox="0 0 10 124">
                    <path d="M5,0.2c-0.6,0-1.1,0.5-1.1,1.1L0.8,106.7c0,2.3-0.1,13.6,2.6,16.3c0.6,0.6,1.3,0.7,1.8,0.7l0,0c0.5,0,1.1-0.2,1.7-0.9c0.1-0.2,0.3-0.3,0.4-0.5c2.2-3.6,1.7-13.9,1.6-16L6.1,1.3C6.1,0.7,5.6,0.2,5,0.2" fill="#1e293b"></path>
                  </svg>
                </motion.div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[-10%] w-24 h-24 bg-white rounded-full shadow-[0_15px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-50 flex items-center justify-center z-20">
                  <span className="text-[36px] font-black text-slate-900 leading-none">{Math.round(currentScore)}</span>
                </div>
              </div>
              <div className="mt-20 text-[11px] font-bold text-slate-400 self-start ml-8 uppercase tracking-[0.2em]">
                Last updated {fearGreed?.timestamp || new Date().toLocaleString()}
              </div>
            </div>
            <div className="lg:col-span-4 space-y-10 pl-8 lg:border-l border-slate-100 flex flex-col justify-center">
              <HistoryItem label="Previous close" rating={fearGreed?.rating || "Extreme Fear"} score={fearGreed?.previousClose || 18} />
              <HistoryItem label="1 week ago" rating="Extreme Fear" score={fearGreed?.oneWeekAgo || 22} />
              <HistoryItem label="1 month ago" rating="Fear" score={fearGreed?.oneMonthAgo || 39} />
              <HistoryItem label="1 year ago" rating="Extreme Fear" score={fearGreed?.oneYearAgo || 21} />
            </div>
          </motion.div>
        ) : (
          <motion.div key="timeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[450px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredTimeline}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} minTickGap={40} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <ReferenceLine y={75} stroke="#e2e8f0" strokeDasharray="3 3" label={{ position: 'left', value: 'Extreme Greed', fill: '#cbd5e1', fontSize: 10 }} />
                <ReferenceLine y={25} stroke="#e2e8f0" strokeDasharray="3 3" label={{ position: 'left', value: 'Extreme Fear', fill: '#cbd5e1', fontSize: 10 }} />
                <Line type="monotone" dataKey="value" stroke="#0369a1" strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HistoryItem({ label, rating, score }: { label: string, rating: string, score: any }) {
  const val = typeof score === 'object' ? score.score : score;
  const rate = typeof score === 'object' ? score.rating : rating;

  return (
    <div className="relative flex items-center justify-between group py-1">
      <div className="z-10 bg-white pr-4">
        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">{label}</div>
        <div className="text-[14px] font-black text-slate-800 uppercase tracking-tighter">{rate}</div>
      </div>
      <div className="absolute left-0 right-0 top-1/2 border-b border-dotted border-slate-200 -z-0" />
      <div className={clsx(
        "z-10 w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm border-2 bg-white shadow-sm transition-transform group-hover:scale-110",
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
