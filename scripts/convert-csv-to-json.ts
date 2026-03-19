import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

/**
 * 将 Fear & Greed 历史 CSV 转换为统一的 JSON 格式
 */
function convertCsvToJson() {
  const dataDir = path.join(process.cwd(), 'data');
  const files = fs.readdirSync(dataDir).filter(f => f.startsWith('fear-greed-') && f.endsWith('.csv'));
  
  console.log(`发现 ${files.length} 个历史 CSV 文件，正在处理...`);
  
  let allData: any[] = [];

  for (const file of files) {
    const filePath = path.join(dataDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // 解析 CSV (假设格式为 date,fear_and_greed_index)
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    const formattedRecords = records.map((r: any) => ({
      date: r.date,
      value: parseFloat(r.fear_and_greed_index)
    })).filter((r: any) => !isNaN(r.value));

    allData = [...allData, ...formattedRecords];
  }

  // 按日期排序并去重
  allData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // 简单的日期去重
  const uniqueData = Array.from(new Map(allData.map(item => [item.date, item])).values());

  const outputPath = path.join(dataDir, 'fear-greed-history.json');
  fs.writeFileSync(outputPath, JSON.stringify(uniqueData, null, 2));

  console.log(`✅ 成功转换！共整合 ${uniqueData.length} 条记录。`);
  console.log(`输出文件: ${outputPath}`);
}

convertCsvToJson();
