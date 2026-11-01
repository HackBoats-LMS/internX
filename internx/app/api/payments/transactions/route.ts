import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/jwt';
import { getUserPaymentTransactions } from '@/lib/coursesService';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session || !session.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const transactions = await getUserPaymentTransactions(session.id);
    return NextResponse.json({ success: true, transactions });
  } catch (error: any) {
    console.error('Fetch transactions error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch payment transactions' },
      { status: 500 }
    );
  }
}
