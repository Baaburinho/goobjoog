import { Geolocation } from '@capacitor/geolocation';

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export const requestAndGetCurrentLocation = async (): Promise<LocationCoords> => {
  try {
    // Try Capacitor native location permission & location fetch
    const status = await Geolocation.checkPermissions();
    if (status.location !== 'granted') {
      const requested = await Geolocation.requestPermissions();
      if (requested.location !== 'granted') {
        throw new Error('Location permission denied');
      }
    }
    const pos = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 3000
    });
    return {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude
    };
  } catch (nativeErr) {
    console.warn('Native geolocation request failed, falling back to browser geolocation:', nativeErr);
    // Fallback to standard web navigator.geolocation
    return new Promise<LocationCoords>((resolve, reject) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        reject(new Error('Geolocation is not supported on this device.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }
};
