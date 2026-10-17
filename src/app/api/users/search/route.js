import { NextResponse } from 'next/server';
import { connectDB } from '../../../../server/db';
import { User } from '../../../../server/models/User';
import { getAuthUserId } from '../../../../server/auth';

const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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
    const query =
      searchParams.get('phone') ||
      searchParams.get('q') ||
      searchParams.get('query') ||
      '';

    if (!query || !query.trim()) {
      return NextResponse.json({ success: true, count: 0, users: [] });
    }

    await connectDB();
    const rawQuery = query.trim();
    const cleanDigits = rawQuery.replace(/[^\d]/g, '');
    const last10 = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : cleanDigits;

    const orConditions = [
      { name: { $regex: escapeRegex(rawQuery), $options: 'i' } },
    ];

    if (cleanDigits) {
      orConditions.push({ phone: { $regex: cleanDigits, $options: 'i' } });
    }
    if (last10 && last10 !== cleanDigits) {
      orConditions.push({ phone: { $regex: last10, $options: 'i' } });
    }

    const users = await User.find({
      _id: { $ne: userId },
      $or: orConditions,
    })
      .select('_id name phone avatar about online lastSeen isPhoneVerified')
      .limit(20);

    return NextResponse.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error('[Veyra User Search Error]:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to search users' },
      { status: 500 }
    );
  }
}
