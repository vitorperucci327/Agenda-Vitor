import { useEffect, useState } from 'react';
import AddTaskForm from '../components/AddTaskForm';
import TaskColumn from '../components/TaskColumn';
import { Plus } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  description: string;
  status: number;
  dueDate: string;
  completed: boolean;
  sharedWith: string;
}

export default function Dashboard() {
  const [todaysTasks, setTodaysTasks] = useState<Task[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);

  const fetchTasks = () => {
    fetch('/api/tasks')
      .then((res) => res.json())
      .then((data) => {
        setTodaysTasks(data.todaysTasks || []);
        setOverdueTasks(data.overdueTasks || []);
        setUpcomingTasks(data.upcomingTasks || []);
      });
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <>
      {showAddTaskForm && <AddTaskForm onClose={() => setShowAddTaskForm(false)} onTaskAdded={fetchTasks} />}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">Visão geral das suas tarefas.</p>
        </div>
        <button 
            onClick={() => setShowAddTaskForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-indigo-700 transition-colors">
            <Plus size={20} />
            <span>Nova Tarefa</span>
          </button>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        <TaskColumn title="Tarefas de Hoje" tasks={todaysTasks} onUpdate={fetchTasks} />
        <TaskColumn title="Próximas Tarefas" tasks={upcomingTasks} onUpdate={fetchTasks} titleColor="text-sky-500 dark:text-sky-400" />
        <TaskColumn title="Tarefas Atrasadas" tasks={overdueTasks} onUpdate={fetchTasks} titleColor="text-red-500 dark:text-red-400" />
      </div>
    </>
  );
}
