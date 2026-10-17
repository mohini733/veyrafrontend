import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/server/auth';
import { getProviderStatus } from '@/server/smsProvider';

export async function POST(request) {
  try {
    const userId = getAuthUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { provider, fast2smsApiKey, msg91AuthKey, msg91FlowId, msg91SenderId } = body;

    if (provider === 'fast2sms' && fast2smsApiKey) {
      process.env.FAST2SMS_API_KEY = fast2smsApiKey.trim();
    } else if (provider === 'msg91' && msg91AuthKey) {
      process.env.MSG91_AUTH_KEY = msg91AuthKey.trim();
      if (msg91FlowId) process.env.MSG91_FLOW_ID = msg91FlowId.trim();
      if (msg91SenderId) process.env.MSG91_SENDER_ID = msg91SenderId.trim();
    }

    const status = getProviderStatus();
    return NextResponse.json({
      success: true,
      message: `SMS Gateway updated: ${status.provider} is active.`,
      status,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
