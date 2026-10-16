import { NextResponse } from 'next/server';
import { connectDB } from '../../../../server/db';
import { User } from '../../../../server/models/User';
import { getAuthUserId } from '../../../../server/auth';

export async function PUT(request) {
  try {
    const userId = getAuthUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, about, avatar } = await request.json();
    await connectDB();

    const updates = {};
    if (name) updates.name = name.trim();
    if (about !== undefined) updates.about = about.trim();
    if (avatar) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        avatar: user.avatar,
        about: user.about,
        isPhoneVerified: user.isPhoneVerified,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
