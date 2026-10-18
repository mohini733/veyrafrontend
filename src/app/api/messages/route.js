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

/**
 * DELETE /api/messages?messageId=xxx
 * Delete an individual message
 */
export async function DELETE(request) {
  try {
    const currentUserId = getAuthUserId(request);
    if (!currentUserId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');

    if (!messageId) {
      return NextResponse.json(
        { success: false, message: 'Message ID is required' },
        { status: 400 }
      );
    }

    await connectDB();
    const msg = await Message.findById(messageId);
    if (!msg) {
      return NextResponse.json(
        { success: false, message: 'Message not found' },
        { status: 404 }
      );
    }

    // Sender or recipient can delete
    const isParticipant =
      msg.sender.toString() === currentUserId.toString() ||
      msg.recipient?.toString() === currentUserId.toString();

    if (!isParticipant) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: You cannot delete this message' },
        { status: 403 }
      );
    }

    await Message.findByIdAndDelete(messageId);

    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully',
      deletedId: messageId,
    });
  } catch (error) {
    console.error('[Veyra Delete Message Error]:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
