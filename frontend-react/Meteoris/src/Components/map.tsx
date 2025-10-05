import { GoogleMap, Marker, Autocomplete } from '@react-google-maps/api';
import { useRef, useState } from 'react';
import './stylesMap.css'; // 👈 Importa o CSS novo

const containerStyle = {
  width: '100%',
  height: '600px',
};

const initialCenter = {
  lat: -19.5903,
  lng: -46.9431,
};

export function MyMap() {
  const [markerPosition, setMarkerPosition] = useState(initialCenter);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return;
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    setMarkerPosition({ lat, lng });
    console.log('🗺️ Clique no mapa:');
    console.log('Latitude:', lat);
    console.log('Longitude:', lng);
  };

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (!place || !place.geometry || !place.geometry.location) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    setMarkerPosition({ lat, lng });
    map?.panTo({ lat, lng });
    map?.setZoom(13);

    console.log('📍 Local pesquisado:');
    console.log('Latitude:', lat);
    console.log('Longitude:', lng);
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Barra de busca + botões extras */}
      <div className="map-controls">
        <Autocomplete
          onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
          onPlaceChanged={handlePlaceChanged}
        >
          <input type="text" placeholder="Buscar local..." className="map-input" />
        </Autocomplete>
      </div>

      {/* Mapa */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={markerPosition}
        zoom={13}
        onClick={handleMapClick}
        onLoad={(mapInstance) => setMap(mapInstance)}
      >
        <Marker position={markerPosition} />
      </GoogleMap>
    </div>
  );
}
