'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface DataContextType {
  projects: any[];
  tasks: any[];
  team: any | null;
  lastUpdated: { [key: string]: number };
  refreshProjects: (force?: boolean) => Promise<void>;
  refreshTasks: (force?: boolean) => Promise<void>;
  refreshTeam: (force?: boolean) => Promise<void>;
  refreshAll: () => Promise<void>;
  optimisticUpdateTask: (taskId: string, newStatus: string) => void;
  isInitialLoading: boolean;
}

const DataContext = createContext<DataContextType>({
  projects: [],
  tasks: [],
  team: null,
  lastUpdated: {},
  refreshProjects: async () => { },
  refreshTasks: async () => { },
  refreshTeam: async () => { },
  refreshAll: async () => { },
  optimisticUpdateTask: () => { },
  isInitialLoading: true,
});

const CACHE_TIME = 60000;

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [team, setTeam] = useState<any | null>(null);
  const [lastUpdated, setLastUpdated] = useState<{ [key: string]: number }>({});
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const shouldFetch = (key: string, force = false) => {
    if (force) return true;
    const last = lastUpdated[key] || 0;
    return Date.now() - last > CACHE_TIME;
  };

  const refreshProjects = useCallback(async (force = false) => {
    if (!shouldFetch('projects', force)) return;
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        setProjects(await res.json());
        setLastUpdated(prev => ({ ...prev, projects: Date.now() }));
      }
    } catch (err) {
      console.error('Projects fetch error:', err);
    }
  }, [lastUpdated]);

  const refreshTasks = useCallback(async (force = false) => {
    if (!shouldFetch('tasks', force)) return;
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        setTasks(await res.json());
        setLastUpdated(prev => ({ ...prev, tasks: Date.now() }));
      }
    } catch (err) {
      console.error('Tasks fetch error:', err);
    }
  }, [lastUpdated]);

  const refreshTeam = useCallback(async (force = false) => {
    if (!shouldFetch('team', force)) return;
    try {
      const res = await fetch('/api/team');
      if (res.ok) {
        setTeam(await res.json());
        setLastUpdated(prev => ({ ...prev, team: Date.now() }));
      }
    } catch (err) {
      console.error('Team fetch error:', err);
    }
  }, [lastUpdated]);

  const refreshAll = useCallback(async () => {
    try {
      await Promise.all([
        refreshProjects(true),
        refreshTasks(true),
        refreshTeam(true)
      ]);
    } finally {
      setIsInitialLoading(false);
    }
  }, [refreshProjects, refreshTasks, refreshTeam]);

  useEffect(() => {
    refreshAll();
  }, []);

  const optimisticUpdateTask = useCallback((taskId: string, newStatus: string) => {
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
  }, []);

  useEffect(() => {
    const handleSync = () => {
      if (document.visibilityState === 'visible') {
        refreshAll();
      }
    };

    window.addEventListener('focus', handleSync);
    window.addEventListener('visibilitychange', handleSync);

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshAll();
      }
    }, CACHE_TIME);

    return () => {
      window.removeEventListener('focus', handleSync);
      window.removeEventListener('visibilitychange', handleSync);
      clearInterval(interval);
    };
  }, [refreshAll]);

  return (
    <DataContext.Provider value={{
      projects,
      tasks,
      team,
      lastUpdated,
      refreshProjects,
      refreshTasks,
      refreshTeam,
      refreshAll,
      optimisticUpdateTask,
      isInitialLoading
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);


