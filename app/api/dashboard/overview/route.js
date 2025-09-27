import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserAgent from '@/models/UserAgent';

export async function GET() {
  try {
    await connectDB();

    const now = new Date();
    
    // Get current UTC date boundaries
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0); // Start of today in UTC (12:00 AM)
    
    const todayEnd = new Date();
    todayEnd.setUTCHours(23, 59, 59, 999); // End of today in UTC (11:59:59 PM)
    
    // Get current week boundaries (Monday to Sunday in UTC)
    const weekStart = new Date();
    const dayOfWeek = weekStart.getUTCDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, so adjust
    weekStart.setUTCDate(weekStart.getUTCDate() - daysToMonday);
    weekStart.setUTCHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
    weekEnd.setUTCHours(23, 59, 59, 999);

    // Get total agents
    const totalAgents = await UserAgent.countDocuments();

    // Get active agents
    const activeAgents = await UserAgent.countDocuments({
      'schedule.active': true
    });

    // Get agents behind schedule (nextGenerationDate is more than 60 minutes in the past)
    const gracePeriodEnd = new Date(now.getTime() - 60 * 60 * 1000); // 60 minutes ago
    const behindSchedule = await UserAgent.countDocuments({
      'schedule.active': true,
      'schedule.nextGenerationDate': { $lt: gracePeriodEnd }
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

    // Get videos generated today (UTC calendar day)
    const videosGeneratedToday = await UserAgent.aggregate([
      {
        $match: {
          'schedule.generationHistory.date': { 
            $gte: todayStart,
            $lte: todayEnd
          }
        }
      },
      {
        $project: {
          todayVideos: {
            $size: {
              $filter: {
                input: '$schedule.generationHistory',
                cond: { 
                  $and: [
                    { $gte: ['$$this.date', todayStart] },
                    { $lte: ['$$this.date', todayEnd] }
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
          total: { $sum: '$todayVideos' }
        }
      }
    ]);

    // Get videos generated this week (UTC calendar week - Monday to Sunday)
    const videosGeneratedThisWeek = await UserAgent.aggregate([
      {
        $match: {
          'schedule.generationHistory.date': { 
            $gte: weekStart,
            $lte: weekEnd
          }
        }
      },
      {
        $project: {
          weekVideos: {
            $size: {
              $filter: {
                input: '$schedule.generationHistory',
                cond: { 
                  $and: [
                    { $gte: ['$$this.date', weekStart] },
                    { $lte: ['$$this.date', weekEnd] }
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
          total: { $sum: '$weekVideos' }
        }
      }
    ]);

    // Get failed videos count for this week (UTC calendar week)
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
                    { $gte: ['$$this.date', weekStart] },
                    { $lte: ['$$this.date', weekEnd] }
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

    // Get unique users count
    const uniqueUsers = await UserAgent.distinct('userId');

    const overview = {
      totalAgents,
      activeAgents,
      behindSchedule,
      processingVideos: processingVideos[0]?.totalProcessing || 0,
      videosGeneratedToday: videosGeneratedToday[0]?.total || 0,
      videosGeneratedThisWeek: videosGeneratedThisWeek[0]?.total || 0,
      failedVideos: failedVideos[0]?.totalFailed || 0,
      uniqueUsers: uniqueUsers.length,
      // Date range information for UI display
      dateRanges: {
        today: {
          start: todayStart.toISOString(),
          end: todayEnd.toISOString(),
          label: todayStart.toISOString().split('T')[0] // YYYY-MM-DD format
        },
        thisWeek: {
          start: weekStart.toISOString(),
          end: weekEnd.toISOString(),
          label: `${weekStart.toISOString().split('T')[0]} to ${weekEnd.toISOString().split('T')[0]}`
        }
      }
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
