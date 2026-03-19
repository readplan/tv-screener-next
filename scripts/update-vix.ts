import * as fs from 'fs';
import * as path from 'path';

/**
 * 稳定版：通过 TradingView 接口获取 VIX 数据
 * TradingView 的接口更稳定且不易触发 429
 */
async function getVix() {
  console.log('正在从 TradingView 接口获取 VIX 数据...');
  
  try {
    const payload = {
      symbols: { tickers: ["CBOE:VIX"], query: { types: [] } },
      columns: ["close", "change", "description"],
    };

    const response = await fetch("https://scanner.tradingview.com/global/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    const vixInfo = data.data?.[0]?.d;
    
    if (vixInfo) {
      const vixData = {
        vix: Math.round(vixInfo[0] * 100) / 100,
        change: Math.round(vixInfo[1] * 100) / 100,
        name: vixInfo[2],
        date: new Date().toISOString().split('T')[0],
        status: getVixStatus(vixInfo[0]),
        updatedAt: new Date().toLocaleString(),
        source: "TradingView"
      };
      
      const outputPath = path.join(process.cwd(), 'vix_data.json');
      fs.writeFileSync(outputPath, JSON.stringify(vixData, null, 2));
      
      console.log('✅ 成功获取 VIX 数据:');
      console.table(vixData);
    }
  } catch (error) {
    console.error('❌ 获取 VIX 失败:', error);
  }
}

function getVixStatus(val: number) {
  if (val < 15) return "Low";
  if (val < 20) return "Normal";
  if (val < 30) return "Elevated";
  if (val < 40) return "High";
  return "Extreme";
}

getVix();
