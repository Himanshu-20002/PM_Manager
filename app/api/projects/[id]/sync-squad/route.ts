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

    console.log('[DEBUG-SYNC] Project ID:', id);
    console.log('[DEBUG-SYNC] User (Admin) ID:', session.id);

    // 1. Find Project
    const project = await Project.findById(id);
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    console.log('[DEBUG-SYNC] Project Members Before:', project.members.length);

    // 2. Find Team owned by this Admin
    const team = await Team.findOne({ owner: session.id });
    if (!team) {
      console.log('[DEBUG-SYNC] !!! No team found for owner:', session.id);
      return NextResponse.json({ error: 'You do not have a team to sync from' }, { status: 404 });
    }
    console.log('[DEBUG-SYNC] Team Members found in Org:', team.members.length);

    // 3. Collect ALL member IDs from the organization
    const teamMemberIds = team.members.map((m: any) => m.user.toString());
    
    // 4. Merge (Unique)
    const existingIds = project.members.map((m: any) => m.toString());
    const mergedIds = Array.from(new Set([...existingIds, ...teamMemberIds, session.id]));

    console.log('[DEBUG-SYNC] Merged Result Size:', mergedIds.length);

    // 5. Update Project
    project.members = mergedIds;
    await project.save();

    // 6. Return populated
    const updatedProject = await Project.findById(id).populate('members', 'name email');
    console.log('[DEBUG-SYNC] Final Populated Count:', updatedProject.members.length);
    
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
