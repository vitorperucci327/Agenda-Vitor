import express from 'express';
import { createServer as createViteServer } from 'vite';
import db from './src/db';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes will go here
  app.post('/api/tasks/:id/share', (req, res) => {
    try {
      const { id } = req.params;
      const { sharedWith } = req.body;

      if (!sharedWith) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const stmt = db.prepare('UPDATE tasks SET sharedWith = ? WHERE id = ?');
      stmt.run(sharedWith, id);
      
      res.json({ message: 'Task shared successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Something went wrong' });
    }
  });

  app.put('/api/tasks/:id', (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, dueDate, completed, status, priority } = req.body;

      const updates: { col: string, val: any }[] = [];
      if (title) updates.push({ col: 'title', val: title });
      if (description) updates.push({ col: 'description', val: description });
      if (dueDate) updates.push({ col: 'dueDate', val: dueDate });
      if (typeof completed !== 'undefined') updates.push({ col: 'completed', val: completed ? 1 : 0 });
      if (typeof status !== 'undefined') updates.push({ col: 'status', val: status });
      if (typeof priority !== 'undefined') updates.push({ col: 'priority', val: priority });

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No update fields provided' });
      }

      const setClause = updates.map(u => `${u.col} = ?`).join(', ');
      const params = updates.map(u => u.val);
      params.push(id);

      const stmt = db.prepare(`UPDATE tasks SET ${setClause} WHERE id = ?`);
      stmt.run(...params);

      res.json({ message: 'Task updated successfully' });
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ error: 'Something went wrong' });
    }
  });

  app.post('/api/tasks', (req, res) => {
    try {
      const { title, description, dueDate, priority } = req.body;
      if (!title || !dueDate) {
        return res.status(400).json({ error: 'Title and due date are required' });
      }

      const countStmt = db.prepare('SELECT COUNT(*) as count FROM tasks');
      const { count } = countStmt.get();

      const stmt = db.prepare('INSERT INTO tasks (title, description, dueDate, position, priority) VALUES (?, ?, ?, ?, ?)');
      const info = stmt.run(title, description, dueDate, count, priority || 0);
      res.status(201).json({ id: info.lastInsertRowid });
    } catch (error) {
      console.error('Error adding task:', error);
      res.status(500).json({ error: 'Failed to add task', details: error.message });
    }
  });

  app.post('/api/tasks/reorder', (req, res) => {
    try {
      const { tasks } = req.body;
      if (!Array.isArray(tasks)) {
        return res.status(400).json({ error: 'Invalid request body' });
      }

      const stmt = db.prepare('UPDATE tasks SET position = ? WHERE id = ?');
      const transaction = db.transaction((tasks) => {
        for (const task of tasks) {
          stmt.run(task.position, task.id);
        }
      });

      transaction(tasks);

      res.json({ message: 'Tasks reordered successfully' });
    } catch (error) {
      console.error('Error reordering tasks:', error);
      res.status(500).json({ error: 'Something went wrong' });
    }
  });

  app.get('/api/tasks/all', (req, res) => {
    try {
      const searchTerm = req.query.search || '';
      const filter = req.query.filter || 'all'; // all, completed, pending

      let whereClause = 'WHERE title LIKE ?';
      const params = [`%${searchTerm}%`];

      if (filter === 'completed') {
        whereClause += ' AND completed = TRUE';
      } else if (filter === 'pending') {
        whereClause += ' AND completed = FALSE';
      }

      const query = `
        SELECT * FROM tasks 
        ${whereClause}
        ORDER BY position ASC
      `;
      const tasks = db.prepare(query).all(params);
      res.json(tasks);
    } catch (error) {
      console.error('Error fetching all tasks:', error);
      res.status(500).json({ error: 'Something went wrong' });
    }
  });

  app.get('/api/tasks', (req, res) => {
    try {
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];

      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      const nextWeekString = nextWeek.toISOString().split('T')[0];

      const todaysTasks = db.prepare('SELECT * FROM tasks WHERE dueDate = ? AND completed = FALSE').all(todayString);
      const overdueTasks = db.prepare('SELECT * FROM tasks WHERE dueDate < ? AND completed = FALSE').all(todayString);
      const upcomingTasks = db.prepare('SELECT * FROM tasks WHERE dueDate > ? AND dueDate <= ? AND completed = FALSE ORDER BY dueDate ASC').all(todayString, nextWeekString);

      res.json({ todaysTasks, overdueTasks, upcomingTasks });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Something went wrong' });
    }
  });

  app.get('/api/tasks/:taskId/subtasks', (req, res) => {
    try {
      const { taskId } = req.params;
      const subtasks = db.prepare('SELECT * FROM sub_tasks WHERE taskId = ?').all(taskId);
      res.json(subtasks);
    } catch (error) {
      console.error('Error fetching subtasks:', error);
      res.status(500).json({ error: 'Something went wrong' });
    }
  });

  app.post('/api/tasks/:taskId/subtasks', (req, res) => {
    try {
      const { taskId } = req.params;
      const { title } = req.body;
      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }
      const stmt = db.prepare('INSERT INTO sub_tasks (title, taskId) VALUES (?, ?)');
      const info = stmt.run(title, taskId);
      res.status(201).json({ id: info.lastInsertRowid });
    } catch (error) {
      console.error('Error adding subtask:', error);
      res.status(500).json({ error: 'Something went wrong' });
    }
  });

  app.put('/api/subtasks/:id', (req, res) => {
    try {
      const { id } = req.params;
      const { completed } = req.body;
      const stmt = db.prepare('UPDATE sub_tasks SET completed = ? WHERE id = ?');
      stmt.run(completed ? 1 : 0, id);
      res.json({ message: 'Subtask updated successfully' });
    } catch (error) {
      console.error('Error updating subtask:', error);
      res.status(500).json({ error: 'Something went wrong' });
    }
  });

  app.delete('/api/subtasks/:id', (req, res) => {
    try {
      const { id } = req.params;
      const stmt = db.prepare('DELETE FROM sub_tasks WHERE id = ?');
      stmt.run(id);
      res.json({ message: 'Subtask deleted successfully' });
    } catch (error) {
      console.error('Error deleting subtask:', error);
      res.status(500).json({ error: 'Something went wrong' });
    }
  });

  app.get('/api/tasks/:taskId/subtasks', (req, res) => {
    try {
      const { taskId } = req.params;
      const subtasks = db.prepare('SELECT * FROM sub_tasks WHERE taskId = ?').all(taskId);
      res.json(subtasks);
    } catch (error) {
      console.error('Error fetching subtasks:', error);
      res.status(500).json({ error: 'Something went wrong' });
    }
  });

  app.post('/api/tasks/:taskId/subtasks', (req, res) => {
    try {
      const { taskId } = req.params;
      const { title } = req.body;
      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }
      const stmt = db.prepare('INSERT INTO sub_tasks (title, taskId) VALUES (?, ?)');
      const info = stmt.run(title, taskId);
      res.status(201).json({ id: info.lastInsertRowid });
    } catch (error) {
      console.error('Error adding subtask:', error);
      res.status(500).json({ error: 'Failed to add subtask' });
    }
  });

  app.put('/api/subtasks/:id', (req, res) => {
    try {
      const { id } = req.params;
      const { completed } = req.body;
      const stmt = db.prepare('UPDATE sub_tasks SET completed = ? WHERE id = ?');
      stmt.run(completed ? 1 : 0, id);
      res.json({ message: 'Subtask updated successfully' });
    } catch (error) {
      console.error('Error updating subtask:', error);
      res.status(500).json({ error: 'Something went wrong' });
    }
  });

  app.delete('/api/subtasks/:id', (req, res) => {
    try {
      const { id } = req.params;
      const stmt = db.prepare('DELETE FROM sub_tasks WHERE id = ?');
      stmt.run(id);
      res.json({ message: 'Subtask deleted successfully' });
    } catch (error) {
      console.error('Error deleting subtask:', error);
      res.status(500).json({ error: 'Something went wrong' });
    }
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
