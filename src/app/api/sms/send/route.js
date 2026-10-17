import { NextResponse } from 'next/server';
import { connectDB } from '@/server/db';
import { getAuthUserId } from '@/server/auth';
import { User } from '@/server/models/User';
import { SmsLog } from '@/server/models/SmsLog';
import {
  normalizePhoneNumber,
  isValidInternationalPhone,
  sendExternalSMS,
} from '@/server/smsProvider';

export async function POST(request) {
  try {
    const userId = getAuthUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Authentication required to dispatch external SMS.' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { toPhone, messageText } = body;

    if (!toPhone || !toPhone.toString().trim()) {
      return NextResponse.json(
        { success: false, message: 'Recipient phone number is required.' },
        { status: 400 }
      );
    }

    if (!messageText || !messageText.toString().trim()) {
      return NextResponse.json(
        { success: false, message: 'SMS message body cannot be empty.' },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhoneNumber(toPhone);
    if (!isValidInternationalPhone(normalizedPhone)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid phone format. Please enter a valid 10-digit mobile or international phone number.',
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Fetch sender user information
    const senderUser = await User.findById(userId).select('name phone').lean();

    // Check if recipient is already registered on Veyra Chat
    const raw10Digits = normalizedPhone.slice(-10);
    const registeredUser = await User.findOne({
      $or: [
        { phone: normalizedPhone },
        { phone: raw10Digits },
        { phone: `+91${raw10Digits}` },
      ],
    }).select('_id name phone avatar').lean();

    // Dispatch external SMS via carrier provider
    const result = await sendExternalSMS({
      toPhone: normalizedPhone,
      messageText: messageText.toString().trim(),
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          configured: result.configured,
          message: result.error || 'Failed to dispatch SMS.',
          advice: result.advice,
          isRegisteredOnVeyra: Boolean(registeredUser),
          registeredUser: registeredUser || null,
        },
        { status: 400 }
      );
    }

    // Record in database SMS logs
    let savedLog = null;
    try {
      savedLog = await SmsLog.create({
        sender: userId,
        senderName: senderUser?.name || 'Veyra User',
        toPhone: normalizedPhone,
        messageText: messageText.toString().trim(),
        provider: result.provider || 'Fast2SMS',
        status: result.simulated ? 'queued' : 'dispatched',
        requestId: result.requestId || '',
        carrierNotice: result.carrierNotice || '',
        isRegisteredOnVeyra: Boolean(registeredUser),
      });
    } catch (logErr) {
      console.warn('[Veyra SMS Log] Could not save SMS log to DB:', logErr.message);
    }

    return NextResponse.json({
      success: true,
      configured: true,
      message: 'SMS submitted to carrier provider gateway',
      details: {
        ...result,
        logId: savedLog?._id || null,
      },
      isRegisteredOnVeyra: Boolean(registeredUser),
      registeredUser: registeredUser || null,
    });
  } catch (error) {
    console.error('[Veyra API SMS Send] Exception:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
