'use client';

import React from 'react';
import { TaskCard } from '@/components/feature/TaskCard';
import { Badge } from '@/components/ui/Badge';
import { 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  ListTodo
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useData } from '@/lib/DataContext';
import { useSession } from '@/lib/SessionContext';

export default function DashboardPage() {
  const { session } = useSession();
  const { tasks, refreshTasks, optimisticUpdateTask } = useData();
  const [stats, setStats] = React.useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    todo: 0,
    overdue: 0,
    leftToDo: 0
  });
  const [isLoading, setIsLoading] = React.useState(!tasks.length);

  React.useEffect(() => {
    refreshTasks().finally(() => setIsLoading(false));
  }, [refreshTasks]);

  React.useEffect(() => {
    if (tasks.length > 0) {
      const now = new Date();
      const completed = tasks.filter((t: any) => t.status === 'done').length;
      const inProgress = tasks.filter((t: any) => t.status === 'in-progress').length;
      const todo = tasks.filter((t: any) => t.status === 'todo').length;
      const overdue = tasks.filter((t: any) => 
        t.dueDate && new Date(t.dueDate) < now && t.status !== 'done'
      ).length;

      setStats({
        total: tasks.length,
        completed,
        inProgress,
        todo,
        overdue,
        leftToDo: tasks.length - completed
      });
    }
  }, [tasks]);

  const handleStatusUpdate = async (taskId: string, newStatus: string) => {
    optimisticUpdateTask(taskId, newStatus);
    
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        refreshTasks(true);
      }
    } catch (error) {
      console.error('Status update error:', error);
      refreshTasks(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const isMember = session?.role === 'member';

  const statCards = [
    { title: 'Total Tasks', value: stats.total, icon: ListTodo, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Completed', value: stats.completed, icon: CheckSquare, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Left to Do', value: stats.leftToDo, icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-6 md:space-y-8 font-outfit">
      <div className="pt-12 lg:pt-0 px-2 lg:px-0">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          {isMember ? 'My Tasks Dashboard' : 'Project Dashboard'}
        </h2>
        <p className="text-slate-400 text-xs md:text-sm mt-1 font-medium tracking-wide">
          {isMember ? 'Overview of your assigned responsibilities' : "Overview of your team's performance"}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((stat) => (
          <div key={stat.title} className="p-5 md:p-6 bg-white rounded-3xl md:rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center text-center group">
            <div className={cn("p-3 md:p-4 rounded-2xl mb-3 md:mb-4 transition-transform group-hover:scale-110", stat.bg, stat.color)}>
              <stat.icon size={22} className="md:w-6 md:h-6" />
            </div>
            <p className="text-2xl md:text-4xl font-black text-slate-800 leading-none">{stat.value}</p>
            <p className="text-[9px] md:text-xs font-black uppercase tracking-widest text-slate-400 mt-2">{stat.title}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between px-2 md:px-0">
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            {isMember ? 'Tasks Assigned to Me' : 'Recent Project Tasks'}
          </h3>
          <Badge variant="secondary" className="border-indigo-100 text-indigo-500 bg-indigo-50 font-bold text-[10px] uppercase tracking-widest px-3 py-1">
            {tasks.length} total
          </Badge>
        </div>
        
        {tasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {tasks.map(task => (
              <TaskCard 
                key={task._id} 
                task={task} 
                onStatusUpdate={handleStatusUpdate}
                onDelete={() => {}} 
                currentUserId={session?.id || ''}
                isAdmin={session?.role === 'admin'}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <ListTodo size={48} className="mx-auto text-slate-300 mb-4" />
            <h4 className="text-lg font-black text-slate-900 tracking-tight">No tasks found</h4>
            <p className="text-slate-400 text-sm mt-1">Tasks assigned to you will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
