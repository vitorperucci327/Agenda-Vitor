import { useEffect } from 'react';

interface Task {
  id: number;
  title: string;
  dueDate: string;
}

const checkUpcomingTasks = async () => {
  const response = await fetch('/api/tasks/all');
  const tasks: Task[] = await response.json();

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  tasks.forEach(task => {
    const dueDate = new Date(task.dueDate);
    if (dueDate > today && dueDate <= tomorrow) {
      new Notification('Lembrete de Tarefa', {
        body: `A tarefa "${task.title}" vence em breve!`,
      });
    }
  });
};

export const useNotifications = () => {
  useEffect(() => {
    if (Notification.permission === 'granted') {
      const intervalId = setInterval(checkUpcomingTasks, 60 * 60 * 1000); // Verifica a cada hora

      return () => clearInterval(intervalId);
    }
  }, []);
};
