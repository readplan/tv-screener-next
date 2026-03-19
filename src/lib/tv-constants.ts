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

export const MARKET_CAP_OPTIONS = [
  { label: "Any", value: null },
  { label: "Mega ($200bln and more)", value: { left: "market_cap_basic", operation: "greater", right: 200000000000 } },
  { label: "Large ($10bln to $200bln)", value: { left: "market_cap_basic", operation: "in_range", right: [10000000000, 200000000000] } },
  { label: "Mid ($2bln to $10bln)", value: { left: "market_cap_basic", operation: "in_range", right: [2000000000000, 10000000000] } },
  { label: "Small ($300mln to $2bln)", value: { left: "market_cap_basic", operation: "in_range", right: [300000000, 2000000000] } },
  { label: "Micro ($50mln to $300mln)", value: { left: "market_cap_basic", operation: "in_range", right: [50000000, 300000000] } },
  { label: "Nano (under $50mln)", value: { left: "market_cap_basic", operation: "less", right: 50000000 } },
  { label: "+Large (over $10bln)", value: { left: "market_cap_basic", operation: "greater", right: 10000000000 } },
  { label: "+Mid (over $2bln)", value: { left: "market_cap_basic", operation: "greater", right: 2000000000 } },
  { label: "+Small (over $300mln)", value: { left: "market_cap_basic", operation: "greater", right: 300000000 } },
  { label: "+Micro (over $50mln)", value: { left: "market_cap_basic", operation: "greater", right: 50000000 } },
  { label: "-Large (under $200bln)", value: { left: "market_cap_basic", operation: "less", right: 200000000000 } },
  { label: "-Mid (under $10bln)", value: { left: "market_cap_basic", operation: "less", right: 10000000000 } },
  { label: "-Small (under $2bln)", value: { left: "market_cap_basic", operation: "less", right: 2000000000 } },
  { label: "-Micro (under $300mln)", value: { left: "market_cap_basic", operation: "less", right: 300000000 } },
];

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
