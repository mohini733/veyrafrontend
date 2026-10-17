import { NextResponse } from 'next/server';
import { connectDB } from '../../../../../server/db';
import { Message } from '../../../../../server/models/Message';
import { getAuthUserId } from '../../../../../server/auth';

export async function PUT(request, { params }) {
  try {
    const currentUserId = getAuthUserId(request);
    if (!currentUserId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { conversationId } = await params;
    await connectDB();

    const result = await Message.updateMany(
      {
        conversationId,
        recipient: currentUserId,
        status: { $ne: 'read' },
      },
      {
        $set: { status: 'read', readAt: new Date() },
      }
    );

    return NextResponse.json({
      success: true,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('[Veyra Mark Read Error]:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
