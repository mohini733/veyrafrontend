import { NextResponse } from 'next/server';
import { connectDB } from '@/server/db';
import { getAuthUserId } from '@/server/auth';
import { SmsLog } from '@/server/models/SmsLog';

export async function GET(request) {
  try {
    const userId = getAuthUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();
    const logs = await SmsLog.find({ sender: userId })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    return NextResponse.json({
      success: true,
      logs,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
