import { GoogleMap, Marker, Autocomplete } from '@react-google-maps/api';
import { useRef, useState } from 'react';
import './stylesMap.css';

const containerStyle = {
  width: '100%',
  height: '100vh',
};

const initialCenter = {
  lat: -19.5903,
  lng: -46.9431,
};


export function MyMap() {
  const [markerPosition, setMarkerPosition] = useState(initialCenter);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return;
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    setMarkerPosition({ lat, lng });
    console.log('🗺️ Clique no mapa:', { lat, lng });
  };

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (!place || !place.geometry || !place.geometry.location) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    setMarkerPosition({ lat, lng });
    map?.panTo({ lat, lng });
    map?.setZoom(13);

    console.log('📍 Local pesquisado:', { lat, lng });
  };

  const handleSearch = () => {
    console.log('🔍 Filtros aplicados:');
    console.log('Cidade:', autocompleteRef.current?.getPlace()?.formatted_address);
    console.log('Ano:', year);
    console.log('Mês:', month);

    // Aqui você pode integrar uma função para buscar dados filtrados
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Controles de busca */}
      <div className="map-controls">
        <div className="filter-group">
          <Autocomplete
            onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
            onPlaceChanged={handlePlaceChanged}
          >
            <input type="text" placeholder="Buscar cidade..." className="map-input" />
          </Autocomplete>

          <input
            type="number"
            placeholder="Ano"
            className="map-input small"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            min="1900"
            max="2100"
          />

          <select
            className="map-input small"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          >
            <option value="">Mês</option>
            <option value="01">Janeiro</option>
            <option value="02">Fevereiro</option>
            <option value="03">Março</option>
            <option value="04">Abril</option>
            <option value="05">Maio</option>
            <option value="06">Junho</option>
            <option value="07">Julho</option>
            <option value="08">Agosto</option>
            <option value="09">Setembro</option>
            <option value="10">Outubro</option>
            <option value="11">Novembro</option>
            <option value="12">Dezembro</option>
          </select>

          <button className="map-button" onClick={handleSearch}>Buscar</button>
        </div>
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
