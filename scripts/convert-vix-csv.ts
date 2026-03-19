import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

/**
 * 将 FRED 导出的 VIXCLS.csv 转换为项目标准 JSON 格式
 */
function convertVixCsv() {
  const csvPath = path.join(process.cwd(), 'public/data', 'VIXCLS.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ 错误: 找不到文件 ${csvPath}`);
    return;
  }

  console.log('正在解析真实 VIX 历史 CSV...');

  try {
    const content = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    const formattedData = records
      .map((r: any) => ({
        date: r.observation_date,
        close: parseFloat(r.VIXCLS)
      }))
      .filter((d: any) => !isNaN(d.close)); // 过滤空值记录

    // 按日期升序排列
    formattedData.sort((a: any, b: any) => a.date.localeCompare(b.date));

    const outputPath = path.join(process.cwd(), 'public/data', 'vix-history.json');
    fs.writeFileSync(outputPath, JSON.stringify(formattedData, null, 2));

    console.log(`\n✅ 成功转换！已处理 ${formattedData.length} 条真实 VIX 记录。`);
    console.log(`覆盖文件: ${outputPath}`);
  } catch (e: any) {
    console.error('❌ 转换失败:', e.message);
  }
}

convertVixCsv();
