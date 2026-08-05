import { success, failure } from '../../utils/Result';
import type { Result } from '../../utils/Result';

export interface IStorageService {
  get<T>(key: string): Result<T, Error>;
  set<T>(key: string, value: T): Result<void, Error>;
  remove(key: string): Result<void, Error>;
  clear(): Result<void, Error>;
}

export class LocalStorageService implements IStorageService {
  get<T>(key: string): Result<T, Error> {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return failure(new Error(`Item with key '${key}' not found`));
      }
      return success(JSON.parse(item) as T);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error('Failed to parse item'));
    }
  }

  set<T>(key: string, value: T): Result<void, Error> {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return success(undefined);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error('Failed to set item'));
    }
  }

  remove(key: string): Result<void, Error> {
    try {
      localStorage.removeItem(key);
      return success(undefined);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error('Failed to remove item'));
    }
  }

  clear(): Result<void, Error> {
    try {
      localStorage.clear();
      return success(undefined);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error('Failed to clear storage'));
    }
  }
}

// Singleton instance
export const storageService = new LocalStorageService();
