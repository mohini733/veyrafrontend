import { NextResponse } from 'next/server';
import { getProviderStatus } from '@/server/smsProvider';

export async function GET() {
  try {
    const status = getProviderStatus();
    return NextResponse.json({
      success: true,
      ...status,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
