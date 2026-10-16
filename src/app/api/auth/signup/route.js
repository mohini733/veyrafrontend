import { NextResponse } from 'next/server';
import { connectDB } from '../../../../server/db';
import { User } from '../../../../server/models/User';
import { generateToken } from '../../../../server/auth';
import {
  normalizePhoneNumber,
  isValidInternationalPhone,
} from '../../../../server/smsProvider';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, phone, password, about, avatar } = body;

    if (!name || !phone || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Name, phone number, and password are required',
        },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhoneNumber(phone);
    if (!isValidInternationalPhone(normalizedPhone)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid international phone format. Example: +919876543210',
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: 'Password must be at least 6 characters long',
        },
        { status: 400 }
      );
    }

    const userExists = await User.findOne({ phone: normalizedPhone });
    if (userExists) {
      return NextResponse.json(
        {
          success: false,
          message: 'A user with this phone number is already registered in Veyra Chat',
        },
        { status: 400 }
      );
    }

    const defaultAvatar =
      avatar ||
      `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(normalizedPhone)}`;

    const user = await User.create({
      name: name.trim(),
      phone: normalizedPhone,
      password,
      about: about ? about.trim() : 'Hey there! I am using Veyra Chat.',
      avatar: defaultAvatar,
      isPhoneVerified: false,
    });

    const token = generateToken(user._id);

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
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
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Internal Server Error during registration',
      },
      { status: 500 }
    );
  }
}
