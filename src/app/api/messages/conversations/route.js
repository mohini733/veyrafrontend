import { NextResponse } from 'next/server';
import { connectDB } from '../../../../server/db';
import { Conversation } from '../../../../server/models/Conversation';
import { Message } from '../../../../server/models/Message';
import { User } from '../../../../server/models/User';
import { getAuthUserId } from '../../../../server/auth';

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
      .populate('participants', 'name phone avatar online lastSeen')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 });

    const formatted = await Promise.all(
      conversations.map(async (conv) => {
        const otherParticipant = conv.participants.find(
          (p) => p && p._id && p._id.toString() !== userId.toString()
        );

        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          recipient: userId,
          status: { $ne: 'read' },
        });

        return {
          _id: conv._id,
          participant: otherParticipant || null,
          lastMessage: conv.lastMessage || null,
          lastMessageAt: conv.lastMessageAt,
          unreadCount,
        };
      })
    );

    return NextResponse.json({
      success: true,
      conversations: formatted,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
