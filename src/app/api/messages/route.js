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

    const { conversationId, recipientId, text, image } = await request.json();

    const hasText = text && text.trim().length > 0;
    const hasImage = Boolean(image);

    if (!hasText && !hasImage) {
      return NextResponse.json(
        { success: false, message: 'Message text or image is required' },
        { status: 400 }
      );
    }

    await connectDB();

    let targetConversation = null;
    let targetRecipientId = recipientId;

    if (conversationId) {
      targetConversation = await Conversation.findById(conversationId);
      if (!targetConversation) {
        return NextResponse.json(
          { success: false, message: 'Conversation not found' },
          { status: 404 }
        );
      }

      const isParticipant = targetConversation.participants.some(
        (p) => p && p.toString() === senderId.toString()
      );
      if (!isParticipant) {
        return NextResponse.json(
          { success: false, message: 'Forbidden: You are not in this conversation' },
          { status: 403 }
        );
      }

      if (!targetRecipientId) {
        const otherP = targetConversation.participants.find(
          (p) => p && p.toString() !== senderId.toString()
        );
        targetRecipientId = otherP ? otherP.toString() : null;
      }
    } else if (targetRecipientId) {
      targetConversation = await Conversation.findOne({
        participants: { $all: [senderId, targetRecipientId], $size: 2 },
      });

      if (!targetConversation) {
        targetConversation = await Conversation.create({
          participants: [senderId, targetRecipientId],
          lastMessageAt: new Date(),
        });
      }
    } else {
      return NextResponse.json(
        { success: false, message: 'Either conversationId or recipientId is required' },
        { status: 400 }
      );
    }

    // Create the message
    const message = await Message.create({
      conversationId: targetConversation._id,
      sender: senderId,
      recipient: targetRecipientId,
      text: (text || '').trim(),
      image: image || null,
      mediaType: hasImage ? 'image' : 'text',
      status: 'sent',
    });

    // Update conversation metadata
    targetConversation.lastMessage = message._id;
    targetConversation.lastMessageAt = new Date();
    await targetConversation.save();

    const populated = await Message.findById(message._id)
      .populate('sender', '_id name avatar')
      .populate('recipient', '_id name avatar');

    return NextResponse.json(
      {
        success: true,
        message: populated,
        conversationId: targetConversation._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Veyra Send Message Error]:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
