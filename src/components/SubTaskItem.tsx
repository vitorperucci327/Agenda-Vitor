import { Trash2 } from 'lucide-react';

interface SubTask {
  id: number;
  title: string;
  completed: boolean;
}

interface SubTaskItemProps {
  subtask: SubTask;
  onUpdate: () => void;
  onDelete: () => void;
}

export default function SubTaskItem({ subtask, onUpdate, onDelete }: SubTaskItemProps) {

  const handleToggleComplete = async () => {
    await fetch(`/api/subtasks/${subtask.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !subtask.completed }),
    });
    onUpdate();
  };

  const handleDelete = async () => {
    await fetch(`/api/subtasks/${subtask.id}`, {
      method: 'DELETE',
    });
    onDelete();
  };

  return (
    <div className="flex items-center justify-between p-2 rounded-md bg-slate-200/50 dark:bg-slate-700/50">
      <div className="flex items-center space-x-3">
        <input 
          type="checkbox" 
          checked={subtask.completed}
          onChange={handleToggleComplete}
          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-300 dark:bg-slate-600 border-slate-400 dark:border-slate-500"
        />
        <span className={`${subtask.completed ? 'line-through text-slate-500 dark:text-slate-400' : ''}`}>
          {subtask.title}
        </span>
      </div>
      <button onClick={handleDelete} className="text-slate-400 hover:text-red-500 dark:hover:text-red-400">
        <Trash2 size={16} />
      </button>
    </div>
  );
}
