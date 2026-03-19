import * as fs from 'fs';
import * as path from 'path';

/**
 * 通过 TradingView 获取 SPY 历史数据 (更稳定)
 */
async function fetchSPYFromTV() {
  console.log(`🚀 正在通过 TradingView 获取 SPY 历史数据...`);

  // TradingView 的一些数据源可以直接通过特定的 chart 接口获取
  // 针对 10 年数据，我们将请求其公开的行情端点
  const symbol = 'NYSE:SPY';
  
  try {
    // 使用 TradingView 的开源轻量级数据接口（如果可用）或模拟其 UDF 接口
    // 这里我们先尝试一个非常稳定的公开回测端点
    const url = `https://benchmarks.investing.com/history?symbol=SPY&resolution=D&from=${Math.floor((Date.now() - 10 * 365 * 24 * 60 * 60 * 1000) / 1000)}&to=${Math.floor(Date.now() / 1000)}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data: any = await response.json();
    
    if (data.s === 'ok') {
      const formattedData = data.t.map((ts: number, i: number) => ({
        date: new Date(ts * 1000).toISOString().split('T')[0],
        open: data.o[i],
        high: data.h[i],
        low: data.l[i],
        close: data.c[i],
        volume: data.v[i]
      }));

      const outputPath = path.join(process.cwd(), 'data', 'spy-history.json');
      fs.writeFileSync(outputPath, JSON.stringify(formattedData, null, 2));

      console.log(`\n✅ 成功！已抓取 ${formattedData.length} 条交易日记录。`);
      console.log(`保存至: ${outputPath}`);
    } else {
      throw new Error("Invalid data format from provider");
    }
  } catch (error) {
    console.error('❌ 获取失败:', error);
    console.log('建议：由于 429 限制，请尝试在浏览器中直接下载 SPY CSV 并放入 data 目录。');
  }
}

fetchSPYFromTV();
