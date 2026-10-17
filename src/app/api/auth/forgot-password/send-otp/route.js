import { NextResponse } from 'next/server';
import { connectDB } from '../../../../../server/db';
import { User } from '../../../../../server/models/User';
import {
  normalizePhoneNumber,
  getPossiblePhones,
  sendOTP,
} from '../../../../../server/smsProvider';

export async function POST(request) {
  try {
    const { phone } = await request.json();
    if (!phone || !phone.toString().trim()) {
      return NextResponse.json(
        { success: false, message: 'Registered phone number is required' },
        { status: 400 }
      );
    }

    await connectDB();
    const possiblePhones = getPossiblePhones(phone);
    const user = await User.findOne({ phone: { $in: possiblePhones } });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'No registered account found with this phone number. Please check the number or register free.',
        },
        { status: 404 }
      );
    }

    const otpResult = await sendOTP(user.phone);

    return NextResponse.json({
      success: true,
      message: otpResult.message,
      phone: user.phone,
      devOtp: otpResult.devOtp,
      configured: true,
    });
  } catch (error) {
    console.error('[Veyra Forgot Password OTP Error]:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to dispatch reset code' },
      { status: 500 }
    );
  }
}
