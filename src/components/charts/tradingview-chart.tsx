"use client";

import { createChart, ColorType, IChartApi, CandlestickSeries } from 'lightweight-charts';
import React, { useEffect, useRef } from 'react';

interface TVChartProps {
  data: any[];
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

    // 1. 创建图表实例
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#64748b',
      },
      grid: {
        vertLines: { color: '#f8fafc' },
        horzLines: { color: '#f8fafc' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 450,
      timeScale: {
        borderColor: '#f1f5f9',
        timeVisible: true,
      },
    });

    // 2. 使用 v5 系列规范：addSeries(CandlestickSeries, ...)
    // 这种写法最稳定，兼容所有 v5.x 版本
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    // 3. 填充数据
    if (data && data.length > 0) {
      try {
        candlestickSeries.setData(data);
        chart.timeScale().fitContent();
      } catch (err) {
        console.error("Data binding error:", err);
      }
    }

    chartRef.current = chart;
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data]);

  return (
    <div className="relative w-full bg-slate-50/30 rounded-2xl p-4 border border-slate-100">
      <div className="absolute top-8 left-8 z-10 flex items-center gap-3">
        <div className="flex flex-col">
          <span className="text-xl font-black text-slate-900 tracking-tighter uppercase">
            {symbol}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Daily Candlesticks • Tiingo Data
          </span>
        </div>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
      </div>
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
};
