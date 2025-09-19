import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserAgent from '@/models/UserAgent';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all'; // all, upcoming, overdue
    const days = parseInt(searchParams.get('days')) || 7;

    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    let matchQuery = {
      'schedule.active': true,
      'schedule.pausedUntil': { $lte: now }
    };

    if (type === 'upcoming') {
      matchQuery['schedule.nextGenerationDate'] = { $gte: now, $lte: futureDate };
    } else if (type === 'overdue') {
      matchQuery['schedule.nextGenerationDate'] = { $lt: now };
    }

    const agents = await UserAgent.find(matchQuery)
      .select('userId agentId agentName agentRole frequency schedule')
      .sort({ 'schedule.nextGenerationDate': 1 })
      .lean();

    const scheduleItems = agents.map(agent => {
      const isOverdue = agent.schedule.nextGenerationDate < now;
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

    return NextResponse.json({
      schedule: scheduleItems,
      summary: {
        total: scheduleItems.length,
        overdue: scheduleItems.filter(item => item.isOverdue).length,
        upcoming: scheduleItems.filter(item => !item.isOverdue).length
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
