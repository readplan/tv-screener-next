import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { put } from '@vercel/blob';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

/**
 * 递归获取目录下的所有文件
 */
function getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
      arrayOfFiles = getAllFiles(path.join(dirPath, file), arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, file));
    }
  });

  return arrayOfFiles;
}

async function backupToBlob() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    console.error("❌ 错误: 未在 .env.local 中找到 BLOB_READ_WRITE_TOKEN");
    return;
  }

  const dataDir = path.join(process.cwd(), 'public/data');
  if (!fs.existsSync(dataDir)) {
    console.error("❌ 错误: 找不到数据目录 public/data");
    return;
  }

  console.log("🚀 开始将本地数据备份至 Vercel Blob...");

  const files = getAllFiles(dataDir).filter(f => f.endsWith('.json') || f.endsWith('.csv'));
  
  for (const filePath of files) {
    // 构建 Blob 中的路径名 (例如: data/vix-history.json)
    const relativePath = path.relative(path.join(process.cwd(), 'public'), filePath);
    const fileContent = fs.readFileSync(filePath);

    try {
      console.log(`正在上传: ${relativePath}...`);
      const { url } = await put(relativePath, fileContent, {
        access: 'private', // 匹配私有存储桶设置
        addRandomSuffix: false, // 保持文件名固定
        token: token
      });
      console.log(`✅ 上传成功! URL: ${url}`);
    } catch (error: any) {
      console.error(`❌ 上传失败 ${relativePath}:`, error.message);
    }
  }

  console.log("\n🎊 备份任务全部完成！");
}

backupToBlob();
