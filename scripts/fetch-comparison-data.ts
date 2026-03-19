import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function fetchComparisonData() {
  const token = process.env.TIINGO_API_TOKEN;
  const tickers = ['qqq', 'dia', 'iwm']; // SPY 已经有了
  const startDate = '2016-01-01';

  for (const symbol of tickers) {
    console.log(`🚀 正在抓取对比数据: ${symbol.toUpperCase()}...`);
    const url = `https://api.tiingo.com/tiingo/daily/${symbol}/prices?startDate=${startDate}&token=${token}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
      
      const data: any = await response.json();
      const formatted = data.map((d: any) => ({
        date: d.date.split('T')[0],
        close: d.close
      }));

      const outputPath = path.join(process.cwd(), 'public/data', `${symbol}-history.json`);
      fs.writeFileSync(outputPath, JSON.stringify(formatted, null, 2));
      console.log(`✅ ${symbol.toUpperCase()} 抓取成功！记录数: ${formatted.length}`);
    } catch (e: any) {
      console.error(`❌ ${symbol} 抓取失败:`, e.message);
    }
  }
}

fetchComparisonData();
