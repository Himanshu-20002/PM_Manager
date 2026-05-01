'use client';

import React from 'react';
import { TaskCard } from '@/components/feature/TaskCard';
import { Badge } from '@/components/ui/Badge';
import { 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  ListTodo,
  TrendingUp
} from 'lucide-react';

export default function DashboardPage() {
  const [tasks, setTasks] = React.useState<any[]>([]);
  const [stats, setStats] = React.useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0
  });
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/tasks');
        const data = await res.json();
        if (res.ok) {
          setTasks(data);
          
          // Calculate stats
          const now = new Date();
          const completed = data.filter((t: any) => t.status === 'done').length;
          const inProgress = data.filter((t: any) => t.status === 'in-progress').length;
          const overdue = data.filter((t: any) => 
            t.dueDate && new Date(t.dueDate) < now && t.status !== 'done'
          ).length;

          setStats({
            total: data.length,
            completed,
            inProgress,
            overdue
          });
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStatusUpdate = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        // Refresh local state
        setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      }
    } catch (error) {
      console.error('Failed to update task status', error);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>;
  }

  const statCards = [
    { title: 'Total Tasks', value: stats.total, icon: ListTodo, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Completed', value: stats.completed, icon: CheckSquare, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Overdue', value: stats.overdue, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-slate-500 text-sm mt-1">overview of your team's performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.title} className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2 rounded-lg", stat.bg, stat.color)}>
                <stat.icon size={20} />
              </div>
              <TrendingUp size={16} className="text-slate-300" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm font-medium text-slate-500 mt-1">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Recent Tasks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Your Tasks</h3>
          <Badge>{tasks.length} total</Badge>
        </div>
        
        {tasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map(task => (
              <TaskCard 
                key={task._id} 
                task={task} 
                onStatusUpdate={handleStatusUpdate}
                canUpdateStatus={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200">
            <ListTodo size={48} className="mx-auto text-slate-300 mb-4" />
            <h4 className="text-lg font-medium text-slate-900">No tasks found</h4>
            <p className="text-slate-500 text-sm">Tasks assigned to you will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Utility import for stat grid
import { cn } from '@/lib/utils';
