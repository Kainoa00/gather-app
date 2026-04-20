// ⚠️ DEMO-ONLY ROUTES — replace with server-side auth proxy before real PCC integration.
// These routes expose synthetic data with no per-resident authorization. Before flipping
// NEXT_PUBLIC_DATA_SOURCE=pcc against real PointClickCare data, rewrite each route to:
//   1. Verify the caller's Supabase session
//   2. Check the session's linkage to the requested patient (patients/care_circle_members)
//   3. Proxy to the real PCC API with server-held OAuth credentials
//   4. Never expose PCC auth tokens to the client bundle
import type { PCCListResponse } from '@/lib/pcc/types';

export function validateMockAuth(request: Request): boolean {
  const authHeader = request.headers.get('Authorization');
  return !!authHeader && authHeader.startsWith('Bearer ') && authHeader.length > 'Bearer '.length;
}

export function paginate<T>(items: T[], page: number, pageSize: number): PCCListResponse<T> {
  const totalCount = items.length;
  const start = (page - 1) * pageSize;
  const data = items.slice(start, start + pageSize);
  return {
    data,
    pagination: {
      page,
      pageSize,
      totalCount,
      hasMore: start + pageSize < totalCount,
    },
    syncedAt: new Date().toISOString(),
  };
}

export function parseDateRange(searchParams: URLSearchParams): { startDate: string; endDate: string } {
  const startDate = searchParams.get('startDate') ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const endDate = searchParams.get('endDate') ?? new Date().toISOString().slice(0, 10);
  return { startDate, endDate };
}
