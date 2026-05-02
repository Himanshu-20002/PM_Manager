import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';

export async function GET() {
  try {
    const startTime = Date.now();
    await dbConnect();
    const dbStatus = mongoose.connection.readyState === 1 ? 'healthy' : 'unhealthy';
    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      responseTime: `${responseTime}ms`,
      env: process.env.NODE_ENV
    });
  } catch (err: any) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: err.message
    }, { status: 500 });
  }
}
