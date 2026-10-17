import { NextResponse } from 'next/server';
import { connectDB } from '../../../../../server/db';
import { User } from '../../../../../server/models/User';
import { generateToken } from '../../../../../server/auth';
import {
  getPossiblePhones,
  verifyOTP,
} from '../../../../../server/smsProvider';

export async function POST(request) {
  try {
    const { phone, otp, newPassword } = await request.json();

    if (!phone || !otp || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: 'Phone number, OTP verification code, and new password are required',
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

    await connectDB();
    const possiblePhones = getPossiblePhones(phone);

    // 1. Verify OTP first (using MongoDB persistent store / memory fallback)
    const verification = await verifyOTP(phone, otp);
    if (!verification.success) {
      return NextResponse.json(
        { success: false, message: verification.message },
        { status: 400 }
      );
    }

    // 2. Find user by any of the possible formatted representations
    const user = await User.findOne({ phone: { $in: possiblePhones } });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'No registered user found with this phone number' },
        { status: 404 }
      );
    }

    // 3. Update password (pre-save hook will hash password with bcrypt)
    user.password = newPassword;
    user.isPhoneVerified = true;
    await user.save();

    // 4. Generate login token
    const token = generateToken(user._id);

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully! Redirecting to chats...',
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
    console.error('[Veyra Reset Password Error]:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error while resetting password' },
      { status: 500 }
    );
  }
}
