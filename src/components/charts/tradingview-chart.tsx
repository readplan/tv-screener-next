"use client";

import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData } from 'lightweight-charts';
import React, { useEffect, useRef } from 'react';

interface TVChartProps {
  data: CandlestickData[];
  symbol: string;
}

export const TVChart = ({ data, symbol }: TVChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#64748b',
      },
      grid: {
        vertLines: { color: '#f1f5f9' },
        horzLines: { color: '#f1f5f9' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        borderColor: '#e2e8f0',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // 适配最新版 API，使用内置的 addCandlestickSeries 方法
    // 如果该方法在某些打包环境下不可用，尝试通用的 addSeries 逻辑
    try {
      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#22c55e',
        downColor: '#ef4444',
        borderVisible: false,
        wickUpColor: '#22c55e',
        wickDownColor: '#ef4444',
      });

      if (data && data.length > 0) {
        candlestickSeries.setData(data);
        chart.timeScale().fitContent();
      }
    } catch (e) {
      console.error("Failed to add candlestick series:", e);
    }

    chartRef.current = chart;
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data]);

  return (
    <div className="relative w-full">
      <div className="absolute top-4 left-4 z-10">
        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-slate-800 bg-white/90 backdrop-blur px-3 py-1 rounded-lg border border-slate-100 shadow-sm uppercase tracking-tighter">
            {symbol} • 1D
          </span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full rounded-xl overflow-hidden" />
    </div>
  );
};
