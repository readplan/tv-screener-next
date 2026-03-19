import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { FINVIZ_VIEWS } from "@/lib/finviz-constants";

export interface FinvizScreenerOptions {
  mode?: "screener" | "insider" | "quote";
  ticker?: string;
  filters?: string;
  view?: string;
  sort?: string;
}

export function useFinviz(options: FinvizScreenerOptions = {}) {
  const {
    mode = "screener",
    ticker = "",
    filters = "",
    view = FINVIZ_VIEWS.OVERVIEW,
    sort = "",
  } = options;

  return useQuery({
    queryKey: ["finviz", mode, ticker, filters, view, sort],
    queryFn: async () => {
      const { data } = await axios.get("/api/proxy/finviz", {
        params: { mode, ticker, f: filters, v: view, o: sort },
      });
      return data.data;
    },
    refetchInterval: mode === "quote" ? 60000 : 300000, // Quote 每分钟刷新，其他 5 分钟
  });
}
