import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';

import { getSession } from '@/lib/auth';
import { updateTaskSchema } from '@/validators/task';

export async function PATCH(
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
    const body = await req.json();

    const task = await Task.findById(id);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Role-based authorization
    if (session.role === 'member') {
      // Only the assigned user can update the task
      if (task.assignedTo?.toString() !== String(session.id)) {
        return NextResponse.json({ error: 'Forbidden: You are not assigned to this task' }, { status: 403 });
      }

      // Members can only update status
      if (body.status && Object.keys(body).length === 1) {
        task.status = body.status;
        await task.save();
        return NextResponse.json(task);
      } else {
        return NextResponse.json({ error: 'Members can only update task status' }, { status: 403 });
      }
    }

    // Admin can update metadata, but status only if assigned
    if (session.role === 'admin') {
      const validation = updateTaskSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
      }

      // If trying to update status, must be the assignee
      if (body.status && task.assignedTo?.toString() !== String(session.id)) {
        return NextResponse.json({ error: 'Prohibited: Only the assigned specialist can update the status.' }, { status: 403 });
      }

      const updatedTask = await Task.findByIdAndUpdate(id, validation.data, { new: true });
      return NextResponse.json(updatedTask);
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    await dbConnect();
    await Task.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
