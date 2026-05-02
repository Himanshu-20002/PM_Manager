import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Project from '@/models/Project';
import Team from '@/models/Team';
import { getSession } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;

    // 1. Find Project and check ownership
    const project = await Project.findById(id);
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    if (project.createdBy.toString() !== session.id?.toString()) {
      return NextResponse.json({ error: 'Forbidden: You do not own this project' }, { status: 403 });
    }

    // 2. Find Team owned by this Admin
    const team = await Team.findOne({ owner: session.id });
    if (!team) {
      return NextResponse.json({ error: 'You do not have a team to sync from' }, { status: 404 });
    }

    // 3. Collect ALL member IDs from the organization
    const teamMemberIds = team.members.map((m: any) => m.user.toString());
    
    // 4. Merge (Unique)
    const existingIds = project.members.map((m: any) => m.toString());
    const mergedIds = Array.from(new Set([...existingIds, ...teamMemberIds, session.id]));

    // 5. Update Project
    project.members = mergedIds;
    await project.save();

    // 6. Return populated
    const updatedProject = await Project.findById(id).populate('members', 'name email');
    
    return NextResponse.json({ 
      message: 'Team synchronized', 
      count: updatedProject.members.length,
      members: updatedProject.members 
    });
  } catch (error: any) {
    console.error('[SYNC ERROR]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
