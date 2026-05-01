import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Project from '@/models/Project';
import Task from '@/models/Task';
import User from '@/models/User';
import { getSession } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const project: any = await Project.findById(id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email')
      .lean();

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Authorization checks
    const userId = session.id?.toString();
    const isMember = project.members?.some((m: any) => m._id?.toString() === userId);
    const isAdmin = session.role === 'admin';
    const isCreator = project.createdBy?._id?.toString() === userId;

    if (!isAdmin && !isMember && !isCreator) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch tasks for this project
    const tasks = await Task.find({ projectId: id }).populate('assignedTo', 'name email').lean();

    return NextResponse.json({ project, tasks });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
