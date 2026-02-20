import { useEffect, useState } from 'react';
import TaskItem from '../components/TaskItem';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { AnimatePresence } from 'framer-motion';

interface Task {
  id: number;
  title: string;
  description: string;
  status: number;
  dueDate: string;
  completed: boolean;
  sharedWith: string;
  position: number;
}

export default function AllTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchAllTasks = (search = '', currentFilter = 'all') => {
    fetch(`/api/tasks/all?search=${search}&filter=${currentFilter}`)
      .then((res) => res.json())
      .then(setTasks);
  };

  useEffect(() => {
    fetchAllTasks(searchTerm, filter);
  }, [searchTerm, filter]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;

    if (!destination) return;

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const reorderedTasks = Array.from(tasks);
    const [removed] = reorderedTasks.splice(source.index, 1);
    reorderedTasks.splice(destination.index, 0, removed);

    setTasks(reorderedTasks);

    const updatedPositions = reorderedTasks.map((task, index) => ({
      id: task.id,
      position: index,
    }));

    fetch('/api/tasks/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tasks: updatedPositions }),
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Todas as Tarefas</h1>
        <p className="text-slate-500 dark:text-slate-400">Pesquise, filtre e gerencie todas as suas tarefas em um só lugar.</p>
      </div>
      <div className="mb-6 flex justify-between items-center gap-4">
        <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg">
            <button onClick={() => setFilter('all')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'all' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-slate-50' : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-50'}`}>Todas</button>
            <button onClick={() => setFilter('pending')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'pending' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-slate-50' : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-50'}`}>Pendentes</button>
            <button onClick={() => setFilter('completed')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'completed' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-slate-50' : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-50'}`}>Concluídas</button>
          </div>
        <div className="w-full max-w-sm">
          <input 
            type="text"
            placeholder="Pesquisar tarefas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
          />
        </div>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="all-tasks">
          {(provided) => (
            <div 
              {...provided.droppableProps} 
              ref={provided.innerRef}
              className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4"
            >
              <AnimatePresence>
                {tasks.length > 0 ? (
                  tasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <TaskItem task={task} onUpdate={() => fetchAllTasks(searchTerm, filter)} />
                      </div>
                    )}
                  </Draggable>
                  ))
                ) : (
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Nenhuma tarefa encontrada para os filtros selecionados.</p>
                )}
              </AnimatePresence>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
