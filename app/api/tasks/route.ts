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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await dbConnect();
    const body = await req.json();

    const validation = taskSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const project = await Project.findById(validation.data.projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.createdBy.toString() !== session.id?.toString()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (validation.data.assignedTo && validation.data.assignedTo !== "") {
      const isMember = project.members.some(
        (mId: any) => mId.toString() === validation.data.assignedTo
      );
      if (!isMember) {
        return NextResponse.json({ error: 'Invalid assignee' }, { status: 400 });
      }
    }

    const task = await Task.create(validation.data);
    return NextResponse.json(task, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

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
      const ownedProjects = await Project.find({ createdBy: userId }).select('_id');
      const projectIds = ownedProjects.map(p => p._id);

      tasks = await Task.find({ projectId: { $in: projectIds } })
        .populate('assignedTo', 'name email')
        .populate('projectId', 'name')
        .sort({ createdAt: -1 })
        .lean();
    } else {
      tasks = await Task.find({ assignedTo: userId })
        .populate('assignedTo', 'name email')
        .populate('projectId', 'name')
        .sort({ createdAt: -1 })
        .lean();
    }

    return NextResponse.json(tasks);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
