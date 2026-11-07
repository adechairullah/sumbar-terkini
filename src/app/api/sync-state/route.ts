import { NextResponse } from 'next/server';
import { LocalStorageManager } from '@/lib/data/storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  const state = LocalStorageManager.getState();
  return NextResponse.json({
    success: true,
    data: state,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.reset) {
      LocalStorageManager.resetToSeed();
      return NextResponse.json({ success: true, message: 'Reset to seed complete', timestamp: new Date().toISOString() });
    }

    if (body.key && body.value !== undefined) {
      const state = LocalStorageManager.getState();
      
      if (body.key === 'siteSettings') {
        state.siteSettings = body.value;
      } else if (body.key === 'socialPlatforms') {
        state.socialPlatforms = body.value;
      } else if (body.key === 'endorsePackages') {
        state.endorsePackages = body.value;
      } else if (body.key === 'visitorReactions') {
        state.visitorReactions = body.value;
      } else if (body.key === 'portfolioItems') {
        state.portfolioItems = body.value;
      }

      return NextResponse.json({
        success: true,
        key: body.key,
        timestamp: new Date().toISOString(),
      });
    }

    if (body.fullState) {
      if (globalThis.__SUMBAR_LOCAL_STORE__) {
        globalThis.__SUMBAR_LOCAL_STORE__ = {
          ...globalThis.__SUMBAR_LOCAL_STORE__,
          ...body.fullState,
        };
      }
      return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
