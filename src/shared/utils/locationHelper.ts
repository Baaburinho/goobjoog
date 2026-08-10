import { Geolocation } from '@capacitor/geolocation';

export interface CityCoord {
  name: string;
  lat: number;
  lng: number;
}

export const SOMALI_CITIES: CityCoord[] = [
  { name: 'Mogadishu', lat: 2.042, lng: 45.321 },
  { name: 'Baidoa', lat: 3.113, lng: 43.650 },
  { name: 'Kismayo', lat: -0.358, lng: 42.545 },
  { name: 'Hargeisa', lat: 9.562, lng: 44.065 },
  { name: 'Garowe', lat: 8.406, lng: 48.484 },
  { name: 'Bosaso', lat: 11.284, lng: 49.181 },
  { name: 'Galkayo', lat: 6.769, lng: 47.430 },
  { name: 'Beledweyne', lat: 4.735, lng: 45.204 },
  { name: 'Burao', lat: 9.522, lng: 45.533 },
  { name: 'Berbera', lat: 10.439, lng: 45.014 }
];

function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function findClosestSomaliCity(userLat: number, userLng: number): string {
  let closestCity = 'Baidoa';
  let minDistance = Infinity;

  for (const city of SOMALI_CITIES) {
    const distance = getDistanceInKm(userLat, userLng, city.lat, city.lng);
    if (distance < minDistance) {
      minDistance = distance;
      closestCity = city.name;
    }
  }

  return closestCity;
}

export async function detectCurrentCity(): Promise<{ city: string; lat: number; lng: number }> {
  try {
    // 1. Try native Capacitor Geolocation plugin for accurate Android GPS
    const permStatus = await Geolocation.checkPermissions();
    if (permStatus.location !== 'granted') {
      await Geolocation.requestPermissions();
    }
    const pos = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000
    });
    const uLat = pos.coords.latitude;
    const uLng = pos.coords.longitude;
    const detected = findClosestSomaliCity(uLat, uLng);
    return { city: detected, lat: uLat, lng: uLng };
  } catch (nativeErr) {
    console.warn('Capacitor Geolocation fallback to HTML5 browser location:', nativeErr);
  }

  // 2. Fallback to standard web geolocation if Capacitor fails
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ city: 'Baidoa', lat: 3.113, lng: 43.650 });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const city = findClosestSomaliCity(userLat, userLng);
        resolve({ city, lat: userLat, lng: userLng });
      },
      (error) => {
        console.warn('HTML5 Geolocation error or permission denied, defaulting to Baidoa:', error);
        resolve({ city: 'Baidoa', lat: 3.113, lng: 43.650 });
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  });
}
