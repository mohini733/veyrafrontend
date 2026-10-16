import { NextResponse } from 'next/server';
import { connectDB } from '../../../../../server/db';
import { Conversation } from '../../../../../server/models/Conversation';
import { Message } from '../../../../../server/models/Message';
import { getAuthUserId } from '../../../../../server/auth';

export async function GET(request, { params }) {
  try {
    const currentUserId = getAuthUserId(request);
    if (!currentUserId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId: otherUserId } = await params;
    await connectDB();

    const conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, otherUserId] },
    });

    if (!conversation) {
      return NextResponse.json({
        success: true,
        conversationId: null,
        messages: [],
      });
    }

    const messages = await Message.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 })
      .limit(200);

    // Mark unread messages as read
    await Message.updateMany(
      {
        conversationId: conversation._id,
        recipient: currentUserId,
        status: { $ne: 'read' },
      },
      {
        $set: { status: 'read', readAt: new Date() },
      }
    );

    return NextResponse.json({
      success: true,
      conversationId: conversation._id,
      messages,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
