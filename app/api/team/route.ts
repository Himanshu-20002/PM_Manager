import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Team from '@/models/Team';
import User from '@/models/User';
import { getSession } from '@/lib/auth';

// GET team details
export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    
    // Find team where user is owner or member
    const team = await Team.findOne({
      $or: [
        { owner: session.id },
        { 'members.user': session.id }
      ]
    }).populate('owner', 'name email')
      .populate('members.user', 'name email')
      .lean();

    // If no team found, return null instead of empty or error
    if (!team) return NextResponse.json(null);

    return NextResponse.json(team);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// CREATE team (Admin only)
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can create a team' }, { status: 403 });
    }

    await dbConnect();
    const { name } = await req.json();

    if (!name) return NextResponse.json({ error: 'Team name is required' }, { status: 400 });

    // Check if admin already has a team
    const existingTeam = await Team.findOne({ owner: session.id });
    if (existingTeam) {
      return NextResponse.json({ error: 'You already have a team' }, { status: 400 });
    }

    const team = await Team.create({
      name,
      owner: session.id,
      members: []
    });

    return NextResponse.json(team, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
