import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Project from '@/models/Project';
import { getSession } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const { name, color } = await req.json();

    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    await dbConnect();
    const project = await Project.findById(id);
    
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    if (project.createdBy.toString() !== session.id?.toString()) {
      return NextResponse.json({ error: 'Forbidden: You do not own this project' }, { status: 403 });
    }
    
    // Add new stage
    const nextOrder = project.stages.length + 1;
    project.stages.push({ name, color: color || '#6366f1', order: nextOrder });
    
    await project.save();
    return NextResponse.json(project.stages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
