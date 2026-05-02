import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Project from '@/models/Project';
import Task from '@/models/Task';
import '@/models/User';
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
    const isCreator = project.createdBy?._id?.toString() === userId;

    if (!isMember && !isCreator) {
      return NextResponse.json({ error: 'Forbidden: You do not have access to this project' }, { status: 403 });
    }

    // Fetch tasks for this project
    const tasks = await Task.find({ projectId: id }).populate('assignedTo', 'name email').lean();

    return NextResponse.json({ project, tasks });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Verify ownership before deletion
    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.createdBy.toString() !== session.id?.toString()) {
      return NextResponse.json({ error: 'Forbidden: Only the project creator can delete this project' }, { status: 403 });
    }

    // Remove tasks belonging to project
    await Task.deleteMany({ projectId: id });
    // Remove the project
    const deleted = await Project.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Project deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
