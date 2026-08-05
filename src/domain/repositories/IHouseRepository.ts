import type { Result } from '../../shared/utils/Result';
import type { House } from '../entities/House';
import type { CreateHouseDto, UpdateHouseDto, SearchHouseDto } from '../../shared/types/dto';

export interface IHouseRepository {
  getAll(): Promise<Result<House[], Error>>;
  getById(id: string): Promise<Result<House, Error>>;
  create(data: CreateHouseDto): Promise<Result<House, Error>>;
  update(id: string, data: UpdateHouseDto): Promise<Result<House, Error>>;
  delete(id: string): Promise<Result<void, Error>>;
  search(filters: SearchHouseDto): Promise<Result<House[], Error>>;
  getByLandlord(landlordId: string): Promise<Result<House[], Error>>;
}
