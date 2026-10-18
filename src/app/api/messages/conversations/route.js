import { NextResponse } from 'next/server';
import { connectDB } from '../../../../server/db';
import { Conversation } from '../../../../server/models/Conversation';
import { Message } from '../../../../server/models/Message';
import { User } from '../../../../server/models/User';
import { getAuthUserId } from '../../../../server/auth';

/**
 * GET /api/messages/conversations
 * Get all conversations for currently logged-in user
 */
export async function GET(request) {
  try {
    const userId = getAuthUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate('participants', '_id name phone avatar about online lastSeen isPhoneVerified')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 });

    const formatted = await Promise.all(
      conversations.map(async (conv) => {
        const otherParticipant = conv.participants.find(
          (p) => p && p._id && p._id.toString() !== userId.toString()
        );

        let lastMessage = conv.lastMessage || null;
        if (!lastMessage) {
          lastMessage = await Message.findOne({ conversationId: conv._id })
            .sort({ createdAt: -1 })
            .select('_id text sender recipient status createdAt');
        }

        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          recipient: userId,
          status: { $ne: 'read' },
        });

        return {
          _id: conv._id,
          participants: conv.participants,
          participant: otherParticipant || null,
          lastMessage,
          lastMessageAt: conv.lastMessageAt || lastMessage?.createdAt || conv.updatedAt,
          unreadCount,
        };
      })
    );

    return NextResponse.json({
      success: true,
      conversations: formatted,
    });
  } catch (error) {
    console.error('[Veyra Get Conversations Error]:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/messages/conversations
 * Start a new conversation or return existing conversation with recipientId
 */
export async function POST(request) {
  try {
    const currentUserId = getAuthUserId(request);
    if (!currentUserId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { recipientId } = await request.json();
    if (!recipientId) {
      return NextResponse.json(
        { success: false, message: 'Recipient ID is required' },
        { status: 400 }
      );
    }

    if (recipientId.toString() === currentUserId.toString()) {
      return NextResponse.json(
        { success: false, message: 'You cannot start a conversation with yourself' },
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

    // Look for existing conversation between these 2 users
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, recipientId], $size: 2 },
    })
      .populate('participants', '_id name phone avatar about online lastSeen isPhoneVerified')
      .populate('lastMessage');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [currentUserId, recipientId],
        lastMessageAt: new Date(),
      });

      conversation = await Conversation.findById(conversation._id).populate(
        'participants',
        '_id name phone avatar about online lastSeen isPhoneVerified'
      );
    }

    return NextResponse.json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error('[Veyra Create Conversation Error]:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Could not start conversation' },
      { status: 500 }
    );
  }
}
