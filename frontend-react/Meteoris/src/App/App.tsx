import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SideBar } from "../Components/sideBar";
import { Dashboard } from "../Components/dashBoard";
import { MoreInformation } from "../Components/moreInformation";
import { MyMap } from "../Components/map";
import { LoadScript } from "@react-google-maps/api";
import { WeatherProvider } from "../Context/weatherContext"; // 👈 import do contexto
import "./stylesApp.css";

export function App() {
  return (
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={["places"]}
    >
      {/* 👇 Envolvemos tudo no WeatherProvider */}
      <WeatherProvider>
        <Router>
          <div className="globalContainer">
            <SideBar />
            <main className="mainContent">
              <div className="contentWrapper">
                <Routes>
                  <Route path="/" element={<MyMap />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/moreInformation" element={<MoreInformation />} />
                </Routes>
              </div>
            </main>
          </div>
        </Router>
      </WeatherProvider>
    </LoadScript>
  );
}
