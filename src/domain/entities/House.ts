import { HouseStatus } from '../enums';

export interface House {
  id: string;
  landlordId: string;
  landlordName: string;
  landlordPhone: string;
  city: string;
  district: string;
  title: string;
  description: string;
  pricePerMonth: number;
  depositAmount: number;
  roomsCount: number;
  bathroomsCount: number;
  facilities: {
    wifi: boolean;
    water_24_7: boolean;
    parking: boolean;
  };
  coordinates: { lat: number; lng: number };
  locationSource?: 'GPS_VERIFIED' | 'MAP_SELECTED';
  status: HouseStatus;
  imageUrl: string;
  additionalImages?: string[];
  ratingSum: number;
  ratingCount: number;
  reviews: Array<{ author: string; rating: number; comment: string; date: string }>;
}
