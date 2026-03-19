import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const MACRO_SERIES = [
  { id: 'DGS10', name: 'us10y' },        // 10-Year Treasury
  { id: 'M2SL', name: 'm2' },            // M2 Money Supply
  { id: 'UNRATE', name: 'unemployment' }, // Unemployment Rate
  { id: 'CPIAUCSL', name: 'cpi' },       // Consumer Price Index
  { id: 'BAMLH0A0HYM2', name: 'yield_spread' }, // ICE BofA High Yield Index Option-Adjusted Spread
  { id: 'WTREGEN', name: 'tga' }         // Treasury General Account: Deposits
];

async function syncMacroData() {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) {
    console.error("❌ 错误: 未找到 FRED_API_KEY");
    return;
  }

  const dataDir = path.join(process.cwd(), 'public/data/macro');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  for (const series of MACRO_SERIES) {
    console.log(`🚀 正在同步 FRED 宏观指标: ${series.id} (${series.name})...`);
    
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${series.id}&api_key=${apiKey}&file_type=json`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`FRED API 错误: ${response.status}`);
      
      const data: any = await response.json();
      const formatted = data.observations
        .map((obs: any) => ({
          date: obs.date,
          value: parseFloat(obs.value)
        }))
        .filter((d: any) => !isNaN(d.value));

      const outputPath = path.join(dataDir, `${series.name}-history.json`);
      fs.writeFileSync(outputPath, JSON.stringify(formatted, null, 2));
      console.log(`✅ ${series.id} 同步完成！共 ${formatted.length} 条记录。`);
    } catch (e: any) {
      console.error(`❌ ${series.id} 同步失败:`, e.message);
    }
  }
}

syncMacroData();
