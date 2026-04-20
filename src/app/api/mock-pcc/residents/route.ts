import { NextResponse } from 'next/server';
import { getMockData } from '@/lib/pcc/mock';
import { validateMockAuth, paginate } from '../_utils';

export async function GET(request: Request) {
  if (!validateMockAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') ?? '25', 10);
  const statusFilter = searchParams.get('status');

  const mockData = getMockData({ includeTodayUpToNow: true });
  let residents = Array.from(mockData.values()).map((d) => d.resident);

  if (statusFilter) {
    residents = residents.filter((r) => r.status === statusFilter);
  }

  return NextResponse.json(paginate(residents, page, pageSize));
}
