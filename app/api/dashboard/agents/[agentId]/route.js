import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserAgent from '@/models/UserAgent';

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { agentId } = params;

    const agent = await UserAgent.findOne({ agentId })
      .select('userId agentId agentName agentRole promptTemplate originalPromptTemplate customInstructions voiceId fontStyle textColor selectedSocialMediaAccount language frequency schedule createdAt updatedAt')
      .lean();

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Add computed fields
    const now = new Date();
    const isBehindSchedule = agent.schedule.active && 
      agent.schedule.nextGenerationDate < now;

    const processingCount = agent.schedule.generationHistory.filter(
      gen => gen.status === 'processing'
    ).length;

    const publishedCount = agent.schedule.generationHistory.filter(
      gen => gen.status === 'published'
    ).length;

    const failedCount = agent.schedule.generationHistory.filter(
      gen => gen.status === 'failed'
    ).length;

    const lastGeneration = agent.schedule.generationHistory
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

    const agentDetails = {
      ...agent,
      isBehindSchedule,
      processingCount,
      publishedCount,
      failedCount,
      lastGeneration: lastGeneration ? {
        date: lastGeneration.date,
        status: lastGeneration.status,
        videoUrl: lastGeneration.videoUrl,
        scriptId: lastGeneration.scriptId,
        videoId: lastGeneration.videoId,
        error: lastGeneration.error
      } : null,
      // Get all generations (sorted by date, newest first)
      recentGenerations: agent.schedule.generationHistory
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
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
