import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowRight, CheckCircle2, LayoutDashboard, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex   items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-xl">
            P
          </div>
          <span className="text-xl font-bold text-slate-900">PM Manager</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
            Log in
          </Link>
          <Link href="/signup">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main>
        <section className="px-6 pt-20 pb-32 max-w-7xl mx-auto text-center ">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold mb-8 uppercase tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Production Ready Team Management
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
            Manage your team's <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Tasks & Projects</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-500 mb-10">
            A simple, powerful, and production-ready task manager built for modern teams. 
            Track progress, assign tasks, and hit your deadlines with ease.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="h-14 px-8 text-lg gap-2">
                Start for Free <ArrowRight size={20} />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg">
                View Demo
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-indigo-50 py-24 px-6 border-y  border-slate-100">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="space-y-4">
                <div className="p-3 bg-white w-fit rounded-xl border border-slate-100 shadow-sm text-indigo-600">
                  <LayoutDashboard size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Advanced Dashboard</h3>
                <p className="text-slate-500 leading-relaxed">
                  Get a bird's-eye view of all your projects and tasks with real-time analytics.
                </p>
              </div>
              <div className="space-y-4">
                <div className="p-3 bg-white w-fit rounded-xl border border-slate-100 shadow-sm text-indigo-600">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Role-based Access</h3>
                <p className="text-slate-500 leading-relaxed">
                  Admins manage projects while members focus on execution. Secure and efficient.
                </p>
              </div>
              <div className="space-y-4">
                <div className="p-3 bg-white w-fit rounded-xl border border-slate-100 shadow-sm text-indigo-600">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Task Tracking</h3>
                <p className="text-slate-500 leading-relaxed">
                  Visual status badges, overdue indicators, and detailed task histories.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 max-w-7xl mx-auto border-t border-slate-100">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-slate-500 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-900 rounded-md flex items-center justify-center text-white font-bold text-xs">
              P
            </div>
            <span className="font-bold text-slate-900">PM Manager</span>
          </div>
          <p>© 2026 PM Manager. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-slate-900">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-900">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
