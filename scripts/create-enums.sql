-- Create enums for better type safety and consistency
DO $$ BEGIN
    CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'done');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update existing tables to use enums (if they exist)
DO $$ 
BEGIN
    -- Update tasks table to use enum types
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks') THEN
        -- Add new columns with enum types
        ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority_new task_priority DEFAULT 'medium';
        ALTER TABLE tasks ADD COLUMN IF NOT EXISTS status_new task_status DEFAULT 'todo';
        
        -- Copy data from old columns to new enum columns
        UPDATE tasks SET 
            priority_new = priority::task_priority,
            status_new = status::task_status
        WHERE priority IS NOT NULL AND status IS NOT NULL;
        
        -- Drop old columns and rename new ones
        ALTER TABLE tasks DROP COLUMN IF EXISTS priority CASCADE;
        ALTER TABLE tasks DROP COLUMN IF EXISTS status CASCADE;
        ALTER TABLE tasks RENAME COLUMN priority_new TO priority;
        ALTER TABLE tasks RENAME COLUMN status_new TO status;
        
        -- Set NOT NULL constraints
        ALTER TABLE tasks ALTER COLUMN priority SET NOT NULL;
        ALTER TABLE tasks ALTER COLUMN status SET NOT NULL;
    END IF;
END $$;
