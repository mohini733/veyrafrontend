import { NextResponse } from 'next/server';
import { connectDB } from '../../../../server/db';
import { User } from '../../../../server/models/User';
import { generateToken } from '../../../../server/auth';
import { normalizePhoneNumber } from '../../../../server/smsProvider';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { phone, password } = body;

    if (!phone || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Please provide both phone number and password',
        },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhoneNumber(phone);
    const rawDigits = phone.replace(/[^\d]/g, '');

    const possiblePhones = [normalizedPhone, phone.trim()];
    if (rawDigits.length >= 10) {
      const last10 = rawDigits.slice(-10);
      possiblePhones.push('+91' + last10);
      possiblePhones.push('+' + rawDigits);
      possiblePhones.push(last10);
    }

    const user = await User.findOne({ phone: { $in: possiblePhones } }).select('+password');

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'No account registered with this phone number. Click "Register free" below to create your account.',
        },
        { status: 401 }
      );
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json(
        {
          success: false,
          message: 'Incorrect password. Please verify and try again.',
        },
        { status: 401 }
      );
    }

    const token = generateToken(user._id);

    return NextResponse.json({
      success: true,
      message: 'Logged in successfully',
      token,
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
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Internal Server Error during login',
      },
      { status: 500 }
    );
  }
}
