/**
 * FRED API V2 终端配置
 * 参考: https://fred.stlouisfed.org/docs/api/fred/v2/index.html
 */
export const FRED_ENDPOINTS = {
  // 1. Series (系列)
  SERIES: {
    GET: (id: string) => `https://api.stlouisfed.org/fred/series?series_id=${id}`,
    OBSERVATIONS: (id: string) => `https://api.stlouisfed.org/fred/series/observations?series_id=${id}`,
    CATEGORIES: (id: string) => `https://api.stlouisfed.org/fred/series/categories?series_id=${id}`,
    RELEASES: (id: string) => `https://api.stlouisfed.org/fred/series/releases?series_id=${id}`,
    TAGS: (id: string) => `https://api.stlouisfed.org/fred/series/tags?series_id=${id}`,
  },

  // 2. Releases (发布)
  RELEASES: {
    ALL: "https://api.stlouisfed.org/fred/releases",
    DATES: "https://api.stlouisfed.org/fred/releases/dates",
    GET: (id: string) => `https://api.stlouisfed.org/fred/release?release_id=${id}`,
    OBSERVATIONS: (id: string) => `https://api.stlouisfed.org/fred/release/observations?release_id=${id}`,
    SERIES: (id: string) => `https://api.stlouisfed.org/fred/release/series?release_id=${id}`,
  },

  // 3. Categories (类目)
  CATEGORY: {
    GET: (id: string) => `https://api.stlouisfed.org/fred/category?category_id=${id}`,
    CHILDREN: (id: string) => `https://api.stlouisfed.org/fred/category/children?category_id=${id}`,
    SERIES: (id: string) => `https://api.stlouisfed.org/fred/category/series?category_id=${id}`,
  },

  // 4. Tags (标签)
  TAGS: {
    ALL: "https://api.stlouisfed.org/fred/tags",
    SERIES: (tag: string) => `https://api.stlouisfed.org/fred/tags/series?tag_names=${tag}`,
  }
};
