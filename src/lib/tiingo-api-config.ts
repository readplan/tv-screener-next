/**
 * Tiingo API 终端路径统一配置
 * 来源于 test/api.txt
 */
export const TIINGO_ENDPOINTS = {
  // 2.1 End-of-Day
  DAILY: {
    META: (ticker: string) => `https://api.tiingo.com/tiingo/daily/${ticker}`,
    PRICES: (ticker: string) => `https://api.tiingo.com/tiingo/daily/${ticker}/prices`,
    HISTORICAL: (ticker: string, start: string, end: string) => 
      `https://api.tiingo.com/tiingo/daily/${ticker}/prices?startDate=${start}&endDate=${end}`,
  },

  // 2.2 News
  NEWS: "https://api.tiingo.com/tiingo/news",

  // 2.3 Crypto
  CRYPTO: {
    TOP: (tickers: string) => `https://api.tiingo.com/tiingo/crypto/top?tickers=${tickers}`,
    PRICES: (tickers: string) => `https://api.tiingo.com/tiingo/crypto/prices?tickers=${tickers}`,
    HISTORICAL: (tickers: string, start: string, freq: string) => 
      `https://api.tiingo.com/tiingo/crypto/prices?tickers=${tickers}&startDate=${start}&resampleFreq=${freq}`,
  },

  // 2.4 Forex
  FOREX: {
    TOP: (ticker: string) => `https://api.tiingo.com/tiingo/fx/${ticker}/top`,
    HISTORICAL: (ticker: string, start: string, freq: string) => 
      `https://api.tiingo.com/tiingo/fx/${ticker}/prices?startDate=${start}&resampleFreq=${freq}`,
  },

  // 2.5 IEX
  IEX: {
    ALL: "https://api.tiingo.com/iex",
    TICKER: (ticker: string) => `https://api.tiingo.com/iex/${ticker}`,
    HISTORICAL: (ticker: string, start: string, freq: string) => 
      `https://api.tiingo.com/iex/${ticker}/prices?startDate=${start}&resampleFreq=${freq}`,
  },

  // 2.6 Fundamentals
  FUNDAMENTALS: {
    DEFINITIONS: "https://api.tiingo.com/tiingo/fundamentals/definitions",
    STATEMENTS: (ticker: string) => `https://api.tiingo.com/tiingo/fundamentals/${ticker}/statements`,
    DAILY: (ticker: string) => `https://api.tiingo.com/tiingo/fundamentals/${ticker}/daily`,
    META: "https://api.tiingo.com/tiingo/fundamentals/meta",
  },

  // 2.7 Funds (Mutual Fund & ETF)
  FUNDS: {
    META: (ticker: string) => `https://api.tiingo.com/tiingo/funds/${ticker}`,
    METRICS: (ticker: string) => `https://api.tiingo.com/tiingo/funds/${ticker}/metrics`,
  },

  // 2.8 Dividends
  DIVIDENDS: {
    BATCH: "https://api.tiingo.com/tiingo/corporate-actions/distributions",
    TICKER: (ticker: string) => `https://api.tiingo.com/tiingo/corporate-actions/${ticker}/distributions`,
    YIELD: (ticker: string) => `https://api.tiingo.com/tiingo/corporate-actions/${ticker}/distribution-yield`,
  },

  // 2.9 Splits
  SPLITS: {
    BATCH: "https://api.tiingo.com/tiingo/corporate-actions/splits",
    TICKER: (ticker: string) => `https://api.tiingo.com/tiingo/corporate-actions/${ticker}/splits`,
  },

  // 3. Websockets
  WS: {
    CRYPTO: "wss://api.tiingo.com/crypto",
    FOREX: "wss://api.tiingo.com/fx",
    IEX: "wss://api.tiingo.com/iex",
  },

  // 4. Utilities
  SEARCH: (query: string) => `https://api.tiingo.com/tiingo/utilities/search?query=${query}`,
};
