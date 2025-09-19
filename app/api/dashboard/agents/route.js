import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserAgent from '@/models/UserAgent';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search');

    const now = new Date();
    let matchQuery = {};

    // Filter by status
    if (status === 'active') {
      matchQuery = {
        'schedule.active': true
      };
    } else if (status === 'paused') {
      matchQuery = {
        'schedule.active': false
      };
    } else if (status === 'behind-schedule') {
      matchQuery = {
        'schedule.active': true,
        'schedule.nextGenerationDate': { $lt: now }
      };
    } else if (status === 'processing') {
      matchQuery = {
        'schedule.generationHistory.status': 'processing'
      };
    }

    // Add search functionality
    if (search) {
      matchQuery.$or = [
        { agentName: { $regex: search, $options: 'i' } },
        { agentRole: { $regex: search, $options: 'i' } },
        { userId: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const agents = await UserAgent.find(matchQuery)
      .select('userId agentId agentName agentRole frequency schedule createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Add computed fields for each agent
    const agentsWithStats = agents.map(agent => {
      const isBehindSchedule = agent.schedule.active && 
        agent.schedule.nextGenerationDate < now && 
        (!agent.schedule.pausedUntil || agent.schedule.pausedUntil <= now);

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

      return {
        ...agent,
        isBehindSchedule,
        processingCount,
        publishedCount,
        failedCount,
        lastGeneration: lastGeneration ? {
          date: lastGeneration.date,
          status: lastGeneration.status,
          videoUrl: lastGeneration.videoUrl
        } : null
      };
    });

    const total = await UserAgent.countDocuments(matchQuery);

    return NextResponse.json({
      agents: agentsWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}
