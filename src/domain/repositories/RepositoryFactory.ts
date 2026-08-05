import type { IHouseRepository } from './IHouseRepository';
import { JsonHouseRepository } from '../../features/houses/repositories/JsonHouseRepository';

export class RepositoryFactory {
  // In a real dependency injection setup, this would be more dynamic.
  // For V1, we just return the JSON implementation.
  // Once we build an ApiHouseRepository, we can toggle it here based on config.
  
  static getHouseRepository(): IHouseRepository {
    return new JsonHouseRepository();
  }
}
