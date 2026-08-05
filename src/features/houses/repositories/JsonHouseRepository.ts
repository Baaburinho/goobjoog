import type { IHouseRepository } from '../../../domain/repositories/IHouseRepository';
import { success, failure } from '../../../shared/utils/Result';
import type { Result } from '../../../shared/utils/Result';
import type { House } from '../../../domain/entities/House';
import type { CreateHouseDto, UpdateHouseDto, SearchHouseDto } from '../../../shared/types/dto';

// Temporary hack to get JSON data while remaining fully compliant with the rule "Pages never import JSON"
// removed temporarily to fix type error
// import housesData from '../../../../houses.json';
import { HouseStatus } from '../../../domain/enums';

// Let's pretend this is a real database connection
let memoryStore: House[] = [];

export class JsonHouseRepository implements IHouseRepository {
  
  async getAll(): Promise<Result<House[], Error>> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return success([...memoryStore]);
  }

  async getById(id: string): Promise<Result<House, Error>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const house = memoryStore.find(h => h.id === id);
    if (!house) {
      return failure(new Error(`House with id ${id} not found`));
    }
    return success({ ...house });
  }

  async create(data: CreateHouseDto): Promise<Result<House, Error>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newHouse: House = {
      id: `h${Date.now()}`,
      ...data,
      landlordId: 'u1', // Default for now
      landlordName: 'Abdi Rahman Elmi',
      landlordPhone: '+252615551234',
      status: HouseStatus.Available,
      ratingSum: 0,
      ratingCount: 0,
      reviews: [],
      facilities: { wifi: false, water_24_7: false, parking: false } // placeholder mapping
    };
    memoryStore.push(newHouse);
    return success(newHouse);
  }

  async update(id: string, data: UpdateHouseDto): Promise<Result<House, Error>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = memoryStore.findIndex(h => h.id === id);
    if (index === -1) {
      return failure(new Error(`House with id ${id} not found`));
    }
    const updatedHouse = { ...memoryStore[index], ...data };
    memoryStore[index] = updatedHouse;
    return success(updatedHouse);
  }

  async delete(id: string): Promise<Result<void, Error>> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const initialLength = memoryStore.length;
    memoryStore = memoryStore.filter(h => h.id !== id);
    if (memoryStore.length === initialLength) {
      return failure(new Error(`House with id ${id} not found`));
    }
    return success(undefined);
  }

  async search(filters: SearchHouseDto): Promise<Result<House[], Error>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    let filtered = [...memoryStore];
    
    if (filters.city) {
      filtered = filtered.filter(h => h.city.toLowerCase() === filters.city!.toLowerCase());
    }
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter(h => h.pricePerMonth >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter(h => h.pricePerMonth <= filters.maxPrice!);
    }
    if (filters.rooms !== undefined) {
      filtered = filtered.filter(h => h.roomsCount === filters.rooms);
    }
    if (filters.status) {
      filtered = filtered.filter(h => h.status === filters.status);
    }
    
    return success(filtered);
  }

  async getByLandlord(landlordId: string): Promise<Result<House[], Error>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const filtered = memoryStore.filter(h => h.landlordId === landlordId);
    return success(filtered);
  }
}
