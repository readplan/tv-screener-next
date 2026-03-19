# Terminal X - 专业级金融数据分析终端

Terminal X 是一个基于 **Next.js 14+** 构建的高性能金融市场监控平台。它集成了 TradingView、Tiingo 和 CNN 风格的深度分析工具，旨在为交易者提供一站式的市场筛选、技术分析及情绪监控体验。

## 🚀 核心功能

### 1. TradingView 市场筛选器
*   **多维度过滤**：内置 Mega ($200B+) 到 Nano ($50M) 的市值多选过滤逻辑。
*   **智能预设**：支持“最活跃成交”、“最大涨幅”、“盘前波动”等多种专业扫描预设。
*   **一键下钻**：点击 Ticker 代码可无缝跳转至 Finviz 深度分析页面。

### 2. 全屏市场热图 (Market Heatmap)
*   **原生集成**：采用 TradingView 官方嵌入式热图，100% 还原专业交易室质感。
*   **视觉校准**：遵循国际标准（绿涨红跌），实时展示标普 500 各行业的板块强弱。

### 3. 技术分析图表
*   **十年深度 K 线**：集成 `lightweight-charts`，支持从 Tiingo 加载自 2016 年起的完整历史行情。
*   **智能时间跨度**：支持 1D (实时 IEX 流)、5D、1M、1Y、10Y 等多维度切换。
*   **实时报价侧边栏**：动态展示个股的 Live Quote、公司背景描述及业务概览。

### 4. 恐慌贪婪指数 (Fear & Greed)
*   **像素级复刻**：1:1 还原 CNN 官方仪表盘 UI，包含动态指针与极值点着色。
*   **多指数对比 (Timeline)**：支持将情绪曲线与 **SPX, NDQ, DJI, RUT, VIX** 等指数进行双轴叠加。
*   **趋势洞察**：直观展示极度恐慌/贪婪与大盘底部/顶部的相关性。

### 5. Tiingo Data 中心
*   **全端点覆盖**：支持 REST 模式下的新闻流、基本面(Fundamentals)、分红(Dividends)、拆分(Splits)等。
*   **调试模式**：内置 Mock API 逻辑，支持在无 API 权限或额度时完整测试 UI 渲染。

## 🛠 技术栈

*   **框架**: Next.js 14 (App Router)
*   **语言**: TypeScript
*   **样式**: Tailwind CSS + Framer Motion
*   **状态管理**: TanStack Query (React Query) v5
*   **可视化**: Lightweight Charts, Recharts
*   **数据源**: Tiingo API, TradingView API, FRED (VIX History)

## 📦 快速开始

1.  **克隆仓库**:
    ```bash
    git clone https://github.com/readplan/tv-screener-next.git
    cd tv-screener-next
    ```

2.  **配置环境变量**:
    在根目录创建 `.env.local`:
    ```env
    TIINGO_API_TOKEN=你的_TIINGO_TOKEN
    ```

3.  **安装依赖**:
    ```bash
    npm install
    ```

4.  **启动开发服务器**:
    ```bash
    npm run dev
    ```

5.  **数据更新指令**:
    *   `npm run update-vix`: 更新实时 VIX 数据。
    *   `npm run convert-history`: 转换 Fear & Greed 历史 CSV。

## 🌐 部署至 Vercel

本项目针对 Vercel 进行了深度优化，您可以轻松实现一键部署：

1.  **关联 GitHub**: 在 Vercel 控制台导入本项目仓库。
2.  **配置环境变量**: 
    *   在 Vercel 项目设置的 `Environment Variables` 中，添加 `TIINGO_API_TOKEN`。
    *   确保该 Token 已在 Tiingo 后台激活。
3.  **构建设置**: 
    *   Framework Preset: `Next.js`
    *   Build Command: `npm run build`
4.  **自动部署**: 每次推送代码至 `main` 分支，Vercel 将自动触发生产环境构建。

> **注意**: 如果在部署时遇到 TypeScript 类型报错，请确保 `scripts/` 目录下的所有脚本均已通过类型检查（本项目已完成相关修复）。

## 📄 许可证

本项目采用 MIT 许可证。
