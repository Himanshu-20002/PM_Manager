import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Team from '@/models/Team';
import { getSession } from '@/lib/auth';

// Accept team invitation
export async function PATCH() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    
    const team = await Team.findOne({ 'members.user': session.id });
    if (!team) return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });

    const memberIndex = team.members.findIndex((m: any) => m.user.toString() === session.id);
    if (memberIndex === -1) return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });

    team.members[memberIndex].status = 'joined';
    team.members[memberIndex].joinedAt = new Date();
    await team.save();

    return NextResponse.json({ message: 'Joined team successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
