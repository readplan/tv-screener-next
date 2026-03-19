import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. 保护 Cron 任务路径 - 仅执行安全校验
  if (pathname.startsWith('/api/cron/')) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Unauthorized' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }
  }

  return NextResponse.next();
}

// 匹配器仅保留 Cron 路径，Proxy 路径已在 next.config.ts 中处理
export const config = {
  matcher: ['/api/cron/:path*'],
};
