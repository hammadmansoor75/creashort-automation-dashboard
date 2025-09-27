import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserAgent from '@/models/UserAgent';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all'; // all, upcoming, overdue
    const days = parseInt(searchParams.get('days')) || 7;
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    const now = new Date();
    const gracePeriodEnd = new Date(now.getTime() - 60 * 60 * 1000); // 60 minutes ago
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    let matchQuery = {
      'schedule.active': true
    };

    if (type === 'upcoming') {
      matchQuery['schedule.nextGenerationDate'] = { $gte: now, $lte: futureDate };
    } else if (type === 'overdue') {
      // Use 60-minute grace period for overdue (same as "behind schedule" logic)
      matchQuery['schedule.nextGenerationDate'] = { $lt: gracePeriodEnd };
    } else if (type === 'all') {
      // For 'all', show both overdue and upcoming within the time range
      matchQuery['schedule.nextGenerationDate'] = { $lte: futureDate };
    }

    // Get total count for pagination
    const total = await UserAgent.countDocuments(matchQuery);
    
    // Get paginated agents
    const agents = await UserAgent.find(matchQuery)
      .select('userId agentId agentName agentRole frequency schedule')
      .sort({ 'schedule.nextGenerationDate': 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const scheduleItems = agents.map(agent => {
      // Use 60-minute grace period for overdue calculation (consistent with "behind schedule")
      const isOverdue = agent.schedule.nextGenerationDate < gracePeriodEnd;
      const daysUntilNext = Math.ceil(
        (agent.schedule.nextGenerationDate - now) / (1000 * 60 * 60 * 24)
      );

      return {
        agentId: agent.agentId,
        agentName: agent.agentName,
        agentRole: agent.agentRole,
        userId: agent.userId,
        nextGenerationDate: agent.schedule.nextGenerationDate,
        isOverdue,
        daysUntilNext,
        frequency: agent.frequency,
        lastGeneration: agent.schedule.generationHistory
          .sort((a, b) => new Date(b.date) - new Date(a.date))[0]
      };
    });

    // For summary, we need to get counts from all items (not just paginated)
    const allAgentsForSummary = await UserAgent.find(matchQuery)
      .select('schedule.nextGenerationDate')
      .lean();
    
    const summaryItems = allAgentsForSummary.map(agent => ({
      // Use 60-minute grace period for summary calculation too
      isOverdue: agent.schedule.nextGenerationDate < gracePeriodEnd
    }));

    return NextResponse.json({
      schedule: scheduleItems,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      summary: {
        total: summaryItems.length,
        overdue: summaryItems.filter(item => item.isOverdue).length,
        upcoming: summaryItems.filter(item => !item.isOverdue).length
      }
    });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    );
  }
}
