import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import Project from '@/models/Project';
import '@/models/User';
import { getSession } from '@/lib/auth';
import { taskSchema } from '@/validators/task';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required to create tasks' }, { status: 403 });
    }

    await dbConnect();
    const body = await req.json();

    const validation = taskSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    // Verify project exists
    const project = await Project.findById(validation.data.projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Verify assigned user is a member of the project
    if (validation.data.assignedTo) {
      const isMember = project.members.some(
        (mId: any) => mId.toString() === validation.data.assignedTo
      );
      if (!isMember) {
        return NextResponse.json({ error: 'Assigned user is not a member of this project' }, { status: 400 });
      }
    }

    const task = await Task.create(validation.data);
    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET all tasks for the logged in user (across all projects)
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    let tasks;
    const userId = session.id?.toString();

    if (session.role === 'admin') {
      tasks = await Task.find()
        .populate('assignedTo', 'name email')
        .populate('projectId', 'name')
        .lean();
    } else {
      tasks = await Task.find({ assignedTo: userId })
        .populate('assignedTo', 'name email')
        .populate('projectId', 'name')
        .lean();
    }

    return NextResponse.json(tasks);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
