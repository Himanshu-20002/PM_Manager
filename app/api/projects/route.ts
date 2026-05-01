import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Project from '@/models/Project';
import User from '@/models/User';
import { getSession } from '@/lib/auth';
import { projectSchema } from '@/validators/project';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    let projects;
    const userId = session.id?.toString();

    if (session.role === 'admin') {
      projects = await Project.find()
        .populate('createdBy', 'name email')
        .populate('members', 'name email')
        .lean();
    } else {
      projects = await Project.find({ 
        $or: [
          { members: userId },
          { createdBy: userId }
        ]
      })
      .populate('createdBy', 'name email')
      .populate('members', 'name email')
      .lean();
    }

    return NextResponse.json(projects);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = (await getSession()) as any;
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await dbConnect();
    const body = await req.json();

    const validation = projectSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    // Ensure ID is a valid string
    let userId = session.id?.toString() || '';
    if (session.id?.buffer) {
      userId = Buffer.from(session.id.buffer).toString('hex');
    }

    if (!userId || userId === '[object Object]') {
      return NextResponse.json({ error: 'Auth session invalid' }, { status: 401 });
    }

    // Auto-add all 'joined' members from the Admin's team
    const Team = mongoose.models.Team || (await import('@/models/Team')).default;
    const adminTeam = await Team.findOne({ owner: userId });
    
    let allMembers = [userId];
    if (adminTeam) {
      const joinedMembers = adminTeam.members
        .filter((m: any) => m.status === 'joined')
        .map((m: any) => m.user.toString());
      allMembers = Array.from(new Set([...allMembers, ...joinedMembers]));
    }

    const project = await Project.create({
      ...validation.data,
      createdBy: userId,
      members: allMembers
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    console.error('PROJECT_CREATE_ERROR:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
