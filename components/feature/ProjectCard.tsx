'use client';

import Link from 'next/link';
import { Briefcase, Users, ArrowRight, Trash2 } from 'lucide-react';

interface Project {
  _id: string;
  name: string;
  members: any[];
  createdBy: {
    name: string;
  };
}

export const ProjectCard = ({ project, isAdmin, onDelete }: { project: Project, isAdmin?: boolean, onDelete?: (id: string) => void }) => {
  return (
    <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
          <Briefcase size={20} />
        </div>
        <div className="flex items-center">
          <Link
            href={`/projects/${project._id}`}
            className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>

      <h4 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
        {project.name}
      </h4>
      <p className="text-sm text-slate-500 mb-6">Created by {project.createdBy.name}</p>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Users size={14} />
            <span>{project.members?.length || 0} Members</span>
          </div>
          {isAdmin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!confirm('Delete this project and all its tasks? This action cannot be undone.')) return;
                onDelete && onDelete(project._id);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all flex items-center justify-center bg-slate-50 lg:bg-transparent"
              aria-label="Delete project"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
        <Link
          href={`/projects/${project._id}`}
          className="text-xs font-semibold text-indigo-600 hover:underline"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};
