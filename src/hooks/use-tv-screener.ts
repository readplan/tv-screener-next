import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { DEFAULT_COLUMNS } from "@/lib/tv-constants";

export interface ScreenerData {
  s: string; // Ticker
  d: any[]; // Raw data
}

export interface ScreenerResponse {
  totalCount: number;
  data: ScreenerData[];
}

export interface UseScreenerOptions {
  market?: string;
  filter?: any[];
  sort?: { sortBy: string; sortOrder: string };
  range?: [number, number];
  columns?: string[];
  enabled?: boolean;
}

export function useTVScreener(options: UseScreenerOptions = {}) {
  const {
    market = "global",
    filter = [],
    sort = { sortBy: "market_cap_basic", sortOrder: "desc" },
    range = [0, 50],
    columns = DEFAULT_COLUMNS,
    enabled = true,
  } = options;

  return useQuery({
    queryKey: ["tv-screener", market, filter, sort, range, columns],
    queryFn: async () => {
      const { data } = await axios.post<ScreenerResponse>("/api/proxy/tradingview", {
        market,
        filter,
        sort,
        range,
        columns,
      });

      // 将原始数组映射为对象数组
      return {
        totalCount: data.totalCount,
        data: data.data.map((item) => {
          const mapped: any = { ticker: item.s };
          columns.forEach((col, index) => {
            mapped[col] = item.d[index];
          });
          return mapped;
        }),
      };
    },
    enabled,
    refetchInterval: 10000, // 每10秒自动刷新
  });
}
