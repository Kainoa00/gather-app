import { NextResponse } from 'next/server';
import { getMockData } from '@/lib/pcc/mock';
import { validateMockAuth } from '../../_utils';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  if (!validateMockAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const mockData = getMockData({ includeTodayUpToNow: true });
  const entry = mockData.get(params.id);

  if (!entry) {
    return NextResponse.json({ error: 'Resident not found' }, { status: 404 });
  }

  return NextResponse.json(entry.resident);
}
