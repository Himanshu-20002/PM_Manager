'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { TaskCard } from '@/components/feature/TaskCard';
import { ProjectNavbar } from '@/components/feature/ProjectNavbar';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Plus, Layout, Trash2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [data, setData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = React.useState(false);
  const [isStageModalOpen, setIsStageModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const [selectedStage, setSelectedStage] = React.useState('Analysis');
  const [taskData, setTaskData] = React.useState({
    title: '',
    description: '',
    dueDate: '',
    assignedTo: '',
  });

  const [expandedStages, setExpandedStages] = React.useState<Set<string>>(new Set(['Analysis']));
  const [newStageName, setNewStageName] = React.useState('');

  const toggleStage = (stageName: string) => {
    const newExpanded = new Set(expandedStages);
    if (newExpanded.has(stageName)) {
      newExpanded.delete(stageName);
    } else {
      newExpanded.add(stageName);
    }
    setExpandedStages(newExpanded);
  };

  const handleDeleteStage = async (stageName: string) => {
    if (!confirm(`⚠️ WARNING: Deleting the stage "${stageName}" will also PERMANENTLY DELETE all tasks inside it. Are you sure?`)) return;
    try {
      const res = await fetch(`/api/projects/${id}/stages/${encodeURIComponent(stageName)}`, {
        method: 'DELETE',
      });
      if (res.ok) fetchProjectDetails();
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProjectDetails = async (showRefresh = true) => {
    if (showRefresh) setIsRefreshing(true);
    try {
      const [projectRes, sessionRes] = await Promise.all([
        fetch(`/api/projects/${id}`),
        fetch('/api/auth/session')
      ]);

      const projectJson = await projectRes.json();
      if (projectRes.ok) setData(projectJson);

      if (sessionRes.ok) {
        const sessionJson = await sessionRes.json();
        localStorage.setItem('session', JSON.stringify(sessionJson));
      }
    } catch (error) {
      console.error('Failed to fetch project details', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const getSession = () => {
    if (typeof window === 'undefined') return null;
    const s = localStorage.getItem('session');
    return s ? JSON.parse(s) : null;
  };

  const session = getSession();

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
        body: JSON.stringify({ ...taskData, projectId: id, stageName: selectedStage }),
      });
      if (res.ok) {
        setIsTaskModalOpen(false);
        setTaskData({ title: '', description: '', dueDate: '', assignedTo: '' });
        fetchProjectDetails();
      }
    } catch (error) {
      console.error('Failed to create task', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddStage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${id}/stages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newStageName }),
      });
      if (res.ok) {
        setNewStageName('');
        setIsStageModalOpen(false);
        fetchProjectDetails();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
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
        // Also fetch fresh data to update stats and ensure full sync
        fetchProjectDetails(false);
      }
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const handleSyncSquad = async () => {
    try {
      const res = await fetch(`/api/projects/${id}/sync-squad`, {
        method: 'PATCH',
      });
      if (res.ok) fetchProjectDetails();
    } catch (error) {
      console.error('Failed to sync squad', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
      if (res.ok) fetchProjectDetails();
    } catch (error) {
      console.error('Failed to delete task', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-slate-400 font-bold animate-pulse">Loading Project Details...</p>
      </div>
    );
  }

  if (!data) return <div>Project not found</div>;

  const { project, tasks: allTasks } = data;
  const stages = project.stages || [{ name: 'Analysis', order: 1, color: '#f59e0b' }];

  // Filter out ghost tasks that don't belong to any existing stage
  const validTasks = allTasks.filter((t: any) => stages.some((s: any) => s.name === t.stageName));

  const filteredTasks = validTasks.filter((t: any) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalTasks = validTasks.length;
  const completedTasks = validTasks.filter((t: any) => t.status === 'done').length;
  const inProgressTasks = validTasks.filter((t: any) => t.status === 'in-progress').length;
  const backlogTasks = validTasks.filter((t: any) => t.status === 'todo').length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50/50 overflow-hidden" style={{ scrollbarGutter: 'stable' }}>
      <ProjectNavbar
        projectName={project.name}
        members={project.members}
        onAddStage={() => setIsStageModalOpen(true)}
        onSearch={setSearchQuery}
        onSyncSquad={handleSyncSquad}
        onRefresh={() => fetchProjectDetails(true)}
        isRefreshing={isRefreshing}
        isAdmin={session?.role === 'admin'}
      />

      {/* Project Stats Visualization */}
      <div className="max-w-5xl mx-auto mb-10">
        <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Project Completion</h2>
                <span className="text-sm font-black text-indigo-600">{progressPercent}%</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-50">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1.5, ease: "circOut" }}
                  className="h-full bg-indigo-600 rounded-full"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-3 font-medium">Metric : (Completed Tasks ÷ Total Tasks) × 100</p>
            </div>

            <div className="grid grid-cols-2 min-[400px]:grid-cols-4 gap-6 md:gap-12 mt-4 md:mt-0">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Pool</span>
                <span className="text-xl font-black text-slate-800">{totalTasks}</span>
              </div>
              <div className="flex flex-col border-l border-slate-100 pl-6 md:pl-8">
                <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest mb-1">Active</span>
                <span className="text-xl font-black text-slate-800">{inProgressTasks}</span>
              </div>
              <div className="flex flex-col min-[400px]:border-l border-slate-100 min-[400px]:pl-6 md:pl-8">
                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-1">Verified</span>
                <span className="text-xl font-black text-slate-800">{completedTasks}</span>
              </div>
              <div className="flex flex-col border-l border-slate-100 pl-6 md:pl-8">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Backlog</span>
                <span className="text-xl font-black text-slate-800">{backlogTasks}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vertical Stages Layout */}
      <div className="max-w-5xl mx-auto space-y-6 pb-20" style={{ contain: 'layout' }}>
        {[...stages].sort((a: any, b: any) => a.order - b.order).map((stage: any, index: number) => {
          const isExpanded = expandedStages.has(stage.name);
          const stageTasks = filteredTasks.filter((t: any) => t.stageName === stage.name);

          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={stage.name}
              className="group"
            >
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md" style={{ contain: 'layout' }}>
                {/* Stage Header */}
                <div
                  onClick={() => toggleStage(stage.name)}
                  className="p-5 px-8 flex items-center justify-between cursor-pointer select-none bg-slate-50/30 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {session?.role === 'admin' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteStage(stage.name);
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all bg-slate-100 lg:bg-transparent lg:opacity-0 lg:group-hover:opacity-100"
                        title="Delete Stage"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    <div
                      className="w-1.5 h-6 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    <div>
                      <h3 className="font-bold text-slate-900 text-base tracking-tight">{stage.name}</h3>
                      <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">{stageTasks.length} Tasks</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <motion.div
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      className="text-slate-400 p-2"
                    >
                      <ArrowRight size={18} />
                    </motion.div>
                  </div>
                </div>

                {/* Tasks Body */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                      style={{ willChange: 'height' }}
                    >
                      <div className="p-8 pt-2 space-y-6" style={{ contain: 'layout' }}>
                        <div className="flex flex-col gap-5 pb-4">
                          <AnimatePresence mode="popLayout">
                            {stageTasks.map((task: any) => (
                              <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                key={task._id}
                              >
                                <TaskCard
                                  task={task}
                                  onStatusUpdate={handleStatusUpdate}
                                  onDelete={handleDeleteTask}
                                  currentUserId={session?.id}
                                  isAdmin={session?.role === 'admin'}
                                />
                              </motion.div>
                            ))}
                          </AnimatePresence>

                          {session?.role === 'admin' && (
                            <button
                              onClick={() => {
                                setSelectedStage(stage.name);
                                setIsTaskModalOpen(true);
                              }}
                              className="w-full p-6 rounded-3xl border-2 border-dashed border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all flex items-center justify-center gap-3 text-slate-400 hover:text-indigo-600"
                            >
                              <Plus size={20} />
                              <span className="text-xs font-bold uppercase tracking-widest">New Task</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}

        {/* Global Add Stage Button at the bottom */}
        {session?.role === 'admin' && (
          <button
            onClick={() => setIsStageModalOpen(true)}
            className="w-full py-6 rounded-3xl border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all flex items-center justify-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-all">
              <Layout size={20} />
            </div>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest group-hover:text-indigo-600">Add New Project Stage</span>
          </button>
        )}
      </div>

      {/* Task Creation Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title={`Task Assignment for ${selectedStage}`}
      >
        <form onSubmit={handleCreateTask} className="space-y-6">
          <Input
            label="Task Title"
            placeholder="e.g. Database Setup"
            value={taskData.title}
            onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
            required
          />
          <Input
            label="Description"
            placeholder="Enter task details..."
            value={taskData.description}
            onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
          />

          <div className="space-y-4">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Assign Member</label>
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-3 md:gap-4">
              {project.members.map((member: any) => (
                <button
                  key={member._id}
                  type="button"
                  onClick={() => setTaskData({ ...taskData, assignedTo: member._id })}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all",
                    taskData.assignedTo === member._id
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-50 bg-slate-50/50 hover:bg-slate-50"
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-sm font-bold text-slate-700 shadow-sm">
                    {member.name.charAt(0)}
                  </div>
                  <span className="text-[10px] font-bold text-center truncate w-full">{member.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Deadline"
            type="date"
            value={taskData.dueDate}
            onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-6">
            <Button variant="ghost" type="button" onClick={() => setIsTaskModalOpen(false)} className="rounded-2xl">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="rounded-2xl px-8 shadow-lg shadow-indigo-100">
              Create Task
            </Button>
          </div>
        </form>
      </Modal>

      {/* Stage Creation Modal */}
      <Modal
        isOpen={isStageModalOpen}
        onClose={() => setIsStageModalOpen(false)}
        title="Add New Project Stage"
      >
        <form onSubmit={handleAddStage} className="space-y-6">
          <Input
            label="Stage Name"
            placeholder="e.g. Quality Assurance"
            value={newStageName}
            onChange={(e) => setNewStageName(e.target.value)}
            required
          />
          <div className="flex justify-end gap-3 pt-6">
            <Button variant="ghost" type="button" onClick={() => setIsStageModalOpen(false)} className="rounded-2xl">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="rounded-2xl px-8">
              Create Stage
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
