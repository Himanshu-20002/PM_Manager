'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

import { Shield, User as UserIcon, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    password: '',
    role: 'admin' as 'admin' | 'member',
  });
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      router.push('/login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-xl text-white font-bold text-2xl mb-4">
            P
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Account</h2>
          <p className="mt-2 text-sm text-slate-500">Join PM Manager today</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Role Selection */}
            {/* Role Selection */}
            <div className="space-y-3 mb-8">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mb-4">Choose your role</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'admin' })}
                  className={cn(
                    "p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden group",
                    formData.role === 'admin' 
                      ? "border-indigo-600 bg-indigo-50/50 shadow-md ring-4 ring-indigo-50" 
                      : "border-slate-100 hover:border-slate-200 bg-slate-50/30"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300",
                    formData.role === 'admin' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-slate-200 text-slate-500"
                  )}>
                    <Shield size={24} />
                  </div>
                  <div className="inline-flex items-center gap-2 mb-1">
                    <p className="font-black text-slate-900 text-sm tracking-tight">Team Leader</p>
                    <span className="px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-[8px] font-black uppercase">Admin</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-medium">I want to create projects and manage a team</p>
                  {formData.role === 'admin' && (
                    <div className="absolute top-3 right-3 bg-indigo-600 rounded-full p-0.5">
                      <CheckCircle2 className="text-white" size={14} />
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'member' })}
                  className={cn(
                    "p-5 rounded-2xl border-2 text-left transition-all relative group",
                    formData.role === 'member' 
                      ? "border-slate-600 bg-slate-50 shadow-md ring-4 ring-slate-50" 
                      : "border-slate-100 hover:border-slate-200 bg-slate-50/30"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300",
                    formData.role === 'member' ? "bg-slate-800 text-white shadow-lg shadow-slate-200" : "bg-slate-200 text-slate-500"
                  )}>
                    <UserIcon size={24} />
                  </div>
                  <p className="font-black text-slate-900 text-sm tracking-tight mb-1">Team Member</p>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-medium">I want to join a team and work on tasks</p>
                  {formData.role === 'member' && (
                    <div className="absolute top-3 right-3 bg-slate-800 rounded-full p-0.5">
                      <CheckCircle2 className="text-white" size={14} />
                    </div>
                  )}
                </button>
              </div>
            </div>

            <Input
              label="Full Name"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full h-12" isLoading={isLoading}>
            Sign up
          </Button>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
