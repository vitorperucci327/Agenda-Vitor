/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AllTasks from './pages/AllTasks';
import { useTheme } from './contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { useNotifications } from './hooks/useNotifications';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  useNotifications();

  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="min-h-screen font-sans bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50">
      <header className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center py-4">
          <div>
            <h1 className="text-xl font-bold">Minha Agenda</h1>
          </div>
          <nav className='flex items-center space-x-6'>
            <Link to="/" className='text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors'>Dashboard</Link>
            <Link to="/tasks" className='text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors'>Todas as Tarefas</Link>
            <button onClick={toggleTheme} className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-10">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<AllTasks />} />
        </Routes>
      </main>
    </div>
  );
}
