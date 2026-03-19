import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';
import * as path from 'path';

// 加载 .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const client = new S3Client({
  endpoint: process.env.MASSIVE_S3_ENDPOINT,
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.MASSIVE_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.MASSIVE_SECRET_ACCESS_KEY || ''
  },
  forcePathStyle: true // 某些 S3 兼容服务需要开启此项
});

async function probe() {
  console.log('--- Massive S3 探测器 ---');
  console.log(`端点: ${process.env.MASSIVE_S3_ENDPOINT}`);
  console.log(`存储桶: ${process.env.MASSIVE_BUCKET}`);
  
  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.MASSIVE_BUCKET,
      Prefix: 'us_stocks_sip/day_aggs_v1/2024/',
      Delimiter: '/',
      MaxKeys: 10
    });

    const response = await client.send(command);
    
    console.log('\n发现以下顶级目录:');
    response.CommonPrefixes?.forEach(prefix => {
      console.log(` 📂 ${prefix.Prefix}`);
    });

    if (response.Contents) {
      console.log('\n发现根目录文件:');
      response.Contents.forEach(file => {
        console.log(` 📄 ${file.Key} (${(file.Size! / 1024).toFixed(2)} KB)`);
      });
    }

  } catch (error: any) {
    console.error('\n❌ 探测失败:');
    console.error(`错误类型: ${error.name}`);
    console.error(`消息: ${error.message}`);
  }
}

probe();
