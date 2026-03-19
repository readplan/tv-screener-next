export const DEFAULT_COLUMNS = [
  "name",
  "description",
  "close",
  "change",
  "volume",
  "market_cap_basic",
  "relative_volume_10d_calc",
  "Recommend.All",
];

export const COLUMN_LABELS: Record<string, string> = {
  name: "代码",
  description: "描述",
  close: "价格",
  change: "涨跌幅 (%)",
  volume: "成交量",
  market_cap_basic: "市值",
  relative_volume_10d_calc: "相对成交量 (10d)",
  "Recommend.All": "推荐评分",
};

export const PRESETS = {
  PREMARKET_GAINERS: {
    label: "盘前涨幅榜",
    filter: [
      { left: "premarket_change", operation: "greater", right: 0 },
      { left: "market_cap_basic", operation: "greater", right: 50000000 },
    ],
    sort: { sortBy: "premarket_change", sortOrder: "desc" },
  },
  MOST_ACTIVE: {
    label: "最活跃股票",
    filter: [],
    sort: { sortBy: "volume", sortOrder: "desc" },
  },
  TOP_GAINERS: {
    label: "当日涨幅榜",
    filter: [{ left: "change", operation: "greater", right: 0 }],
    sort: { sortBy: "change", sortOrder: "desc" },
  },
};
