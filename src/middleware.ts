import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. 保护 Cron 任务路径
  if (pathname.startsWith('/api/cron/')) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Unauthorized: Missing or invalid CRON_SECRET' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }
  }

  // 2. API Proxy 全局注入 (未来可在此添加通用限流逻辑)
  if (pathname.startsWith('/api/proxy/')) {
    // 允许跨域 (CORS) 
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    return response;
  }

  return NextResponse.next();
}

// 仅在特定路径上运行中间件以优化性能
export const config = {
  matcher: ['/api/proxy/:path*', '/api/cron/:path*'],
};
