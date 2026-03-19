import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function syncVIXFromFRED() {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) {
    console.error("❌ 错误: 未在 .env.local 中找到 FRED_API_KEY");
    return;
  }

  console.log("🚀 正在从 FRED 官方 API 同步 VIX 最新历史数据...");

  const seriesId = "VIXCLS";
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`FRED API 响应错误: ${response.status}`);

    const data: any = await response.json();
    
    const formattedData = data.observations
      .map((obs: any) => ({
        date: obs.date,
        close: parseFloat(obs.value)
      }))
      .filter((d: any) => !isNaN(d.close));

    // 按日期排序
    formattedData.sort((a: any, b: any) => a.date.localeCompare(b.date));

    const outputPath = path.join(process.cwd(), 'public/data', 'vix-history.json');
    fs.writeFileSync(outputPath, JSON.stringify(formattedData, null, 2));

    console.log(`\n✅ 同步成功！`);
    console.log(`- 获取记录数: ${formattedData.length}`);
    console.log(`- 最新日期: ${formattedData[formattedData.length - 1].date}`);
    console.log(`- 最新 VIX: ${formattedData[formattedData.length - 1].close}`);
    console.log(`- 覆盖文件: ${outputPath}`);
  } catch (error: any) {
    console.error("❌ 同步失败:", error.message);
  }
}

syncVIXFromFRED();
