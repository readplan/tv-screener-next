import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function fetchVIX() {
  const token = process.env.TIINGO_API_TOKEN;
  // 在 Tiingo IEX 中，VIX 的 ticker 是 VIX
  const startDate = '2016-01-01';
  console.log(`🚀 正在尝试通过 Tiingo IEX 抓取 VIX 历史数据...`);
  
  const url = `https://api.tiingo.com/iex/vix/prices?startDate=${startDate}&resampleFreq=1day&token=${token}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
    
    const data: any = await response.json();
    const formatted = data.map((d: any) => ({
      date: d.date.split('T')[0],
      close: d.close
    }));

    const outputPath = path.join(process.cwd(), 'public/data', 'vix-history.json');
    fs.writeFileSync(outputPath, JSON.stringify(formatted, null, 2));
    console.log(`✅ VIX 数据获取成功！共 ${formatted.length} 条记录。`);
  } catch (e: any) {
    console.error('❌ 获取失败:', e.message);
  }
}

fetchVIX();
