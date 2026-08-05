import React, { useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icons not resolving correctly in bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapPickerProps {
  initialPosition?: { lat: number; lng: number };
  onPositionSelect: (lat: number, lng: number) => void;
  readOnly?: boolean;
}

export const MapPicker: React.FC<MapPickerProps> = ({ 
  initialPosition = { lat: 2.0469, lng: 45.3182 }, // Mogadishu Default Center
  onPositionSelect,
  readOnly = false 
}) => {
  const [position, setPosition] = useState(initialPosition);
  const markerRef = useRef<L.Marker>(null);

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        if (readOnly) return;
        setPosition(e.latlng);
        onPositionSelect(e.latlng.lat, e.latlng.lng);
      },
    });

    const eventHandlers = useMemo(
      () => ({
        dragend() {
          const marker = markerRef.current;
          if (marker != null) {
            const newPos = marker.getLatLng();
            setPosition(newPos);
            onPositionSelect(newPos.lat, newPos.lng);
          }
        },
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [onPositionSelect],
    );

    return position === null ? null : (
      <Marker
        draggable={!readOnly}
        eventHandlers={eventHandlers}
        position={position}
        ref={markerRef}
      ></Marker>
    );
  };

  return (
    <div className="w-full h-full min-h-[250px] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 z-0 relative shadow-inner bg-slate-50 dark:bg-slate-950/50">
      <MapContainer 
        center={position} 
        zoom={13} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker />
      </MapContainer>
    </div>
  );
};
