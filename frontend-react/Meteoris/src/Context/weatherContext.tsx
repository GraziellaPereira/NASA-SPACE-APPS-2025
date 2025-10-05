import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";


// Tipo genérico para os dados climáticos
interface WeatherData {
  previsao?: {
    cidade: string;
    uf: string;
    mes: number;
    ano: number;
    temperatura_media: number;
    precipitacao_mm: number;
    chance_chuva: string;
  };
  plots?: {
    plot_temperaturas: string;
    plot_temp_precip: string;
    plot_umidade: string;
  };
  recomendacao?: string;
}

// Contexto
interface WeatherContextType {
  weatherData: WeatherData | null;
  setWeatherData: (data: WeatherData | null) => void;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

// Provider
export const WeatherProvider = ({ children }: { children: ReactNode }) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

  return (
    <WeatherContext.Provider value={{ weatherData, setWeatherData }}>
      {children}
    </WeatherContext.Provider>
  );
};

// Hook para usar o contexto em qualquer componente
export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error("useWeather deve ser usado dentro de um WeatherProvider");
  }
  return context;
};
