import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 
import { SideBar } from "../Components/sideBar";
import { Dashboard } from "../Components/dashBoard"; // Importe a página Dashboard
import "./stylesApp.css"; 
import { MoreInformation } from '../Components/moreInformation';

export function App() {
  return (
    <Router>
      <div className="globalContainer">
        <SideBar />
        <main className="mainContent">
          <div className="contentWrapper">
            <Routes>
              <Route path="/" element={<h1>Bem-vindo ao Maps</h1>} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/moreInformation" element={<MoreInformation />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}
