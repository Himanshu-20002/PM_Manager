'use client';

import React from 'react';
import Link from 'next/link';
import { Briefcase, Users, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface Project {
  _id: string;
  name: string;
  members: any[];
  createdBy: {
    name: string;
  };
}

export const ProjectCard = ({ project }: { project: Project }) => {
  return (
    <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
          <Briefcase size={20} />
        </div>
        <Link 
          href={`/projects/${project._id}`}
          className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-colors"
        >
          <ArrowRight size={20} />
        </Link>
      </div>

      <h4 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
        {project.name}
      </h4>
      <p className="text-sm text-slate-500 mb-6">Created by {project.createdBy.name}</p>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Users size={14} />
          <span>{project.members?.length || 0} Members</span>
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
