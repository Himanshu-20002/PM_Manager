'use client';

import React from 'react';
import { Search, Users, Bell,  LayoutGrid, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ProjectNavbarProps {
  projectName: string;
  members: any[];
  onAddStage: () => void;
  onSearch: (query: string) => void;
  onSyncSquad?: () => void;
  isAdmin: boolean;
}

export const ProjectNavbar = ({ projectName, members, onAddStage, onSearch, onSyncSquad, isAdmin }: ProjectNavbarProps) => {
  const [isSquadOpen, setIsSquadOpen] = React.useState(false);
  const [isSyncing, setIsSyncing] = React.useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    await onSyncSquad?.();
    setIsSyncing(false);
  };

  return (
    <nav className="sticky top-8 z-40 mb-12 max-w-5xl mx-auto  md:px-0">
      <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl shadow-slate-200/50 rounded-3xl p-2 md:p-3 px-4 md:px-6 flex items-center justify-between gap-2 md:gap-4">
        {/* Left: Branding & Search */}
        <div className="flex items-center gap-2 md:gap-6 flex-1 min-w-0">
          <div className="flex-col hidden md:flex shrink-0">
            <h1 className="text-sm md:text-lg font-black text-slate-900 tracking-tight leading-none truncate max-w-[150px]">
              {projectName}
            </h1>
            <span className="text-[8px] md:text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1">Project Management</span>
          </div>

          <div className="relative w-full max-w-xs group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
            <input
              type="text"
              placeholder="Filter tasks..."
              onChange={(e) => onSearch(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl md:rounded-2xl pl-10 pr-4 py-2 text-xs md:text-sm focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
            />
          </div>
        </div>

        {/* Center: Squad Control */}
        <div className="flex items-center gap-2 relative">
          <button
            onClick={() => setIsSquadOpen(!isSquadOpen)}
            className={cn(
              "flex items-center gap-2 p-2 md:px-4 md:py-2 rounded-xl md:rounded-2xl transition-all duration-300",
              isSquadOpen ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            )}
          >
            <Users size={18} />
            <span className="text-sm font-bold hidden md:block">Team Members</span>
            <div className="hidden min-[400px]:flex -space-x-2 ml-1 md:ml-2">
              {members.slice(0, 3).map((m, i) => (
                <div key={m._id} className="w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-[8px] md:text-[10px] font-bold text-indigo-600">
                  {m.name.charAt(0)}
                </div>
              ))}
              {members.length > 3 && (
                <div className="w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-600">
                  +{members.length - 3}
                </div>
              )}
            </div>
          </button>

          <AnimatePresence>
            {isSquadOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-14 right-[-40px] md:left-1/2 md:-translate-x-1/2 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 z-50 md:mr-0"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Project Team</p>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {members.map(m => (
                    <div key={m._id} className="relative group cursor-pointer" title={m.name}>
                      <div className="w-10 h-10 rounded-full bg-slate-50 border-2 border-transparent group-hover:border-indigo-500 group-hover:bg-indigo-50 flex items-center justify-center text-xs font-bold text-slate-600 group-hover:text-indigo-600 transition-all">
                        {m.name.charAt(0)}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                    </div>
                  ))}
                  {isAdmin && (
                    <button
                      onClick={handleSync}
                      disabled={isSyncing}
                      className={cn(
                        "w-10 h-10 rounded-full bg-indigo-50 border-2 border-dashed border-indigo-200 flex items-center justify-center text-indigo-600 cursor-pointer hover:bg-indigo-100 transition-all",
                        isSyncing && "animate-spin"
                      )}
                      title="Sync team from organization"
                    >
                      <RefreshCcw size={16} />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Global Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="relative hidden sm:block">
            <button className="w-9 h-9 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all">
              <Bell size={18} />
            </button>
            <div className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
          </div>

          <div className="hidden md:block h-8 w-px bg-slate-100 mx-1" />

          {isAdmin && (
            <Button onClick={onAddStage} size="sm" className="rounded-xl md:rounded-2xl gap-2 font-bold shadow-lg shadow-indigo-100 px-3 md:px-4">
              <LayoutGrid size={16} />
              <span className="hidden sm:block">Add Stage</span>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};
