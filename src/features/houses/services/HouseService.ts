import { RepositoryFactory } from '../../../domain/repositories/RepositoryFactory';
import type { House } from '../../../domain/entities/House';
import type { Result } from '../../../shared/utils/Result';
import type { CreateHouseDto, UpdateHouseDto, SearchHouseDto } from '../../../shared/types/dto';

export class HouseService {
  private repository = RepositoryFactory.getHouseRepository();

  async getAllHouses(): Promise<Result<House[], Error>> {
    return await this.repository.getAll();
  }

  async getHouseById(id: string): Promise<Result<House, Error>> {
    return await this.repository.getById(id);
  }

  async createHouse(data: CreateHouseDto): Promise<Result<House, Error>> {
    // Add business validation logic here
    if (data.pricePerMonth <= 0) {
      return { isSuccess: false, isFailure: true, error: new Error('Price must be greater than zero') };
    }
    return await this.repository.create(data);
  }

  async updateHouse(id: string, data: UpdateHouseDto): Promise<Result<House, Error>> {
    return await this.repository.update(id, data);
  }

  async deleteHouse(id: string): Promise<Result<void, Error>> {
    return await this.repository.delete(id);
  }

  async searchHouses(filters: SearchHouseDto): Promise<Result<House[], Error>> {
    return await this.repository.search(filters);
  }
}

// Singleton instance
export const houseService = new HouseService();
