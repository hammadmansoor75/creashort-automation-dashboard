import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserAgent from '@/models/UserAgent';

export async function GET() {
  try {
    await connectDB();

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get total agents
    const totalAgents = await UserAgent.countDocuments();

    // Get active agents
    const activeAgents = await UserAgent.countDocuments({
      'schedule.active': true
    });

    // Get agents behind schedule (nextGenerationDate is in the past)
    const behindSchedule = await UserAgent.countDocuments({
      'schedule.active': true,
      'schedule.nextGenerationDate': { $lt: now }
    });

    // Get currently processing videos
    const processingVideos = await UserAgent.aggregate([
      {
        $match: {
          'schedule.active': true,
          'schedule.generationHistory.status': 'processing'
        }
      },
      {
        $project: {
          processingCount: {
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
        $group: {
          _id: null,
          totalProcessing: { $sum: '$processingCount' }
        }
      }
    ]);

    // Get videos generated in the last 24 hours
    const videosGeneratedToday = await UserAgent.aggregate([
      {
        $match: {
          'schedule.generationHistory.date': { $gte: oneDayAgo }
        }
      },
      {
        $project: {
          recentVideos: {
            $size: {
              $filter: {
                input: '$schedule.generationHistory',
                cond: { $gte: ['$$this.date', oneDayAgo] }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$recentVideos' }
        }
      }
    ]);

    // Get videos generated in the last week
    const videosGeneratedThisWeek = await UserAgent.aggregate([
      {
        $match: {
          'schedule.generationHistory.date': { $gte: oneWeekAgo }
        }
      },
      {
        $project: {
          recentVideos: {
            $size: {
              $filter: {
                input: '$schedule.generationHistory',
                cond: { $gte: ['$$this.date', oneWeekAgo] }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$recentVideos' }
        }
      }
    ]);

    // Get failed videos count for this week
    const failedVideos = await UserAgent.aggregate([
      {
        $project: {
          failedCount: {
            $size: {
              $filter: {
                input: '$schedule.generationHistory',
                cond: { 
                  $and: [
                    { $eq: ['$$this.status', 'failed'] },
                    { $gte: ['$$this.date', oneWeekAgo] }
                  ]
                }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          totalFailed: { $sum: '$failedCount' }
        }
      }
    ]);

    const overview = {
      totalAgents,
      activeAgents,
      behindSchedule,
      processingVideos: processingVideos[0]?.totalProcessing || 0,
      videosGeneratedToday: videosGeneratedToday[0]?.total || 0,
      videosGeneratedThisWeek: videosGeneratedThisWeek[0]?.total || 0,
      failedVideos: failedVideos[0]?.totalFailed || 0,
    };

    return NextResponse.json(overview);
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard overview' },
      { status: 500 }
    );
  }
}
