import { NextResponse } from 'next/server';
import { connectDB } from '../../../../server/db';
import { Conversation } from '../../../../server/models/Conversation';
import { Message } from '../../../../server/models/Message';
import { getAuthUserId } from '../../../../server/auth';

export async function GET(request, { params }) {
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

    const conversation = await Conversation.findById(conversationId).populate(
      'participants',
      '_id name phone avatar about online lastSeen isPhoneVerified'
    );

    if (!conversation) {
      return NextResponse.json(
        { success: false, message: 'Conversation not found' },
        { status: 404 }
      );
    }

    const isParticipant = conversation.participants.some(
      (p) => p && p._id && p._id.toString() === currentUserId.toString()
    );

    if (!isParticipant) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: You are not a participant in this conversation' },
        { status: 403 }
      );
    }

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .limit(200)
      .populate('sender', '_id name avatar')
      .populate('recipient', '_id name avatar');

    // Mark unread messages as read
    await Message.updateMany(
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
      count: messages.length,
      conversation,
      messages,
    });
  } catch (error) {
    console.error('[Veyra Get Conversation Messages Error]:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/messages/[conversationId]
 * Delete entire conversation and its messages
 */
export async function DELETE(request, { params }) {
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

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return NextResponse.json(
        { success: false, message: 'Conversation not found' },
        { status: 404 }
      );
    }

    const isParticipant = conversation.participants.some(
      (p) => p && p.toString() === currentUserId.toString()
    );

    if (!isParticipant) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: You are not a participant in this conversation' },
        { status: 403 }
      );
    }

    // Delete all messages belonging to this conversation
    await Message.deleteMany({ conversationId });

    // Delete the conversation document
    await Conversation.findByIdAndDelete(conversationId);

    return NextResponse.json({
      success: true,
      message: 'Conversation and all messages deleted successfully',
    });
  } catch (error) {
    console.error('[Veyra Delete Conversation Error]:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete conversation' },
      { status: 500 }
    );
  }
}
