export const FINVIZ_FILTERS = {
  INDEX: {
    SP500: "idx_sp500",
    DJIA: "idx_dji",
    NASDAQ100: "idx_ndx",
  },
  SECTOR: {
    BASIC_MATERIALS: "sec_basicmaterials",
    COMMUNICATION_SERVICES: "sec_communicationservices",
    CONSUMER_CYCLICAL: "sec_consumercyclical",
    FINANCIAL: "sec_financial",
    HEALTHCARE: "sec_healthcare",
    TECHNOLOGY: "sec_technology",
  },
};

export const FINVIZ_VIEWS = {
  OVERVIEW: "111",
  VALUATION: "121",
  PERFORMANCE: "141",
  INSIDER: "insider",
};

export const FINVIZ_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "Accept-Language": "en-US,en;q=0.9",
};
