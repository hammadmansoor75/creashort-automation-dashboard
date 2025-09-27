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
      const gracePeriodEnd = new Date(now.getTime() - 60 * 60 * 1000); // 60 minutes ago
      matchQuery = {
        'schedule.active': true,
        'schedule.nextGenerationDate': { $lt: gracePeriodEnd }
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
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Add computed fields for each agent
    const gracePeriodEnd = new Date(now.getTime() - 60 * 60 * 1000); // 60 minutes ago
    const agentsWithStats = agents.map(agent => {
      const isBehindSchedule = agent.schedule.active && 
        agent.schedule.nextGenerationDate < gracePeriodEnd;

      const totalGenerations = agent.schedule?.generationHistory?.length || 0;
      
      const processingCount = agent.schedule?.generationHistory?.filter(
        gen => gen.status === 'processing'
      ).length || 0;

      const completedCount = agent.schedule?.generationHistory?.filter(
        gen => gen.status === 'completed' || gen.status === 'completed and posted'
      ).length || 0;

      const failedCount = agent.schedule?.generationHistory?.filter(
        gen => gen.status === 'failed'
      ).length || 0;

      const lastGeneration = agent.schedule?.generationHistory?.length > 0 
        ? agent.schedule.generationHistory.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
        : null;

      return {
        ...agent,
        isBehindSchedule,
        totalGenerations,
        processingCount,
        completedCount,
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
