import axios from "axios";
import { GoogleMap, Marker, Autocomplete } from '@react-google-maps/api';
import { useRef, useState } from 'react';
import './stylesMap.css';

const containerStyle = { width: '100%', height: '100vh' };

const initialCenter = { lat: -19.5903, lng: -46.9431 };

export function MyMap() {
  const [markerPosition, setMarkerPosition] = useState(initialCenter);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [weatherData, setWeatherData] = useState<any>(null); // Dados retornados do backend

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return;
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setMarkerPosition({ lat, lng });
  };

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (!place?.geometry?.location) return;
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    setMarkerPosition({ lat, lng });
    map?.panTo({ lat, lng });
  };

  const handleSearch = async () => {
    const cidade = autocompleteRef.current?.getPlace()?.address_components?.[0]?.long_name || '';
    const uf = autocompleteRef.current?.getPlace()?.address_components?.find(c => c.types.includes("administrative_area_level_1"))?.short_name || '';

    try {
      const response = await axios.get(`http://localhost:5209/api/WeatherProxy/cityinfo`, {
        params: { cidade, uf, mes: month, ano: year }
      });
      setWeatherData(response.data);
      console.log("✅ Dados recebidos:", response.data);
    } catch (error) {
      console.error("❌ Erro ao buscar dados:", error);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Controles de busca */}
      <div className="map-controls">
        <div className="filter-group">
          <Autocomplete onLoad={(a) => (autocompleteRef.current = a)} onPlaceChanged={handlePlaceChanged}>
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

          <select className="map-input small" value={month} onChange={(e) => setMonth(e.target.value)}>
            <option value="">Mês</option>
            <option value="1">Janeiro</option>
            <option value="2">Fevereiro</option>
            <option value="3">Março</option>
            <option value="4">Abril</option>
            <option value="5">Maio</option>
            <option value="6">Junho</option>
            <option value="7">Julho</option>
            <option value="8">Agosto</option>
            <option value="9">Setembro</option>
            <option value="10">Outubro</option>
            <option value="11">Novembro</option>
            <option value="12">Dezembro</option>
          </select>

          <button className="map-button" onClick={handleSearch}>Buscar</button>
        </div>
      </div>

      {/* Exibir dados */}
      {weatherData && (
        <div className="weather-info">
          <h3>Previsão para {weatherData.previsao.cidade}</h3>
          <p>🌡️ {weatherData.previsao.temperatura_media} °C</p>
          <p>☔ {weatherData.previsao.precipitacao_mm} mm</p>
          <p>💧 Chance de chuva: {weatherData.previsao.chance_chuva}</p>
          <p>💡 {weatherData.recomendacao}</p>
        </div>
      )}

      {/* Mapa */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={markerPosition}
        zoom={13}
        onClick={handleMapClick}
        onLoad={(m) => setMap(m)}
      >
        <Marker position={markerPosition} />
      </GoogleMap>
    </div>
  );
}
