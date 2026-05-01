import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Project from '@/models/Project';
import Task from '@/models/Task';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();

    const user = await User.findById(session.id).select('-password').lean();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Calculate Stats efficiently using counts
    const [completedTasks, totalTasks, totalProjects] = await Promise.all([
      Task.countDocuments({ assignedTo: session.id, status: 'done' }),
      Task.countDocuments({ assignedTo: session.id }),
      Project.countDocuments({
        $or: [
          { createdBy: session.id },
          { members: session.id }
        ]
      })
    ]);
    
    // XP Calculation: 100 XP per completed task
    const xp = completedTasks * 100;
    const level = Math.floor(xp / 500) + 1;
    const nextLevelXp = level * 500;

    return NextResponse.json({
      user,
      stats: {
        totalTasks,
        completedTasks,
        totalProjects: totalProjects,
        xp,
        level,
        nextLevelXp,
        joinedDate: user.createdAt
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
