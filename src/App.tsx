/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AllTasks from './pages/AllTasks';
import { useNotifications } from './hooks/useNotifications';

export default function App() {
  useNotifications();

  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="min-h-screen font-sans bg-slate-50 text-slate-900">
      <header className="bg-white/75 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center py-4">
          <div>
            <h1 className="text-xl font-bold">Minha Agenda</h1>
          </div>
          <nav className='flex items-center space-x-6'>
            <Link to="/" className='text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors'>Dashboard</Link>
            <Link to="/tasks" className='text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors'>Todas as Tarefas</Link>
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
