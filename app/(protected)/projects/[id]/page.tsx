'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { TaskCard } from '@/components/feature/TaskCard';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Plus, Users, Calendar, ListTodo } from 'lucide-react';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [data, setData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [taskData, setTaskData] = React.useState({
    title: '',
    description: '',
    dueDate: '',
    assignedTo: '',
  });
  const [memberEmail, setMemberEmail] = React.useState('');
  const [isAddingMember, setIsAddingMember] = React.useState(false);
  const [session, setSession] = React.useState<any>(null);

  const fetchProjectDetails = async () => {
    try {
      const [projectRes, sessionRes] = await Promise.all([
        fetch(`/api/projects/${id}`),
        fetch('/api/auth/session') // I need to verify this endpoint exists or create it
      ]);
      
      const projectJson = await projectRes.json();
      if (projectRes.ok) setData(projectJson);
      
      if (sessionRes.ok) {
        const sessionJson = await sessionRes.json();
        setSession(sessionJson);
      }
    } catch (error) {
      console.error('Failed to fetch project details', error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...taskData, projectId: id }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setTaskData({ title: '', description: '', dueDate: '', assignedTo: '' });
        fetchProjectDetails();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to create task');
      }
    } catch (error) {
      console.error('Failed to create task', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingMember(true);
    try {
      const res = await fetch(`/api/projects/${id}/add-member`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: memberEmail }),
      });
      if (res.ok) {
        setMemberEmail('');
        fetchProjectDetails();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to add member');
      }
    } catch (error) {
      console.error('Failed to add member', error);
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleStatusUpdate = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setData((prev: any) => ({
          ...prev,
          tasks: prev.tasks.map((t: any) => t._id === taskId ? { ...t, status: newStatus } : t)
        }));
      }
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>;
  }

  if (!data) return <div>Project not found</div>;

  const { project, tasks } = data;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold text-slate-900">{project.name}</h2>
              <Badge variant="admin">Admin Controlled</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-1.5">
                <Users size={16} />
                <span>{project.members.length} Members</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={16} />
                <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2 shrink-0">
            <Plus size={18} />
            Add Task
          </Button>
        </div>
      </div>

      {/* Team Members Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ListTodo size={20} className="text-indigo-600" />
              Project Tasks
            </h3>
            <div className="flex gap-2">
              <Badge variant="todo">{tasks.filter((t: any) => t.status === 'todo').length} Todo</Badge>
              <Badge variant="in-progress">{tasks.filter((t: any) => t.status === 'in-progress').length} In Progress</Badge>
              <Badge variant="done">{tasks.filter((t: any) => t.status === 'done').length} Done</Badge>
            </div>
          </div>

          {tasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tasks.map((task: any) => (
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
              <h4 className="text-lg font-medium text-slate-900">No tasks in this project</h4>
              <p className="text-slate-500 text-sm">Create the first task to start tracking progress.</p>
            </div>
          )}
        </div>

        {/* Sidebar: Team Members */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <Users size={18} className="text-indigo-600" />
                Team Members
              </h4>
            </div>

            <div className="space-y-4">
              {project.members.map((member: any) => (
                <div key={member._id} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{member.name}</p>
                    <p className="text-xs text-slate-500">{member.email}</p>
                  </div>
                </div>
              ))}
            </div>

            {session?.role === 'admin' && (
              <form onSubmit={handleAddMember} className="pt-4 border-t border-slate-100 space-y-3">
                <Input 
                  placeholder="Collaborator email" 
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  required
                />
                <Button size="sm" className="w-full" isLoading={isAddingMember}>
                  Add Member
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={`New Task for ${project.name}`}
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input 
            label="Task Title" 
            placeholder="e.g. Design Navbar" 
            value={taskData.title}
            onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
            required
          />
          <Input 
            label="Description" 
            placeholder="What needs to be done?" 
            value={taskData.description}
            onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
          />
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Assign To Member</label>
            <select 
              className="w-full flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              value={taskData.assignedTo}
              onChange={(e) => setTaskData({ ...taskData, assignedTo: e.target.value })}
            >
              <option value="">Unassigned</option>
              {project.members.map((member: any) => (
                <option key={member._id} value={member._id}>
                  {member.name} ({member.email})
                </option>
              ))}
            </select>
          </div>

          <Input 
            label="Due Date" 
            type="date"
            value={taskData.dueDate}
            onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
