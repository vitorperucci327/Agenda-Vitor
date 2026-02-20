import { Check, ChevronDown, UserPlus, Edit, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import ShareTaskForm from './ShareTaskForm';
import EditTaskForm from './EditTaskForm';
import SubTaskItem from './SubTaskItem';

interface Task {
  id: number;
  title: string;
  description: string;
  status: number;
  dueDate: string;
  completed: boolean;
  sharedWith: string;
  priority: number;
}

interface SubTask {
  id: number;
  title: string;
  completed: boolean;
  taskId: number;
}

interface TaskItemProps {
  task: Task;
  onUpdate: () => void;
}

export default function TaskItem({ task, onUpdate }: TaskItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showShareForm, setShowShareForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtask, setNewSubtask] = useState('');

  const fetchSubtasks = async () => {
    const response = await fetch(`/api/tasks/${task.id}/subtasks`);
    const data = await response.json();
    setSubtasks(data);
  };

  useEffect(() => {
    if (isExpanded) {
      fetchSubtasks();
    }
  }, [isExpanded]);

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;

    await fetch(`/api/tasks/${task.id}/subtasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newSubtask }),
    });
    setNewSubtask('');
    fetchSubtasks();
  };

  const handleToggleComplete = async () => {
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !task.completed }),
    });
    onUpdate();
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStatus = parseInt(e.target.value, 10);
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    onUpdate();
  };

  const priorityColor = {
    0: 'bg-green-500',
    1: 'bg-yellow-500',
    2: 'bg-red-500',
  }[task.priority || 0];

  return (
    <>
      {showShareForm && <ShareTaskForm taskId={task.id} onClose={() => setShowShareForm(false)} onTaskShared={onUpdate} />}
      {showEditForm && <EditTaskForm task={task} onClose={() => setShowEditForm(false)} onTaskUpdated={onUpdate} />}
      <div className="relative bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200/80 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-lg ${priorityColor}`}></div>
        <div className="flex items-start justify-between ml-4">
          <div className="flex items-start space-x-4">
            <button 
              onClick={handleToggleComplete}
              className={`w-5 h-5 mt-1 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${task.completed ? 'bg-indigo-600 border-indigo-600 scale-110' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'}`}>
              {task.completed && <Check size={12} className="text-white" />}
            </button>
            <div>
              <p className={`font-medium ${task.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-50'}`}>{task.title}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Vence em: {new Date(task.dueDate).toLocaleDateString()}</p>
            </div>
          </div>
          <button onClick={() => setIsExpanded(!isExpanded)} className={`text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            <ChevronDown size={20} />
          </button>
        </div>
        {isExpanded && (
          <div className="mt-4 pl-9 space-y-4 animate-fade-in">
            <div>
              <label htmlFor={`status-${task.id}`} className="text-sm font-medium text-slate-700 dark:text-slate-300">Progresso: {task.status}%</label>
              <input 
                type="range" 
                id={`status-${task.id}`}
                min="0" 
                max="100" 
                value={task.status}
                onChange={handleStatusChange}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
            {task.description && (
              <div className="text-sm text-slate-600 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-700/50 p-3 rounded-md">
                <p className="font-medium mb-1">Observações:</p>
                <p className='whitespace-pre-wrap'>{task.description}</p>
              </div>
            )}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Sub-tarefas</h4>
              <div className="space-y-2">
                {subtasks.map(subtask => (
                  <SubTaskItem key={subtask.id} subtask={subtask} onUpdate={fetchSubtasks} onDelete={fetchSubtasks} />
                ))}
              </div>
              <form onSubmit={handleAddSubtask} className="flex items-center space-x-2">
                <input 
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Adicionar sub-tarefa..."
                  className="flex-grow px-3 py-1.5 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button type="submit" className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  <Plus size={16} />
                </button>
              </form>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 dark:border-slate-700/50">
              <div className="flex items-center space-x-4">
                <button onClick={() => setShowShareForm(true)} className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  <UserPlus size={16} />
                  <span>Compartilhar</span>
                </button>
                <button onClick={() => setShowEditForm(true)} className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  <Edit size={16} />
                  <span>Editar</span>
                </button>
              </div>
              {task.sharedWith && (
                <p className="text-sm text-slate-500 dark:text-slate-400">Compartilhado com: <span className='font-medium'>{task.sharedWith}</span></p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
