'use client';

import React from 'react';
import { 
  Trophy, 
  Target, 
  Briefcase, 
  Calendar, 
  Award, 
  Zap, 
  Mail, 
  User as UserIcon,
  ShieldCheck,
  Star
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const [data, setData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (error) {
        console.error('Failed to fetch profile', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!data) return <div>Profile not found</div>;

  const { user, stats } = data;
  const xpPercent = (stats.xp % 500) / 500 * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Profile Hero Card */}
      <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-8 lg:p-12 text-white shadow-2xl shadow-indigo-200/50">
         {/* Background pattern */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
         <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -ml-24 -mb-24" />

         <div className="relative flex flex-col md:flex-row items-center gap-8">
            {/* Avatar section */}
            <div className="relative">
               <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-500 p-1 shadow-lg">
                  <div className="w-full h-full rounded-[22px] bg-slate-900 flex items-center justify-center">
                     <span className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-tr from-indigo-400 to-violet-400">
                        {user.name.charAt(0)}
                     </span>
                  </div>
               </div>
               <div className="absolute -bottom-2 -right-2 bg-amber-400 text-slate-900 rounded-full p-2 border-4 border-slate-900 shadow-lg">
                  <Star size={16} fill="currentColor" />
               </div>
            </div>

            {/* Info Section */}
            <div className="text-center md:text-left flex-1 space-y-4">
               <div>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-2">
                     <h2 className="text-4xl font-black tracking-tight">{user.name}</h2>
                     <Badge variant={user.role === 'admin' ? 'admin' : 'member'} className="h-7 px-4 text-xs font-bold uppercase tracking-widest ring-4 ring-white/5">
                        {user.role}
                     </Badge>
                  </div>
                  <p className="flex items-center justify-center md:justify-start gap-2 text-slate-400 font-medium">
                     <Mail size={16} className="text-indigo-400" />
                     {user.email}
                  </p>
               </div>

               <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-2">
                  <div className="flex items-center gap-2">
                     <ShieldCheck size={18} className="text-emerald-400" />
                     <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Level {stats.level}</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <Zap size={18} className="text-amber-400" />
                     <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{stats.xp} Total XP</span>
                  </div>
               </div>
            </div>
         </div>

         {/* XP Progress Bar */}
         <div className="mt-12 space-y-3">
            <div className="flex justify-between items-end">
               <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">Growth Progress</span>
               <span className="text-xs font-bold text-slate-500">{stats.xp % 500} / 500 XP to Level {stats.level + 1}</span>
            </div>
            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
               <div 
                 className="h-full bg-gradient-to-r from-indigo-600 via-violet-500 to-fuchsia-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(79,70,229,0.5)]"
                 style={{ width: `${xpPercent}%` }}
               />
            </div>
         </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="group bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform">
               <Briefcase size={24} />
            </div>
            <h4 className="text-3xl font-black text-slate-900">{stats.totalProjects}</h4>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">Total Projects</p>
         </div>

         <div className="group bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform">
               <Trophy size={24} />
            </div>
            <h4 className="text-3xl font-black text-slate-900">{stats.completedTasks}</h4>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">Quests Completed</p>
         </div>

         <div className="group bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform">
               <Target size={24} />
            </div>
            <h4 className="text-3xl font-black text-slate-900">{stats.totalTasks}</h4>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">Active Quests</p>
         </div>
      </div>

      {/* Additional Details Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
         <h4 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <Award size={24} className="text-indigo-600" />
            Character Summary
         </h4>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
               <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                     <Calendar size={18} className="text-slate-400" />
                     <span className="text-sm font-medium text-slate-600">Join Date</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                     {new Date(stats.joinedDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
               </div>
               <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                     <ShieldCheck size={18} className="text-slate-400" />
                     <span className="text-sm font-medium text-slate-600">Permissions</span>
                  </div>
                  <Badge variant="secondary" className="uppercase text-[10px]">{user.role}</Badge>
               </div>
            </div>

            <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100 flex flex-col items-center justify-center text-center">
               <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mb-4">
                  <Zap size={32} className="text-amber-500 fill-amber-500" />
               </div>
               <p className="text-sm font-bold text-indigo-900 mb-1">XP Mastery</p>
               <p className="text-xs text-indigo-600">Complete more tasks to unlock legendary achievements.</p>
            </div>
         </div>
      </div>
    </div>
  );
}
