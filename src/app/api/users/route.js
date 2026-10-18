import { NextResponse } from 'next/server';
import { connectDB } from '../../../server/db';
import { User } from '../../../server/models/User';
import { getAuthUserId } from '../../../server/auth';

export async function GET(request) {
  try {
    const userId = getAuthUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const users = await User.find({ _id: { $ne: userId } })
      .select('_id name phone avatar about online lastSeen isPhoneVerified createdAt')
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
