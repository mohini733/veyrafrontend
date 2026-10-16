import { NextResponse } from 'next/server';
import { connectDB } from '../../../../server/db';
import { User } from '../../../../server/models/User';
import { getAuthUserId } from '../../../../server/auth';

export async function GET(request) {
  try {
    const userId = getAuthUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Not authorized, token missing or invalid' },
        { status: 401 }
      );
    }

    await connectDB();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        avatar: user.avatar,
        about: user.about,
        isPhoneVerified: user.isPhoneVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
