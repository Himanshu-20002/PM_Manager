import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Team from '@/models/Team';
import User from '@/models/User';
import { getSession } from '@/lib/auth';

// Add member to team (Admin only)
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await dbConnect();
    const { email } = await req.json();

    const team = await Team.findOne({ owner: session.id });
    if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Check if already in team
    const isMember = team.members.some((m: any) => m.user.toString() === userToAdd._id.toString());
    if (isMember) return NextResponse.json({ error: 'User already in team' }, { status: 400 });

    team.members.push({ user: userToAdd._id, status: 'pending' });
    await team.save();

    return NextResponse.json({ message: 'Invitation sent' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
