import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Project from '@/models/Project';
import Task from '@/models/Task';
import { getSession } from '@/lib/auth';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; stageName: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id, stageName } = await params;
    const decodedStageName = decodeURIComponent(stageName);
    
    await dbConnect();

    const project = await Project.findById(id);
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    if (project.createdBy.toString() !== session.id?.toString()) {
      return NextResponse.json({ error: 'Forbidden: You do not own this project' }, { status: 403 });
    }

    // 1. Remove the stage from the project
    project.stages = project.stages.filter((s: any) => s.name !== decodedStageName);
    await project.save();

    // 2. Cascade delete all tasks associated with this stage in this project
    const deleteResult = await Task.deleteMany({ 
      projectId: id, 
      stageName: decodedStageName 
    });

    return NextResponse.json({ 
      message: 'Stage and associated tasks removed successfully', 
      deletedTasksCount: deleteResult.deletedCount,
      stages: project.stages 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
