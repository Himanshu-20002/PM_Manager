'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Users, UserPlus, Crown, Check, ShieldAlert, RefreshCcw } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

export default function TeamPage() {
  const [team, setTeam] = React.useState<any>(null);
  const [session, setSession] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [newTeamName, setNewTeamName] = React.useState('');
  const [inviteEmail, setInviteEmail] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [lastSynced, setLastSynced] = React.useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [teamRes, sessionRes] = await Promise.all([
        fetch('/api/team'),
        fetch('/api/auth/session')
      ]);

      const teamData = await teamRes.json();
      const sessionData = await sessionRes.json();

      setTeam(teamRes.ok ? teamData : null);
      setSession(sessionData);
      setLastSynced(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
    console.log('🚀 Team Interface Initialized');
  }, []);

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

  if (isLoading && !team) {
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
    <div className="space-y-12 max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-100 pb-8">
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{team?.name}</h2>
          <p className="text-slate-500 mt-1 flex items-center justify-center md:justify-start gap-2 text-sm">
            The ultimate project squad
            {lastSynced && (
              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-400 font-medium tracking-tighter">
                Last synced at {lastSynced}
              </span>
            )}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          disabled={isLoading}
          className="flex items-center gap-2 border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
        >
          <RefreshCcw size={16} className={cn(isLoading && "animate-spin")} />
          Sync Squad
        </Button>
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
              <span className="text-2xl font-bold text-slate-800 mt-4">{team.owner?.name.charAt(0).toUpperCase()}</span>
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full mt-1 uppercase tracking-widest">Leader</span>
            </div>
          </div>
          <div className="text-center mt-4">
            <p className="font-bold text-slate-900 text-lg">{team.owner?.name}</p>
            <p className="text-xs text-slate-500">{team.owner?.email}</p>
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
            {team?.members?.map((member: any) => (
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
      <div className="pt-16 flex flex-col items-center space-y-8">
        {/* Accept Join for pending members */}
        {!isOwner && myStatus === 'pending' && (
          <div className="w-full max-w-md p-8 bg-slate-900 rounded-[2rem] text-white shadow-2xl flex flex-col items-center border border-slate-800">
            <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mb-6">
              <UserPlus size={28} />
            </div>
            <h4 className="text-2xl font-black mb-2 text-center tracking-tight text-white">Team Invitation</h4>
            <p className="text-slate-400 text-sm text-center mb-8 font-medium">
              You have been invited to collaborate with <strong className="text-white">{team.name}</strong>.
            </p>
            <Button
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl h-12 font-bold tracking-wide"
              onClick={handleJoin}
              isLoading={isSubmitting}
            >
              Accept Invitation
            </Button>
          </div>
        )}

        {/* Invite form for Admin */}
        {isOwner && (
          <div className="w-full mt-30 max-w-6xl bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-violet-500"></div>
            <h4 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3 tracking-tight">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <UserPlus size={16} />
              </div>
              Invite Team Member
            </h4>
            <form onSubmit={handleInvite} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="w-full sm:flex-1">
                <Input
                  placeholder="colleague@company.com"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  className="h-12 border-slate-200 focus:border-indigo-500 text-sm w-full"
                />
              </div>
              <Button isLoading={isSubmitting} className="w-full sm:w-auto shrink-0 h-11 px-8 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 shadow-md">
                Send Invite
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
