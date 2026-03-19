import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { FINVIZ_VIEWS } from "@/lib/finviz-constants";

export interface FinvizScreenerOptions {
  mode?: "screener" | "insider" | "quote";
  ticker?: string;
  filters?: string;
  view?: string;
  sort?: string;
  enabled?: boolean;
}

export function useFinviz(options: FinvizScreenerOptions = {}) {
  const {
    mode = "screener",
    ticker = "",
    filters = "",
    view = FINVIZ_VIEWS.OVERVIEW,
    sort = "",
    enabled = true,
  } = options;

  return useQuery({
    queryKey: ["finviz", mode, ticker, filters, view, sort],
    queryFn: async () => {
      const { data } = await axios.get("/api/proxy/finviz", {
        params: { mode, ticker, f: filters, v: view, o: sort },
      });
      return data.data;
    },
    enabled,
    refetchInterval: mode === "quote" ? 60000 : 300000,
  });
}
