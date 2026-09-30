import { ITaskRepository, LocalTaskRepository } from './task-repository';
import { SupabaseTaskRepository } from './supabase-task-repository';
import { createClient } from '../supabase/client';

let repositoryInstance: ITaskRepository | null = null;

export function getTaskRepository(): ITaskRepository {
  if (repositoryInstance) return repositoryInstance;

  const supabase = createClient();
  if (supabase) {
    repositoryInstance = new SupabaseTaskRepository(supabase);
  } else {
    // Graceful offline & local demo repository
    repositoryInstance = new LocalTaskRepository();
  }

  return repositoryInstance;
}

export * from './task-repository';
export * from './supabase-task-repository';
