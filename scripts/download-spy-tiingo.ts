import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function downloadSpyTiingo() {
  const token = process.env.TIINGO_API_TOKEN;
  const symbol = 'spy';
  
  // 10 年前至今
  const startDate = '2016-01-01'; 
  
  console.log(`🚀 正在通过 Tiingo API 下载 ${symbol.toUpperCase()} 历史数据...`);

  const url = `https://api.tiingo.com/tiingo/daily/${symbol}/prices?startDate=${startDate}&token=${token}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Tiingo API 错误: ${response.status} - ${err}`);
    }

    const data: any = await response.json();

    // 转换为项目统一格式
    const formattedData = data.map((d: any) => ({
      date: d.date.split('T')[0],
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
      adjClose: d.adjClose,
      volume: d.volume
    }));

    const outputPath = path.join(process.cwd(), 'data', 'spy-history.json');
    if (!fs.existsSync(path.dirname(outputPath))) fs.mkdirSync(path.dirname(outputPath));
    
    fs.writeFileSync(outputPath, JSON.stringify(formattedData, null, 2));

    console.log(`\n✅ 下载成功！共获取 ${formattedData.length} 条交易日记录。`);
    console.log(`数据已同步至: ${outputPath}`);
  } catch (error: any) {
    console.error('❌ 下载失败:', error.message);
  }
}

downloadSpyTiingo();
