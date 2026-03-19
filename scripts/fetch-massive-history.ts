import { S3Client, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import * as zlib from "zlib";
import { Readable } from "stream";
import { parse } from "csv-parse/sync";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const client = new S3Client({
  endpoint: process.env.MASSIVE_S3_ENDPOINT,
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.MASSIVE_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.MASSIVE_SECRET_ACCESS_KEY || ""
  },
  forcePathStyle: true
});

async function fetchHistory(symbol: string, startYear: number, endYear: number) {
  console.log(`🚀 启动 Massive 数据提取: ${symbol} (${startYear}-${endYear})`);
  
  const allResults: any[] = [];
  const category = "us_stocks_sip"; // SPY 属于 SIP 股票类
  
  // 遍历年份
  for (let year = startYear; year <= endYear; year++) {
    console.log(`\n📅 正在扫描 ${year} 年数据...`);
    
    try {
      // 列出该年下的所有月份目录
      const listCommand = new ListObjectsV2Command({
        Bucket: process.env.MASSIVE_BUCKET,
        Prefix: `${category}/day_aggs_v1/${year}/`,
        Delimiter: '/'
      });
      const { CommonPrefixes } = await client.send(listCommand);
      
      if (!CommonPrefixes) continue;

      for (const monthPrefix of CommonPrefixes) {
        // 列出该月下的所有日期文件
        const fileCommand = new ListObjectsV2Command({
          Bucket: process.env.MASSIVE_BUCKET,
          Prefix: monthPrefix.Prefix
        });
        const { Contents } = await client.send(fileCommand);
        
        if (!Contents) continue;

        for (const file of Contents) {
          if (!file.Key?.endsWith(".csv.gz")) continue;

          try {
            // 下载并解压
            const getCommand = new GetObjectCommand({
              Bucket: process.env.MASSIVE_BUCKET,
              Key: file.Key
            });
            const response = await client.send(getCommand);
            const stream = response.Body as Readable;
            
            const buffer = await new Promise<Buffer>((resolve, reject) => {
              const chunks: any[] = [];
              stream.pipe(zlib.createGunzip())
                .on("data", (chunk) => chunks.push(chunk))
                .on("end", () => resolve(Buffer.concat(chunks)))
                .on("error", reject);
            });

            // 解析 CSV 并筛选特定 Symbol
            const records = parse(buffer.toString(), { columns: true, skip_empty_lines: true });
            const match: any = records.find((r: any) => r.ticker === symbol || r.symbol === symbol);
            
            if (match) {
              const dateMatch = file.Key.match(/(\d{4}-\d{2}-\d{2})/);
              allResults.push({
                date: dateMatch ? dateMatch[1] : year,
                open: parseFloat(match.open),
                high: parseFloat(match.high),
                low: parseFloat(match.low),
                close: parseFloat(match.close),
                volume: parseInt(match.volume)
              });
              process.stdout.write("."); // 进度点
            }
          } catch (e: any) {
            console.error(`\n❌ 读取文件失败 ${file.Key}:`, e.message);
          }
        }
      }
    } catch (e: any) {
      console.error(`\n❌ 扫描年份失败 ${year}:`, e.message);
    }
  }

  // 排序并保存
  allResults.sort((a, b) => a.date.localeCompare(b.date));
  const outputPath = path.join(process.cwd(), "data", `${symbol.toLowerCase()}-massive-history.json`);
  fs.writeFileSync(outputPath, JSON.stringify(allResults, null, 2));
  
  console.log(`\n\n✅ 提取完成！已生成 ${allResults.length} 条记录。`);
  console.log(`保存路径: ${outputPath}`);
}

// 示例：获取 2024 年至今的数据
fetchHistory("SPY", 2024, 2026);
