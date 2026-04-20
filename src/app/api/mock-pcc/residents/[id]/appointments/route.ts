import { NextResponse } from 'next/server';
import { getMockData } from '@/lib/pcc/mock';
import { validateMockAuth, paginate } from '../../../_utils';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  if (!validateMockAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const mockData = getMockData({ includeTodayUpToNow: true });
  const entry = mockData.get(params.id);

  if (!entry) {
    return NextResponse.json({ error: 'Resident not found' }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') ?? '25', 10);
  const startDateParam = searchParams.get('startDate');
  const endDateParam = searchParams.get('endDate');

  let appointments = entry.appointments;

  if (startDateParam && endDateParam) {
    appointments = appointments.filter(
      (a) => a.scheduledStart >= startDateParam && a.scheduledStart <= endDateParam + 'T23:59:59.999Z'
    );
  }

  return NextResponse.json(paginate(appointments, page, pageSize));
}
