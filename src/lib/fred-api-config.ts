/**
 * FRED API 终端配置 (V1 & V2 全集)
 * 来源于 FRED 官方文档: https://fred.stlouisfed.org/docs/api/fred/
 */
export const FRED_ENDPOINTS = {
  // --- V1 / Base Series ---
  SERIES: {
    GET: (id: string) => `https://api.stlouisfed.org/fred/series?series_id=${id}`,
    OBSERVATIONS: (id: string) => `https://api.stlouisfed.org/fred/series/observations?series_id=${id}`,
    CATEGORIES: (id: string) => `https://api.stlouisfed.org/fred/series/categories?series_id=${id}`,
    RELEASES: (id: string) => `https://api.stlouisfed.org/fred/series/releases?series_id=${id}`,
    TAGS: (id: string) => `https://api.stlouisfed.org/fred/series/tags?series_id=${id}`,
    UPDATES: "https://api.stlouisfed.org/fred/series/updates",
    VINTAGEDATES: (id: string) => `https://api.stlouisfed.org/fred/series/vintagedates?series_id=${id}`,
  },

  // --- V1 / Categories ---
  CATEGORY: {
    GET: (id: string) => `https://api.stlouisfed.org/fred/category?category_id=${id}`,
    CHILDREN: (id: string) => `https://api.stlouisfed.org/fred/category/children?category_id=${id}`,
    RELATED: (id: string) => `https://api.stlouisfed.org/fred/category/related?category_id=${id}`,
    SERIES: (id: string) => `https://api.stlouisfed.org/fred/category/series?category_id=${id}`,
    TAGS: (id: string) => `https://api.stlouisfed.org/fred/category/tags?category_id=${id}`,
    RELATED_TAGS: (id: string) => `https://api.stlouisfed.org/fred/category/related_tags?category_id=${id}`,
  },

  // --- V1 / Releases ---
  RELEASES: {
    ALL: "https://api.stlouisfed.org/fred/releases",
    DATES: "https://api.stlouisfed.org/fred/releases/dates",
    GET: (id: string) => `https://api.stlouisfed.org/fred/release?release_id=${id}`,
    DATES_BY_RELEASE: (id: string) => `https://api.stlouisfed.org/fred/release/dates?release_id=${id}`,
    OBSERVATIONS: (id: string) => `https://api.stlouisfed.org/fred/release/observations?release_id=${id}`,
    SERIES: (id: string) => `https://api.stlouisfed.org/fred/release/series?release_id=${id}`,
    SOURCES: (id: string) => `https://api.stlouisfed.org/fred/release/sources?release_id=${id}`,
    TAGS: (id: string) => `https://api.stlouisfed.org/fred/release/tags?release_id=${id}`,
    RELATED_TAGS: (id: string) => `https://api.stlouisfed.org/fred/release/related_tags?release_id=${id}`,
  },

  // --- V1 / Sources ---
  SOURCES: {
    ALL: "https://api.stlouisfed.org/fred/sources",
    GET: (id: string) => `https://api.stlouisfed.org/fred/source?source_id=${id}`,
    RELEASES: (id: string) => `https://api.stlouisfed.org/fred/source/releases?source_id=${id}`,
  },

  // --- V1 / Tags ---
  TAGS: {
    ALL: "https://api.stlouisfed.org/fred/tags",
    RELATED_TAGS: (tag: string) => `https://api.stlouisfed.org/fred/related_tags?tag_names=${tag}`,
    SERIES: (tag: string) => `https://api.stlouisfed.org/fred/tags/series?tag_names=${tag}`,
  }
};
