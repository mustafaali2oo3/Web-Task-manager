-- Update tasks table to ensure priority column has proper constraints
ALTER TABLE tasks 
DROP CONSTRAINT IF EXISTS tasks_priority_check;

ALTER TABLE tasks 
ADD CONSTRAINT tasks_priority_check 
CHECK (priority IN ('low', 'medium', 'high'));

-- Update status column constraints as well for consistency
ALTER TABLE tasks 
DROP CONSTRAINT IF EXISTS tasks_status_check;

ALTER TABLE tasks 
ADD CONSTRAINT tasks_status_check 
CHECK (status IN ('todo', 'in_progress', 'done'));

-- Add index on priority for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);

-- Add index on status for better query performance  
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Add composite index for user queries
CREATE INDEX IF NOT EXISTS idx_tasks_user_created ON tasks(user_id, created_at DESC);
