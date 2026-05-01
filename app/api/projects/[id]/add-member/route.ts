import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Project from '@/models/Project';
import User from '@/models/User';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

const addMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    
    // Auth check
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    await dbConnect();
    const body = await req.json();

    const validation = addMemberSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { email } = validation.data;

    // 1. Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'User not found in the system' }, { status: 404 });
    }

    // 2. Find project
    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // 3. Check if already a member
    const isAlreadyMember = project.members.some(
      (mId: any) => mId.toString() === user._id.toString()
    );

    if (isAlreadyMember) {
      return NextResponse.json({ error: 'User is already a member of this project' }, { status: 400 });
    }

    // 4. Add member
    project.members.push(user._id);
    await project.save();

    return NextResponse.json({ message: 'Member added successfully' });
  } catch (error: any) {
    console.error('ADD_MEMBER_ERROR:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
