import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    access_token: 'mock-token-' + Date.now(),
    expires_in: 3600,
  });
}
