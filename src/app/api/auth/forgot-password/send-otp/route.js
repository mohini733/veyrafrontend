import { NextResponse } from 'next/server';
import { connectDB } from '../../../../../server/db';
import { User } from '../../../../../server/models/User';
import {
  normalizePhoneNumber,
  sendOTP,
} from '../../../../../server/smsProvider';

export async function POST(request) {
  try {
    const { phone } = await request.json();
    if (!phone) {
      return NextResponse.json(
        { success: false, message: 'Phone number is required' },
        { status: 400 }
      );
    }

    await connectDB();
    const normalized = normalizePhoneNumber(phone);
    const user = await User.findOne({ phone: normalized });
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'No account registered with this phone number',
        },
        { status: 404 }
      );
    }

    const otpResult = await sendOTP(normalized);
    return NextResponse.json({
      success: true,
      message: otpResult.message,
      phone: otpResult.phone,
      devOtp: otpResult.devOtp,
      configured: true,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
