'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Users, UserPlus, Crown, Check, ShieldAlert, RefreshCcw } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { useSession } from '@/lib/SessionContext';

export default function TeamPage() {
  const { session } = useSession();
  const [team, setTeam] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [newTeamName, setNewTeamName] = React.useState('');
  const [inviteEmail, setInviteEmail] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [lastSynced, setLastSynced] = React.useState<string | null>(null);
  const [showInviteInput, setShowInviteInput] = React.useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/team');
      const teamData = await res.json();
      setTeam(res.ok ? teamData : null);
      setLastSynced(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
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
    } catch (err) {
      console.error(err);
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
        setShowInviteInput(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
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
    } catch (err) {
      console.error(err);
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
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-100 pb-8 relative">
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
        <div className="flex items-center gap-3">
          {isOwner && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInviteInput(!showInviteInput)}
              className={cn(
                "flex items-center gap-2 border-slate-200 transition-all shadow-sm rounded-full",
                showInviteInput ? "bg-indigo-50 text-indigo-600 border-indigo-200" : "text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-slate-50"
              )}
            >
              <UserPlus size={16} />
              <span className="hidden sm:inline">Invite Member</span>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={isLoading}
            className="flex items-center gap-2 border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm rounded-full"
          >
            <RefreshCcw size={16} className={cn(isLoading && "animate-spin")} />
            <span className="hidden sm:inline">Sync</span>
          </Button>
        </div>
      </div>

      {isOwner && showInviteInput && (
        <div className="py-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-white/50 backdrop-blur-sm border border-indigo-100/50 p-6 rounded-2xl shadow-lg shadow-indigo-100/20 max-w-xl mx-auto flex flex-col items-center">
            <h4 className="text-slate-800 font-semibold mb-4 text-sm flex items-center gap-2">
              <span className="p-1.5 bg-indigo-100 text-indigo-600 rounded-md"><UserPlus size={14} /></span>
              Add a new squad member
            </h4>
            <form onSubmit={handleInvite} className="flex flex-col sm:flex-row items-center gap-3 w-full">
              <Input
                placeholder="colleague@company.com"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
                className="h-11 border-slate-200 bg-white focus:border-indigo-500 text-sm w-full rounded-xl"
              />
              <Button isLoading={isSubmitting} className="w-full sm:w-auto shrink-0 h-11 px-6 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 shadow-md transition-colors text-white">
                Send Invite
              </Button>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center space-y-12">
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

        <div className="w-full">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-slate-200 flex-1" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Users size={14} />
              Squad Members
            </p>
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          <div className="flex flex-wrap justify-center gap-8 md:gap-12 w-full max-w-4xl mx-auto">
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

      <div className="pt-16 flex flex-col items-center space-y-8">
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
      </div>
    </div>
  );
}
