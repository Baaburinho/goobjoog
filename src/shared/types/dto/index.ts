import { HouseStatus } from '../../../domain/enums';

export interface CreateHouseDto {
  title: string;
  description: string;
  pricePerMonth: number;
  depositAmount: number;
  roomsCount: number;
  bathroomsCount: number;
  city: string;
  district: string;
  coordinates: { lat: number; lng: number };
  imageUrl: string;
}

export interface UpdateHouseDto extends Partial<CreateHouseDto> {
  status?: HouseStatus;
}

export interface SearchHouseDto {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  rooms?: number;
  status?: HouseStatus;
}
