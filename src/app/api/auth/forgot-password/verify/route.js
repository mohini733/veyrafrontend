import { NextResponse } from 'next/server';
import { connectDB } from '../../../../../server/db';
import { User } from '../../../../../server/models/User';
import { generateToken } from '../../../../../server/auth';
import {
  normalizePhoneNumber,
  verifyOTP,
} from '../../../../../server/smsProvider';

export async function POST(request) {
  try {
    const { phone, otp, newPassword } = await request.json();

    if (!phone || !otp || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: 'Phone number, OTP, and new password are required',
        },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: 'Password must be at least 6 characters long',
        },
        { status: 400 }
      );
    }

    const normalized = normalizePhoneNumber(phone);
    const verification = verifyOTP(normalized, otp);
    if (!verification.success) {
      return NextResponse.json(
        { success: false, message: verification.message },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findOne({ phone: normalized });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    user.password = newPassword;
    user.isPhoneVerified = true;
    await user.save();

    const token = generateToken(user._id);

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
      token,
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
