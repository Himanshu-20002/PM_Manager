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
    role: 'member' as 'admin' | 'member',
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
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'member' })}
                className={cn(
                  "p-4 rounded-xl border-2 text-left transition-all relative group",
                  formData.role === 'member' 
                    ? "border-indigo-600 bg-indigo-50/50" 
                    : "border-slate-100 hover:border-slate-200 bg-slate-50/30"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center mb-3",
                  formData.role === 'member' ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-500"
                )}>
                  <UserIcon size={20} />
                </div>
                <p className="font-bold text-slate-900 text-sm">Member</p>
                <p className="text-[10px] text-slate-500 mt-0.5">I work on projects</p>
                {formData.role === 'member' && (
                  <CheckCircle2 className="absolute top-2 right-2 text-indigo-600" size={16} />
                )}
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'admin' })}
                className={cn(
                  "p-4 rounded-xl border-2 text-left transition-all relative group",
                  formData.role === 'admin' 
                    ? "border-indigo-600 bg-indigo-50/50" 
                    : "border-slate-100 hover:border-slate-200 bg-slate-50/30"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center mb-3",
                  formData.role === 'admin' ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-500"
                )}>
                  <Shield size={20} />
                </div>
                <p className="font-bold text-slate-900 text-sm">Admin</p>
                <p className="text-[10px] text-slate-500 mt-0.5">I manage teams</p>
                {formData.role === 'admin' && (
                  <CheckCircle2 className="absolute top-2 right-2 text-indigo-600" size={16} />
                )}
              </button>
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
