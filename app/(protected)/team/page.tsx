'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Users, UserPlus, Crown, Check, X, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

export default function TeamPage() {
  const [team, setTeam] = React.useState<any>(null);
  const [session, setSession] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [newTeamName, setNewTeamName] = React.useState('');
  const [inviteEmail, setInviteEmail] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fetchData = async () => {
    try {
      const [teamRes, sessionRes] = await Promise.all([
        fetch('/api/team'),
        fetch('/api/auth/session')
      ]);
      
      const teamData = await teamRes.json();
      const sessionData = await sessionRes.json();
      
      setTeam(teamData);
      setSession(sessionData);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
    
    const interval = setInterval(() => {
      // Optimization: Only poll if tab is visible AND there are pending invitations
      const hasPending = team?.members?.some((m: any) => m.status === 'pending');
      
      if (document.visibilityState === 'visible' && hasPending) {
        fetchData();
      }
    }, 10000); // Increased interval to 10s for better performance
    
    return () => clearInterval(interval);
  }, [team?.members]); // Re-run effect when member list changes to re-check pending state

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTeamName }),
      });
      if (res.ok) {
        setNewTeamName('');
        fetchData();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/team/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      });
      if (res.ok) {
        setInviteEmail('');
        fetchData();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoin = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/team/join', {
        method: 'PATCH',
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Case 1: No team exists
  if (!team && session?.role === 'admin') {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Users size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Create Your Team</h2>
        <p className="text-slate-500 mb-8">Start your journey by giving your team a unique identity.</p>
        <form onSubmit={handleCreateTeam} className="space-y-4">
          <Input 
            placeholder="Team Name (e.g. Dream Team)" 
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            required
          />
          <Button className="w-full" isLoading={isSubmitting}>Create Team</Button>
        </form>
      </div>
    );
  }

  // Case 2: Member with no team
  if (!team) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
        <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">No Team Yet</h2>
        <p className="text-slate-500">Wait for your admin to invite you to a team.</p>
      </div>
    );
  }

  const isOwner = team?.owner?._id?.toString() === session?.id?.toString();
  const myStatus = team?.members?.find((m: any) => 
    (m.user?._id?.toString() || m.user?.toString()) === session?.id?.toString()
  )?.status;

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{team.name}</h2>
        <p className="text-slate-500 mt-2">The ultimate project squad</p>
      </div>

      {/* Gamified Team View */}
      <div className="flex flex-col items-center space-y-12">
        {/* Team Leader (Top Center) */}
        <div className="relative group">
          <div className="w-32 h-32 rounded-full border-4 border-amber-400 p-1 bg-gradient-to-tr from-amber-500 to-yellow-300 shadow-xl shadow-amber-200/50 transform group-hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center relative overflow-hidden">
               <div className="absolute top-1 text-amber-500">
                  <Crown size={24} />
               </div>
               <span className="text-2xl font-bold text-slate-800 mt-4">{team.owner.name.charAt(0).toUpperCase()}</span>
               <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full mt-1 uppercase tracking-widest">Leader</span>
            </div>
          </div>
          <div className="text-center mt-4">
             <p className="font-bold text-slate-900 text-lg">{team.owner.name}</p>
             <p className="text-xs text-slate-500">{team.owner.email}</p>
          </div>
        </div>

        {/* Member Grid */}
        <div className="w-full">
           <div className="flex items-center gap-4 mb-8">
              <div className="h-px bg-slate-200 flex-1" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Users size={14} />
                Squad Members
              </p>
              <div className="h-px bg-slate-200 flex-1" />
           </div>

           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 place-items-center">
              {team.members.map((member: any) => (
                <div key={member.user._id} className="group flex flex-col items-center">
                  <div className={cn(
                    "w-20 h-20 rounded-full border-2 p-1 transition-all duration-300 transform group-hover:scale-110",
                    member.status === 'joined' ? "border-emerald-400 bg-emerald-50 shadow-lg shadow-emerald-100/50" : "border-slate-200 bg-slate-50 animate-pulse border-dashed"
                  )}>
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center relative">
                      <span className="text-xl font-bold text-slate-700">{member.user.name.charAt(0)}</span>
                      {member.status === 'joined' && (
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 border-2 border-white shadow-sm">
                           <Check size={10} strokeWidth={4} />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-center mt-3">
                    <p className={cn(
                      "text-sm font-bold truncate max-w-[100px]",
                      member.status === 'joined' ? "text-slate-900" : "text-slate-400 italic"
                    )}>
                      {member.user.name}
                    </p>
                    <Badge variant={member.status === 'joined' ? 'success' : 'secondary'} className="text-[10px] h-4">
                       {member.status}
                    </Badge>
                  </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-12 flex flex-col items-center space-y-6">
        {/* Accept Join for pending members */}
        {!isOwner && myStatus === 'pending' && (
          <div className="w-full max-w-sm p-6 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-200 flex flex-col items-center">
             <UserPlus size={40} className="mb-4 text-indigo-200" />
             <h4 className="text-xl font-bold mb-2 text-center">Join the Squad!</h4>
             <p className="text-indigo-100 text-sm text-center mb-6">You've been invited to join <strong>{team.name}</strong> as a squad member.</p>
             <Button 
               variant="secondary" 
               className="w-full bg-white text-indigo-600 hover:bg-white/90" 
               onClick={handleJoin}
               isLoading={isSubmitting}
             >
               Level Up Now
             </Button>
          </div>
        )}

        {/* Invite form for Admin */}
        {isOwner && (
          <div className="w-full max-w-md bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <UserPlus size={18} className="text-indigo-600" />
              Recruit Member
            </h4>
            <form onSubmit={handleInvite} className="flex gap-2">
               <Input 
                 placeholder="Enter email address" 
                 type="email"
                 value={inviteEmail}
                 onChange={(e) => setInviteEmail(e.target.value)}
                 required
               />
               <Button isLoading={isSubmitting} className="shrink-0">Invite</Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
