import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserAgent from '@/models/UserAgent';

export async function DELETE() {
  try {
    await connectDB();

    // Remove all failed generation history entries from all agents
    const result = await UserAgent.updateMany(
      {},
      {
        $pull: {
          'schedule.generationHistory': { status: 'failed' }
        }
      }
    );

    // Get updated counts for response
    const totalAgents = await UserAgent.countDocuments();
    const activeAgents = await UserAgent.countDocuments({
      'schedule.active': true
    });

    return NextResponse.json({
      success: true,
      message: 'Failed generation history cleaned up successfully',
      modifiedAgents: result.modifiedCount,
      totalAgents,
      activeAgents
    });
  } catch (error) {
    console.error('Error cleaning up failed generations:', error);
    return NextResponse.json(
      { error: 'Failed to clean up failed generations' },
      { status: 500 }
    );
  }
}
