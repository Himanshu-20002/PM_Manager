'use client';

import React from 'react';
import { Calendar, User, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  dueDate?: string;
  assignedTo?: {
    name: string;
    email: string;
  };
  projectId?: {
    name: string;
  };
}

interface TaskCardProps {
  task: Task;
  onStatusUpdate?: (taskId: string, newStatus: string) => void;
  canUpdateStatus?: boolean;
}

export const TaskCard = ({ task, onStatusUpdate, canUpdateStatus }: TaskCardProps) => {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <div className={cn(
      "p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow",
      isOverdue && "border-red-200 bg-red-50/30"
    )}>
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-semibold text-slate-900 line-clamp-1">{task.title}</h4>
        <Badge variant={task.status as any}>
          {task.status.replace('-', ' ')}
        </Badge>
      </div>

      {task.description && (
        <p className="text-sm text-slate-500 mb-4 line-clamp-2">{task.description}</p>
      )}

      <div className="space-y-2 mb-4">
        {task.assignedTo && (
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <User size={14} />
            <span>{task.assignedTo.name}</span>
          </div>
        )}
        {task.dueDate && (
          <div className={cn(
            "flex items-center gap-2 text-xs",
            isOverdue ? "text-red-600 font-medium" : "text-slate-600"
          )}>
            {isOverdue ? <AlertCircle size={14} /> : <Calendar size={14} />}
            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {canUpdateStatus && task.status !== 'done' && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
          <button
            onClick={() => onStatusUpdate?.(task._id, task.status === 'todo' ? 'in-progress' : 'done')}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            {task.status === 'todo' ? (
              <>
                <Clock size={14} />
                Start Task
              </>
            ) : (
              <>
                <CheckCircle2 size={14} />
                Complete
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
