import { NextResponse } from 'next/server';
import { connectDB } from '../../../server/db';
import { Conversation } from '../../../server/models/Conversation';
import { Message } from '../../../server/models/Message';
import { User } from '../../../server/models/User';
import { getAuthUserId } from '../../../server/auth';

export async function POST(request) {
  try {
    const senderId = getAuthUserId(request);
    if (!senderId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { recipientId, text } = await request.json();

    if (!recipientId || !text || !text.trim()) {
      return NextResponse.json(
        { success: false, message: 'Recipient and text are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return NextResponse.json(
        { success: false, message: 'Recipient user not found' },
        { status: 404 }
      );
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, recipientId],
        lastMessageAt: new Date(),
      });
    }

    // Create message
    const message = await Message.create({
      conversationId: conversation._id,
      sender: senderId,
      recipient: recipientId,
      text: text.trim(),
      status: 'sent',
    });

    // Update conversation lastMessage
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    return NextResponse.json(
      {
        success: true,
        message,
        conversationId: conversation._id,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
