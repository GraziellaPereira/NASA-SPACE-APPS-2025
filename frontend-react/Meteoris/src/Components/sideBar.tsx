import { CloudMoonRain } from "lucide-react";
import "./stylesSideBar.css";
import { InputsMaps } from "./inputMaps";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useWeather } from "../Context/weatherContext"; // 👈 importa o contexto

export function SideBar() {
  const [showFilters, setShowFilters] = useState(false);
  const { weatherData } = useWeather(); // 👈 acessa os dados globais do clima

  const toggleFilters = () => {
    setShowFilters((prevState) => !prevState);
  };

  // Se ainda não há dados, podemos deixar placeholders amigáveis
  const previsao = weatherData?.previsao;
  const temperatura = previsao
    ? `${previsao.temperatura_media.toFixed(1)}°C`
    : "—";
  const precipitacao = previsao
    ? `${previsao.precipitacao_mm.toFixed(1)} mm`
    : "—";
  const chanceChuva = previsao?.chance_chuva || "—";
  const periodo = previsao
    ? `${String(previsao.mes).padStart(2, "0")}/${previsao.ano}`
    : "—";
  const recomendacao = weatherData?.recomendacao || "—";

  return (
    <aside className="globalSideBar">
      <div className="sidebarHeader">
        <div className="logoWrapper">
          <div className="logo">
            <CloudMoonRain className="logoIcon" />
          </div>
          <div className="appInfo">
            <h1 className="appName">Meteoris</h1>
            <p className="appVersion">v1.0.0</p>
          </div>
        </div>
      </div>

      {/* Botão para alternar a exibição dos filtros */}
      <button onClick={toggleFilters} className="responseButton">
        Informações do Mapa
      </button>

      {/* Exibir os filtros apenas quando showFilters for true */}
      {showFilters && (
        <>
          <InputsMaps label="Temperatura" disabled value={temperatura} />
          <InputsMaps label="Precipitação" disabled value={precipitacao} />
          <InputsMaps label="Chance de Chuva" disabled value={chanceChuva} />
          <InputsMaps label="Período" disabled value={periodo} />
          <InputsMaps label="Recomendação" disabled value={recomendacao} />
        </>
      )}

      {/* Botões de navegação */}
      <Link className="link" to="/">
        <button className="dashboardButton">Página Inicial</button>
      </Link>
      <Link className="link" to="/dashboard">
        <button className="dashboardButton">Dashboard</button>
      </Link>
      <Link className="link" to="/moreInformation">
        <button className="dashboardButton">Mais Informações</button>
      </Link>
    </aside>
  );
}
