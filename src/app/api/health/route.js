import { NextResponse } from 'next/server';
import { connectDB } from '../../../server/db';

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({
      status: 'healthy',
      service: 'Veyra Chat API (Vercel Built-in)',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'degraded',
        service: 'Veyra Chat API (Vercel Built-in)',
        databaseError: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
