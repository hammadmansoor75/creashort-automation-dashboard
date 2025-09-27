import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserAgent from '@/models/UserAgent';

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { agentId } = await params;

    const agent = await UserAgent.findOne({ agentId })
      .lean();

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Add computed fields
    const now = new Date();
    const gracePeriodEnd = new Date(now.getTime() - 60 * 60 * 1000); // 60 minutes ago
    const isBehindSchedule = agent.schedule.active && 
      agent.schedule.nextGenerationDate < gracePeriodEnd;

    const processingCount = agent.schedule.generationHistory.filter(
      gen => gen.status === 'processing'
    ).length;

    const completedCount = agent.schedule.generationHistory.filter(
      gen => gen.status === 'completed' || gen.status === 'completed and posted'
    ).length;

    const failedCount = agent.schedule.generationHistory.filter(
      gen => gen.status === 'failed'
    ).length;

    const lastGeneration = agent.schedule.generationHistory
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

    const totalGenerations = agent.schedule.generationHistory.length;
    const successfulGenerations = agent.schedule.generationHistory.filter(
      gen => gen.status === 'completed' || gen.status === 'completed and posted' || gen.status === 'success'
    ).length;

    const agentDetails = {
      ...agent,
      isBehindSchedule,
      processingCount,
      completedCount,
      failedCount,
      totalGenerations,
      successfulGenerations,
      failedGenerations: failedCount,
      lastGeneration: lastGeneration ? {
        date: lastGeneration.date,
        status: lastGeneration.status,
        videoUrl: lastGeneration.videoUrl,
        scriptId: lastGeneration.scriptId,
        videoId: lastGeneration.videoId,
        generationId: lastGeneration.generationId,
        error: lastGeneration.error
      } : null,
      // Get all generations (sorted by date, newest first)
      recentGenerations: agent.schedule.generationHistory
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(gen => ({
          date: gen.date,
          status: gen.status,
          videoUrl: gen.videoUrl,
          script: gen.script,
          processingStartedAt: gen.processingStartedAt,
          completedAt: gen.completedAt,
          generationId: gen.generationId,
          error: gen.error
        })),
      // Get upcoming scheduled scripts
      upcomingScripts: agent.schedule.scheduledScripts
        .filter(script => !script.used)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5)
    };

    return NextResponse.json(agentDetails);
  } catch (error) {
    console.error('Error fetching agent details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent details' },
      { status: 500 }
    );
  }
}
