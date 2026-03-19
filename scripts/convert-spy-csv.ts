import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

/**
 * 将手动下载的 SPY.csv 转换为项目 JSON 格式
 */
function convertSpyCsv() {
  const csvPath = path.join(process.cwd(), 'data', 'spy-history.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ 错误: 找不到文件 ${csvPath}`);
    console.log('💡 请从 Yahoo Finance 下载 SPY 历史数据 CSV，重命名为 spy-history.csv 并放入 data 目录。');
    return;
  }

  console.log('正在解析 SPY 历史 CSV...');

  try {
    const content = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    const formattedData = records.map((r: any) => ({
      date: r.Date,
      open: parseFloat(r.Open),
      high: parseFloat(r.High),
      low: parseFloat(r.Low),
      close: parseFloat(r.Close),
      adjClose: parseFloat(r['Adj Close']),
      volume: parseInt(r.Volume)
    })).filter((d: any) => !isNaN(d.close));

    // 按日期升序排列
    formattedData.sort((a, b) => a.date.localeCompare(b.date));

    const outputPath = path.join(process.cwd(), 'data', 'spy-history.json');
    fs.writeFileSync(outputPath, JSON.stringify(formattedData, null, 2));

    console.log(`✅ 成功转换！已处理 ${formattedData.length} 条记录。`);
    console.log(`输出文件: ${outputPath}`);
  } catch (e: any) {
    console.error('❌ 转换失败:', e.message);
  }
}

convertSpyCsv();
