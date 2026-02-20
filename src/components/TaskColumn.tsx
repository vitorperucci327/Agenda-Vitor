import TaskItem from './TaskItem';

// This interface will be moved to a central types file later.
interface Task {
  id: number;
  title: string;
  description: string;
  status: number;
  dueDate: string;
  completed: boolean;
  sharedWith: string;
}

interface TaskColumnProps {
  title: string;
  tasks: Task[];
  onUpdate: () => void;
  titleColor?: string;
}

export default function TaskColumn({ title, tasks, onUpdate, titleColor = 'text-slate-900 dark:text-slate-50' }: TaskColumnProps) {
  return (
    <section>
      <h2 className={`text-lg font-semibold mb-4 ${titleColor}`}>{title}</h2>
      <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskItem key={task.id} task={task} onUpdate={onUpdate} />
          ))
        ) : (
          <p className="text-slate-500 dark:text-slate-400 text-sm">Nenhuma tarefa nesta seção.</p>
        )}
      </div>
    </section>
  )
}
