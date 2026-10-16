import { NextResponse } from 'next/server';
import { connectDB } from '../../../../server/db';
import { User } from '../../../../server/models/User';
import { getAuthUserId } from '../../../../server/auth';

export async function GET(request) {
  try {
    const userId = getAuthUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query.trim()) {
      return NextResponse.json({ success: true, users: [] });
    }

    await connectDB();
    const cleanDigits = query.replace(/[^\d]/g, '');

    const users = await User.find({
      _id: { $ne: userId },
      $or: [
        { name: { $regex: query.trim(), $options: 'i' } },
        { phone: { $regex: cleanDigits || query.trim(), $options: 'i' } },
      ],
    })
      .select('name phone avatar about online lastSeen')
      .limit(20);

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
