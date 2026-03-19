import * as fs from 'fs';
import * as path from 'path';

/**
 * 为 Timeline 视图生成 VIX 指数历史模拟数据 (基于标普波动率特征)
 * 并在 UI 中开放 VIX 对比选项
 */
function generateVIX() {
  console.log("🚀 正在构建 VIX 历史数据集...");
  
  // 我们从已有的 Fear & Greed 历史中提取日期，并根据 VIX 的反向相关性生成模拟数据
  // 这确保了日期完美对齐，方便 UI 演示。
  // 注意：如果您有真实的 VIX.csv，我可以用它替换这里的逻辑。
  
  const fgPath = path.join(process.cwd(), 'data', 'fear-greed-history.json');
  if (!fs.existsSync(fgPath)) {
    console.error("找不到 F&G 历史数据");
    return;
  }

  const fgData = JSON.parse(fs.readFileSync(fgPath, 'utf-8'));
  
  // 根据情绪反向生成 VIX (F&G 高 = 贪婪 = VIX 低；F&G 低 = 恐慌 = VIX 高)
  const vixData = fgData.map((d: any) => {
    const baseVix = 15 + (Math.random() * 5); // 基础 15-20
    const sentimentImpact = (100 - d.value) / 2; // 情绪越低(恐慌)，VIX越高
    return {
      date: d.date,
      close: parseFloat((baseVix + sentimentImpact).toFixed(2))
    };
  });

  const outputPath = path.join(process.cwd(), 'public/data', 'vix-history.json');
  fs.writeFileSync(outputPath, JSON.stringify(vixData, null, 2));
  
  console.log(`✅ VIX 历史数据同步完成！共 ${vixData.length} 条对齐记录。`);
}

generateVIX();
