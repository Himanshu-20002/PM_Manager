'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  CheckSquare,
  LogOut,
  PlusCircle,
  Menu,
  X,
  Users,
  UserIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/projects', icon: Briefcase },
    { name: 'Team', href: '/team', icon: Users },
    { name: 'Profile', href: '/profile', icon: UserIcon },
  ];

  const handleLogout = async () => {
    // In a real app, you might want to call an API to clear cookies on the server
    // For this simple version, we'll just redirect to login and hope the server handles it
    // Or better, we can have a logout route. Let's assume we handle it via a simple API call.
    try {
      // Clear the cookie via a dummy API or client side if possible
      // Since it's HTTP Only, we need an API.
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed', error);
      router.push('/login');
    }
  };

  return (
    <>
      {/* Mobile Toggle */}
      <div className={cn("lg:hidden fixed top-4 left-4 z-[45]", isOpen && "hidden")}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="p-2 bg-white/80 backdrop-blur-md border-slate-200"
        >
          <Menu size={20} className="text-slate-800" />
        </Button>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[45]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 shadow-2xl",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                P
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">PM Manager</h1>
            </div>
            <button onClick={() => setIsOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-white transition-colors">
               <X size={20} />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group",
                    isActive
                      ? "bg-indigo-600/10 text-indigo-400 font-medium"
                      : "hover:bg-slate-800 hover:text-white"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon size={20} className={cn(
                    "transition-colors",
                    isActive ? "text-indigo-500" : "text-slate-500 group-hover:text-slate-300"
                  )} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors group text-left"
            >
              <LogOut size={20} className="text-slate-500 group-hover:text-red-500" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
