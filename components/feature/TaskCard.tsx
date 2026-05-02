'use client';

import React from 'react';
import { CheckCircle2, Clock, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';


interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'todo' | 'joining' | 'done' | 'in-progress';
  dueDate?: string;
  assignedTo?: string | {
    _id: string;
    name: string;
    email: string;
  };
}

interface TaskCardProps {
  task: Task;
  onStatusUpdate: (taskId: string, newStatus: string) => void;
  onDelete: (taskId: string) => void;
  currentUserId: string;
  isAdmin: boolean;
}

export const TaskCard = ({ task, onStatusUpdate, onDelete, currentUserId, isAdmin }: TaskCardProps) => {
  const [isUpdating, setIsUpdating] = React.useState(false);
  const isAssignedToMe = React.useMemo(() => {
    const assignedId = typeof task.assignedTo === 'object' 
      ? task.assignedTo?._id?.toString() 
      : task.assignedTo?.toString();
    return String(assignedId) === String(currentUserId);
  }, [task.assignedTo, currentUserId]);

  const statusColors: any = {
    todo: 'bg-slate-400',
    'in-progress': 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.3)]',
    done: 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
  };

  const handleStatusClick = async () => {
    if (!isAssignedToMe || isUpdating) return;
    setIsUpdating(true);
    const nextStatus = task.status === 'todo' ? 'in-progress' : 'done';
    await onStatusUpdate(task._id, nextStatus);
    setIsUpdating(false);
  };

  return (
    <motion.div
      layout
      className="relative group bg-white/60 backdrop-blur-sm rounded-[2rem] border border-white/50 shadow-sm p-6 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-500 overflow-hidden flex flex-col min-h-[220px] justify-between"
    >
      <div className="absolute -right-8 -top-8 w-24 h-24 bg-indigo-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-500",
        task.status === 'done' ? "bg-emerald-500" : task.status === 'in-progress' ? "bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" : "bg-slate-200"
      )} />

      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col">
          <h4 className="font-bold text-slate-900 text-sm leading-tight tracking-tight uppercase group-hover:text-indigo-600 transition-colors">
            {task.title}
          </h4>
          <span className="text-[9px] text-slate-400 font-black tracking-widest mt-1">ID: {task._id.slice(-6).toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn(
            "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
            task.status === 'done' ? "bg-emerald-50 text-emerald-600" : task.status === 'in-progress' ? "bg-indigo-50 text-indigo-600" : "bg-slate-50 text-slate-500"
          )}>
            {task.status === 'done' ? 'Verified' : task.status === 'in-progress' ? 'Development' : 'Backlog'}
          </div>
        </div>
      </div>

      {task.description && (
        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-6 font-medium font-outfit">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task._id);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all bg-slate-50 lg:bg-transparent lg:opacity-0 lg:group-hover:opacity-100 mr-1"
              title="Delete Task"
            >
              <Trash2 size={14} />
            </button>
          )}
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-100 flex items-center justify-center text-[11px] font-black text-indigo-600 shadow-sm">
            {typeof task.assignedTo === 'object' ? task.assignedTo?.name?.charAt(0) : '?'}
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Member</span>
            <span className="text-[10px] font-bold text-slate-700">
              {typeof task.assignedTo === 'object' ? task.assignedTo?.name?.split(' ')[0] : 'Assigned'}
            </span>
          </div>
        </div>

        {task.dueDate && (
          <div className="text-right">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none block">Deadline</span>
            <span className="text-[10px] font-bold text-slate-600">{new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {isAssignedToMe && task.status !== 'done' && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleStatusClick}
          disabled={isUpdating}
          className={cn(
            "mt-6 w-full py-2.5 rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all shadow-sm",
            task.status === 'todo' ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
          )}
        >
          {isUpdating ? (
            <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          ) : (
            <>
              {task.status === 'todo' ? (
                <>
                  <Clock size={16} className="opacity-50" />
                  <span>Start Task</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Mark Done</span>
                </>
              )}
            </>
          )}
        </motion.button>
      )}

      {(!isAssignedToMe || task.status === 'done') && (
        <div className={cn(
          "mt-6 w-full py-2.5 rounded-2xl flex items-center justify-center gap-2 border transition-all duration-300",
          task.status === 'done' ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
          task.status === 'in-progress' ? "bg-indigo-50 border-indigo-100 text-indigo-600" :
          "bg-slate-50 border-slate-100 text-slate-400"
        )}>
          {task.status === 'done' && <CheckCircle2 size={14} />}
          {task.status === 'in-progress' && <Clock size={14} className="animate-pulse" />}
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">
            {task.status === 'done' ? 'Project Completed' :
             task.status === 'in-progress' ? 'Task in Development' :
             !task.assignedTo ? 'Awaiting Assignee' : 'Awaiting Member Start'}
          </span>
        </div>
      )}
    </motion.div>
  );
};
