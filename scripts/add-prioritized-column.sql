-- Add the missing prioritized column to the tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS prioritized BOOLEAN DEFAULT FALSE;

-- Update existing tasks to set prioritized based on priority level
UPDATE tasks SET prioritized = TRUE WHERE priority = 'high' AND prioritized IS NULL;
UPDATE tasks SET prioritized = FALSE WHERE prioritized IS NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_prioritized ON tasks(prioritized);
CREATE INDEX IF NOT EXISTS idx_tasks_user_prioritized ON tasks(user_id, prioritized, created_at DESC);

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'tasks' AND column_name = 'prioritized';
