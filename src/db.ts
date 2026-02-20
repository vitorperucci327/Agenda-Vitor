import Database from 'better-sqlite3';

const db = new Database('tasks.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status INTEGER DEFAULT 0,
    dueDate TEXT,
    completed BOOLEAN DEFAULT FALSE,
    sharedWith TEXT
  );

  CREATE TABLE IF NOT EXISTS sub_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    taskId INTEGER,
    FOREIGN KEY (taskId) REFERENCES tasks(id)
  );
`);

// Migration logic to add columns if they don't exist
const columns = db.prepare(`PRAGMA table_info(tasks)`).all();
const columnNames = columns.map((col: any) => col.name);

if (!columnNames.includes('position')) {
  db.exec('ALTER TABLE tasks ADD COLUMN position INTEGER');
}

if (!columnNames.includes('priority')) {
  db.exec('ALTER TABLE tasks ADD COLUMN priority INTEGER DEFAULT 0');
}

export default db;
