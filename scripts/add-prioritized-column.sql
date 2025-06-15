-- Add the missing prioritized column to the tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS prioritized BOOLEAN DEFAULT FALSE;

-- Update existing high priority tasks to be prioritized
UPDATE tasks 
SET prioritized = TRUE 
WHERE priority = 'high';

-- Add an index for better performance on prioritized queries
CREATE INDEX IF NOT EXISTS idx_tasks_prioritized ON tasks(prioritized);

-- Add a composite index for user + prioritized queries
CREATE INDEX IF NOT EXISTS idx_tasks_user_prioritized ON tasks(user_id, prioritized, created_at DESC);
