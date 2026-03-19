"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Loader2, Activity } from "lucide-react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend
} from 'recharts';

type ViewMode = "overview" | "timeline";
type TimeRange = "3m" | "6m" | "YTD" | "1y" | "3y" | "5y" | "all";
type ComparisonIndex = "spy" | "qqq" | "dia" | "iwm";

const TIME_RANGES: { label: string; value: TimeRange }[] = [
  { label: "3M", value: "3m" }, { label: "6M", value: "6m" }, { label: "YTD", value: "YTD" },
  { label: "1Y", value: "1y" }, { label: "3Y", value: "3y" }, { label: "5Y", value: "5y" },
  { label: "ALL", value: "all" },
];

const INDEX_CONFIG: Record<string, { label: string; color: string; ticker: string }> = {
  spy: { label: "S&P 500 (SPX)", color: "#ef4444", ticker: "spy" },
  qqq: { label: "Nasdaq 100 (NDQ)", color: "#3b82f6", ticker: "qqq" },
  dia: { label: "Dow 30 (DJI)", color: "#8b5cf6", ticker: "dia" },
  iwm: { label: "Russell 2000 (RUT)", color: "#f59e0b", ticker: "iwm" },
};

export default function SentimentContainer() {
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [timeRange, setTimeRange] = useState<TimeRange>("1y");
  const [selectedIndices, setSelectedIndices] = useState<ComparisonIndex[]>(["spy"]);

  const { data: realTimeData, isLoading: isRealTimeLoading } = useQuery({
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

  // 并行获取选中的所有指数数据
  const indexQueries = useMemo(() => {
    return ["spy", "qqq", "dia", "iwm"].map(idx => {
      return useQuery({
        queryKey: ["index-history", idx],
        queryFn: async () => {
          const { data } = await axios.get(`/data/${idx}-history.json`);
          return data;
        },
        enabled: viewMode === "timeline" && selectedIndices.includes(idx as any),
      });
    });
  }, [viewMode, selectedIndices]);

  const mergedData = useMemo(() => {
    if (!historyData) return [];
    
    let base = historyData;
    if (timeRange !== "all") {
      const now = new Date();
      const start = new Date();
      if (timeRange === "3m") start.setMonth(now.getMonth() - 3);
      else if (timeRange === "6m") start.setMonth(now.getMonth() - 6);
      else if (timeRange === "YTD") start.setFullYear(now.getFullYear(), 0, 1);
      else if (timeRange === "1y") start.setFullYear(now.getFullYear() - 1);
      else if (timeRange === "3y") start.setFullYear(now.getFullYear() - 3);
      else if (timeRange === "5y") start.setFullYear(now.getFullYear() - 5);
      base = historyData.filter((d: any) => new Date(d.date) >= start);
    }

    // 聚合选中的指数数据
    const indexKeys = ["spy", "qqq", "dia", "iwm"];
    return base.map((d: any) => {
      const entry: any = { ...d };
      selectedIndices.forEach(idx => {
        const indexIdx = indexKeys.indexOf(idx);
        const queryResult = indexQueries[indexIdx];
        if (queryResult?.data) {
          const match = queryResult.data.find((item: any) => item.date === d.date);
          if (match) entry[`price_${idx}`] = match.close;
        }
      });
      return entry;
    });
  }, [historyData, indexQueries, timeRange, selectedIndices]);

  const toggleIndex = (idx: ComparisonIndex) => {
    setSelectedIndices(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  if (isRealTimeLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-slate-300">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
        <span className="font-bold tracking-widest uppercase text-[10px]">Syncing Sentiment Engine</span>
      </div>
    );
  }

  const currentScore = realTimeData?.fearGreed?.now || 16;
  const needleRotation = (currentScore / 100) * 180 - 90;

  return (
    <div className="container mx-auto py-8 px-4 bg-white rounded-3xl mt-4 border border-slate-50 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
        <div className="flex flex-wrap gap-3">
          {viewMode === "timeline" && (
            <>
              <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200/50">
                {TIME_RANGES.map((r) => (
                  <button key={r.value} onClick={() => setTimeRange(r.value)} 
                    className={clsx("px-3 py-1.5 rounded-lg text-[10px] font-black transition-all uppercase", 
                    timeRange === r.value ? "bg-white shadow-sm text-blue-600" : "text-slate-400 hover:text-slate-600")}>
                    {r.label}
                  </button>
                ))}
              </div>
              <div className="bg-slate-50 p-1 rounded-xl flex gap-1 border border-slate-100">
                {Object.entries(INDEX_CONFIG).map(([key, config]) => (
                  <button key={key} onClick={() => toggleIndex(key as any)} 
                    className={clsx("px-3 py-1.5 rounded-lg text-[10px] font-black transition-all uppercase flex items-center gap-2", 
                    selectedIndices.includes(key as any) ? "bg-white shadow-sm" : "text-slate-400")}
                    style={{ color: selectedIndices.includes(key as any) ? config.color : undefined }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.color }} />
                    {config.label.split('(')[1].replace(')', '')}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="bg-slate-900 p-1 rounded-2xl flex gap-1 shadow-xl">
          <button onClick={() => setViewMode("overview")} className={clsx("px-8 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-widest", viewMode === "overview" ? "bg-white text-slate-900 shadow-lg" : "text-slate-500 hover:text-slate-300")}>Overview</button>
          <button onClick={() => setViewMode("timeline")} className={clsx("px-8 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-widest", viewMode === "timeline" ? "bg-white text-slate-900 shadow-lg" : "text-slate-500 hover:text-slate-300")}>Timeline</button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === "overview" ? (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-8 flex flex-col items-center">
              <div className="relative w-full max-w-[480px] aspect-[338/173] overflow-hidden">
                <div className="absolute inset-0">
                  <svg viewBox="0 0 338 173" className="w-full h-full overflow-visible">
                    <path d="M201.9,4.3C191.2,2.1,180.1,1,168.8,1c-11.3,0-22.4,1.1-33.1,3.2l16.1,61.6c5.5-0.9,11.2-1.4,17-1.4c5.8,0,11.5,0.5,17,1.4L201.9,4.3z" className={clsx("transition-all duration-700", currentScore > 45 && currentScore <= 55 ? "fill-amber-100 stroke-amber-400" : "fill-slate-50 stroke-slate-100")} strokeWidth="1"></path>
                    <path d="M204.9,4.9l-16.1,61.5c21.1,4.1,40,14.4,54.6,29.1L289,51.3C266.4,28.4,237.4,12,204.9,4.9L204.9,4.9z" className={clsx("transition-all duration-700", currentScore > 55 && currentScore <= 75 ? "fill-green-100 stroke-green-400" : "fill-slate-50 stroke-slate-100")} strokeWidth="1"></path>
                    <path d="M291.1,53.4l-45.6,44.2c17.8,18.9,28.7,44.3,28.7,72.2h63.4C337.6,124.7,319.9,83.7,291.1,53.4L291.1,53.4z" className={clsx("transition-all duration-700", currentScore > 75 ? "fill-green-200 stroke-green-600" : "fill-slate-50 stroke-slate-100")} strokeWidth="1"></path>
                    <path d="M132.8,4.9c-32.6,7.1-61.6,23.5-84.2,46.4l45.6,44.2c14.6-14.7,33.5-25,54.7-29.1L132.8,4.9z" className={clsx("transition-all duration-700", currentScore > 25 && currentScore <= 45 ? "fill-red-50 stroke-red-400" : "fill-slate-50 stroke-slate-100")} strokeWidth="1"></path>
                    <path d="M46.5,53.4l45.6,44.2c-17.8,18.9-28.7,44.3-28.7,72.2H0C0,124.7,17.7,83.7,46.5,53.4L46.5,53.4z" className={clsx("transition-all duration-700", currentScore <= 25 ? "fill-red-200 stroke-red-700" : "fill-slate-50 stroke-slate-100")} strokeWidth="1"></path>
                    <g className="fill-slate-400 font-black uppercase tracking-tighter" style={{ fontSize: '11px' }}>
                      <text x="15" y="120" transform="rotate(-62, 45, 125)" className={clsx(currentScore <= 25 ? "fill-slate-900 scale-110" : "opacity-30")}>Extreme Fear</text>
                      <text x="85" y="55" transform="rotate(-35, 85, 55)" className={clsx(currentScore > 25 && currentScore <= 45 ? "fill-slate-900 scale-110" : "opacity-30")}>Fear</text>
                      <text x="169" y="35" textAnchor="middle" className={clsx(currentScore > 45 && currentScore <= 55 ? "fill-slate-900 scale-110" : "opacity-30")}>Neutral</text>
                      <text x="220" y="65" transform="rotate(35, 255, 55)" className={clsx(currentScore > 55 && currentScore <= 75 ? "fill-slate-900 scale-110" : "opacity-30")}>Greed</text>
                      <text x="250" y="125" transform="rotate(62, 295, 125)" className={clsx(currentScore > 75 ? "fill-slate-900 scale-110" : "opacity-30")}>Extreme Greed</text>
                    </g>
                  </svg>
                </div>
                <motion.div className="market-fng-gauge__hand absolute inset-0 flex items-center justify-center z-10" initial={{ rotate: -90 }} animate={{ rotate: needleRotation }} transition={{ type: "spring", stiffness: 35, damping: 12 }} style={{ originX: "50%", originY: "99.5%" }}>
                  <svg className="w-[10px] h-[124px] overflow-visible" viewBox="0 0 10 124"><path d="M5,0.2c-0.6,0-1.1,0.5-1.1,1.1L0.8,106.7c0,2.3-0.1,13.6,2.6,16.3c0.6,0.6,1.3,0.7,1.8,0.7l0,0c0.5,0,1.1-0.2,1.7-0.9c0.1-0.2,0.3-0.3,0.4-0.5c2.2-3.6,1.7-13.9,1.6-16L6.1,1.3C6.1,0.7,5.6,0.2,5,0.2" fill="#1e293b"></path></svg>
                </motion.div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[25%] w-24 h-24 bg-white rounded-full shadow-[0_15px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-50 flex items-center justify-center z-20">
                  <span className="text-[36px] font-black text-slate-900 leading-none">{Math.round(currentScore)}</span>
                </div>
              </div>
              <div className="mt-20 text-[11px] font-bold text-slate-400 self-start ml-8 uppercase tracking-[0.2em]">Last updated {realTimeData?.fearGreed?.timestamp || new Date().toLocaleString()}</div>
            </div>
            <div className="lg:col-span-4 space-y-10 pl-8 lg:border-l border-slate-100 flex flex-col justify-center">
              <HistoryItem label="Previous close" score={realTimeData?.fearGreed?.previousClose || 18} />
              <HistoryItem label="1 week ago" score={realTimeData?.fearGreed?.oneWeekAgo || 22} />
              <HistoryItem label="1 month ago" score={realTimeData?.fearGreed?.oneMonthAgo || 39} />
              <HistoryItem label="1 year ago" score={realTimeData?.fearGreed?.oneYearAgo || 21} />
            </div>
          </motion.div>
        ) : (
          <motion.div key="timeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[500px] w-full bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mergedData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} minTickGap={50} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#1e293b', fontWeight: 'bold' }} />
                <YAxis yAxisId="left" orientation="left" domain={['auto', 'auto']} axisLine={false} tickLine={false} hide={selectedIndices.length === 0} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                <Legend iconType="circle" />
                <ReferenceLine yAxisId="right" y={75} stroke="#cbd5e1" strokeDasharray="3 3" label={{ position: 'right', value: 'Greed', fill: '#94a3b8', fontSize: 9 }} />
                <ReferenceLine yAxisId="right" y={25} stroke="#cbd5e1" strokeDasharray="3 3" label={{ position: 'right', value: 'Fear', fill: '#94a3b8', fontSize: 9 }} />
                <Line yAxisId="right" type="monotone" dataKey="value" stroke="#1e293b" strokeWidth={3} dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    if (payload.value <= 20) return <circle cx={cx} cy={cy} r={3} fill="#ef4444" stroke="none" key={`dot-${payload.date}`} />;
                    if (payload.value >= 70) return <circle cx={cx} cy={cy} r={3} fill="#22c55e" stroke="none" key={`dot-${payload.date}`} />;
                    return null;
                  }} activeDot={{ r: 6 }} name="Fear & Greed Index" />
                
                {selectedIndices.map(idx => (
                  <Line key={idx} yAxisId="left" type="monotone" dataKey={`price_${idx}`} stroke={INDEX_CONFIG[idx].color} strokeWidth={2} dot={false} name={INDEX_CONFIG[idx].label} strokeDasharray="5 5" connectNulls />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HistoryItem({ label, score }: { label: string, score: any }) {
  const val = typeof score === 'object' ? score.score : score;
  const rating = typeof score === 'object' ? score.rating : "Neutral";

  return (
    <div className="relative flex items-center justify-between group py-1">
      <div className="z-10 bg-white pr-4">
        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">{label}</div>
        <div className="text-[14px] font-black text-slate-800 uppercase tracking-tighter">{rating}</div>
      </div>
      <div className="absolute left-0 right-0 top-1/2 border-b border-dotted border-slate-200 -z-0" />
      <div className={clsx("z-10 w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm border-2 bg-white shadow-sm transition-transform group-hover:scale-110",
        val <= 25 ? "text-red-600 border-red-200" : val <= 45 ? "text-orange-500 border-orange-200" : val <= 55 ? "text-yellow-600 border-yellow-200" : "text-green-600 border-green-200")}>
        {Math.round(val)}
      </div>
    </div>
  );
}
