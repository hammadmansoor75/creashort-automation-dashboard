import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserAgent from '@/models/UserAgent';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userIdSearch = searchParams.get('userId');
    const customInstructionsSearch = searchParams.get('customInstructions');
    const duplicatesOnly = searchParams.get('duplicatesOnly') === 'true';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const skip = (page - 1) * limit;

    // Build aggregation pipeline
    const pipeline = [];

    // Stage 1: Match documents based on search (if provided)
    const matchConditions = {};
    
    // Search by userId
    if (userIdSearch && userIdSearch.trim()) {
      const trimmedSearch = userIdSearch.trim();
      const escapedSearch = trimmedSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      matchConditions.userId = { $regex: escapedSearch, $options: 'i' };
    }
    
    // Search by custom instructions
    if (customInstructionsSearch && customInstructionsSearch.trim()) {
      const trimmedSearch = customInstructionsSearch.trim();
      const escapedSearch = trimmedSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      matchConditions.customInstructions = { $regex: escapedSearch, $options: 'i' };
    }
    
    // When duplicatesOnly is true, only include active agents
    if (duplicatesOnly) {
      matchConditions['schedule.active'] = true;
    }
    
    // Apply match if any search conditions exist
    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({
        $match: matchConditions
      });
    }

    // Stage 2: Calculate completed videos count for each agent
    pipeline.push({
      $addFields: {
        completedVideos: {
          $size: {
            $filter: {
              input: { $ifNull: ['$schedule.generationHistory', []] },
              cond: {
                $in: [
                  '$$this.status',
                  ['completed', 'completed and posted', 'success', 'published']
                ]
              }
            }
          }
        },
        totalVideos: { $ifNull: ['$frequency.monthlyVideos', 0] }
      }
    });

    // Stage 3: Calculate remaining videos
    pipeline.push({
      $addFields: {
        remainingVideos: {
          $max: [
            0,
            {
              $subtract: [
                { $ifNull: ['$frequency.monthlyVideos', 0] },
                '$completedVideos'
              ]
            }
          ]
        }
      }
    });

    // Stage 4: Group by userId and collect all agents
    pipeline.push({
      $group: {
        _id: '$userId',
        agents: {
          $push: {
            agentId: '$agentId',
            agentName: '$agentName',
            agentRole: '$agentRole',
            customInstructions: '$customInstructions',
            language: '$language',
            frequency: '$frequency',
            schedule: '$schedule',
            completedVideos: '$completedVideos',
            remainingVideos: '$remainingVideos',
            totalVideos: '$totalVideos',
            voiceId: '$voiceId',
            fontStyle: '$fontStyle',
            textColor: '$textColor',
            selectedSocialMediaAccount: '$selectedSocialMediaAccount',
            createdAt: '$createdAt',
            updatedAt: '$updatedAt'
          }
        }
      }
    });

    // Stage 5: Detect duplicate custom instructions within the same user (case-sensitive)
    // Exclude empty/null custom instructions from duplicate detection
    // Also match agents created within 1 minute of each other
    pipeline.push({
      $addFields: {
        agents: {
          $map: {
            input: '$agents',
            as: 'agent',
            in: {
              $let: {
                vars: {
                  agentInstructions: { $ifNull: ['$$agent.customInstructions', ''] },
                  agentCreatedAt: '$$agent.createdAt',
                  hasNonEmptyInstructions: {
                    $and: [
                      { $ne: ['$$agent.customInstructions', null] },
                      { $ne: [{ $trim: { input: { $ifNull: ['$$agent.customInstructions', ''] } } }, ''] }
                    ]
                  }
                },
                in: {
                  $mergeObjects: [
                    '$$agent',
                    {
                      hasDuplicateCustomInstructions: {
                        $cond: [
                          '$$hasNonEmptyInstructions',
                          {
                            $gt: [
                              {
                                $size: {
                                  $filter: {
                                    input: '$agents',
                                    as: 'otherAgent',
                                    cond: {
                                      $and: [
                                        { $ne: ['$$agent.agentId', '$$otherAgent.agentId'] },
                                        { $ne: ['$$otherAgent.customInstructions', null] },
                                        { $ne: [{ $trim: { input: { $ifNull: ['$$otherAgent.customInstructions', ''] } } }, ''] },
                                        {
                                          $eq: [
                                            '$$agentInstructions',
                                            { $ifNull: ['$$otherAgent.customInstructions', ''] }
                                          ]
                                        },
                                        {
                                          $and: [
                                            { $ne: ['$$agentCreatedAt', null] },
                                            { $ne: ['$$otherAgent.createdAt', null] },
                                            {
                                              $lte: [
                                                {
                                                  $abs: {
                                                    $subtract: [
                                                      '$$agentCreatedAt',
                                                      '$$otherAgent.createdAt'
                                                    ]
                                                  }
                                                },
                                                60000 // 1 minute in milliseconds
                                              ]
                                            }
                                          ]
                                        },
                                        {
                                          $and: [
                                            { $ne: ['$$agent.frequency', null] },
                                            { $ne: ['$$otherAgent.frequency', null] },
                                            {
                                              $eq: [
                                                { $ifNull: ['$$agent.frequency.plan', ''] },
                                                { $ifNull: ['$$otherAgent.frequency.plan', ''] }
                                              ]
                                            },
                                            {
                                              $eq: [
                                                { $ifNull: ['$$agent.frequency.intervalDays', 0] },
                                                { $ifNull: ['$$otherAgent.frequency.intervalDays', 0] }
                                              ]
                                            },
                                            {
                                              $eq: [
                                                { $ifNull: ['$$agent.frequency.monthlyVideos', 0] },
                                                { $ifNull: ['$$otherAgent.frequency.monthlyVideos', 0] }
                                              ]
                                            },
                                            {
                                              $eq: [
                                                { $ifNull: ['$$agent.frequency.credits', 0] },
                                                { $ifNull: ['$$otherAgent.frequency.credits', 0] }
                                              ]
                                            }
                                          ]
                                        }
                                      ]
                                    }
                                  }
                                }
                              },
                              0
                            ]
                          },
                          false
                        ]
                      },
                      duplicateCount: {
                        $cond: [
                          '$$hasNonEmptyInstructions',
                          {
                            $size: {
                              $filter: {
                                input: '$agents',
                                as: 'otherAgent',
                                cond: {
                                  $and: [
                                    { $ne: ['$$otherAgent.customInstructions', null] },
                                    { $ne: [{ $trim: { input: { $ifNull: ['$$otherAgent.customInstructions', ''] } } }, ''] },
                                    {
                                      $eq: [
                                        '$$agentInstructions',
                                        { $ifNull: ['$$otherAgent.customInstructions', ''] }
                                      ]
                                    },
                                    {
                                      $and: [
                                        { $ne: ['$$agentCreatedAt', null] },
                                        { $ne: ['$$otherAgent.createdAt', null] },
                                        {
                                          $lte: [
                                            {
                                              $abs: {
                                                $subtract: [
                                                  '$$agentCreatedAt',
                                                  '$$otherAgent.createdAt'
                                                ]
                                              }
                                            },
                                            60000 // 1 minute in milliseconds
                                          ]
                                        }
                                      ]
                                    },
                                    {
                                      $and: [
                                        { $ne: ['$$agent.frequency', null] },
                                        { $ne: ['$$otherAgent.frequency', null] },
                                        {
                                          $eq: [
                                            { $ifNull: ['$$agent.frequency.plan', ''] },
                                            { $ifNull: ['$$otherAgent.frequency.plan', ''] }
                                          ]
                                        },
                                        {
                                          $eq: [
                                            { $ifNull: ['$$agent.frequency.intervalDays', 0] },
                                            { $ifNull: ['$$otherAgent.frequency.intervalDays', 0] }
                                          ]
                                        },
                                        {
                                          $eq: [
                                            { $ifNull: ['$$agent.frequency.monthlyVideos', 0] },
                                            { $ifNull: ['$$otherAgent.frequency.monthlyVideos', 0] }
                                          ]
                                        },
                                        {
                                          $eq: [
                                            { $ifNull: ['$$agent.frequency.credits', 0] },
                                            { $ifNull: ['$$otherAgent.frequency.credits', 0] }
                                          ]
                                        }
                                      ]
                                    }
                                  ]
                                }
                              }
                            }
                          },
                          0
                        ]
                      }
                    }
                  ]
                }
              }
            }
          }
        }
      }
    });

    // Stage 6: Add field to indicate if user has duplicates
    pipeline.push({
      $addFields: {
        hasDuplicates: {
          $anyElementTrue: {
            $map: {
              input: '$agents',
              as: 'agent',
              in: { $ifNull: ['$$agent.hasDuplicateCustomInstructions', false] }
            }
          }
        }
      }
    });

    // Stage 7: Filter to only users with duplicates if duplicatesOnly is true
    if (duplicatesOnly) {
      pipeline.push({
        $match: {
          hasDuplicates: true
        }
      });
      
      // Filter agents to only show duplicated ones
      pipeline.push({
        $addFields: {
          agents: {
            $filter: {
              input: '$agents',
              as: 'agent',
              cond: { $eq: ['$$agent.hasDuplicateCustomInstructions', true] }
            }
          }
        }
      });
    }

    // Stage 8: Project to format the output
    pipeline.push({
      $project: {
        _id: 0,
        userId: '$_id',
        agents: 1
      }
    });

    // Stage 9: Sort by userId in descending order
    pipeline.push({
      $sort: { userId: -1 }
    });

    // Stage 10: Get total count before pagination (using facet)
    const countPipeline = [...pipeline];
    countPipeline.push({
      $count: 'total'
    });

    // Stage 11: Apply pagination
    pipeline.push(
      { $skip: skip },
      { $limit: limit }
    );

    // Execute both pipelines in parallel
    const [usersResult, countResult] = await Promise.all([
      UserAgent.aggregate(pipeline),
      UserAgent.aggregate(countPipeline)
    ]);

    const totalUsers = countResult[0]?.total || 0;

    return NextResponse.json({
      users: usersResult,
      pagination: {
        page,
        limit,
        total: totalUsers,
        pages: Math.ceil(totalUsers / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users and agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users and agents' },
      { status: 500 }
    );
  }
}

