import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserAgent from '@/models/UserAgent';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'week'; // week, month, year
    const agentId = searchParams.get('agentId');

    let startDate;
    const now = new Date();

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    let matchQuery = {
      'schedule.generationHistory.date': { $gte: startDate }
    };

    if (agentId) {
      matchQuery.agentId = agentId;
    }

    // Get video generation trends by day
    const dailyTrends = await UserAgent.aggregate([
      { $match: matchQuery },
      { $unwind: '$schedule.generationHistory' },
      {
        $match: {
          'schedule.generationHistory.date': { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$schedule.generationHistory.date'
              }
            },
            status: '$schedule.generationHistory.status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          statuses: {
            $push: {
              status: '$_id.status',
              count: '$count'
            }
          }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Get status distribution
    const statusDistribution = await UserAgent.aggregate([
      { $match: matchQuery },
      { $unwind: '$schedule.generationHistory' },
      {
        $match: {
          'schedule.generationHistory.date': { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$schedule.generationHistory.status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get agent performance
    const agentPerformance = await UserAgent.aggregate([
      { $match: agentId ? { agentId } : {} },
      {
        $project: {
          agentName: 1,
          agentRole: 1,
          totalVideos: { $size: '$schedule.generationHistory' },
          publishedVideos: {
            $size: {
              $filter: {
                input: '$schedule.generationHistory',
                cond: { $eq: ['$$this.status', 'published'] }
              }
            }
          },
          failedVideos: {
            $size: {
              $filter: {
                input: '$schedule.generationHistory',
                cond: { $eq: ['$$this.status', 'failed'] }
              }
            }
          },
          processingVideos: {
            $size: {
              $filter: {
                input: '$schedule.generationHistory',
                cond: { $eq: ['$$this.status', 'processing'] }
              }
            }
          }
        }
      },
      {
        $addFields: {
          successRate: {
            $cond: {
              if: { $gt: ['$totalVideos', 0] },
              then: {
                $multiply: [
                  { $divide: ['$publishedVideos', '$totalVideos'] },
                  100
                ]
              },
              else: 0
            }
          }
        }
      },
      { $sort: { successRate: -1 } }
    ]);

    // Get frequency distribution
    const frequencyDistribution = await UserAgent.aggregate([
      {
        $group: {
          _id: '$frequency.intervalDays',
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    return NextResponse.json({
      dailyTrends,
      statusDistribution,
      agentPerformance,
      frequencyDistribution,
      period,
      startDate,
      endDate: now
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
