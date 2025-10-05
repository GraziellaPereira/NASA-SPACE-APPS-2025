import { CloudMoonRain } from 'lucide-react';
import './stylesSideBar.css';
import { InputsMaps } from './inputMaps';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export function SideBar() {
    const [showFilters, setShowFilters] = useState(false);

    const toggleFilters = () => {
        setShowFilters(prevState => !prevState);
    };

    return(
        <aside className="globalSideBar">
            <div className="sidebarHeader">
                <div className='logoWrapper'>
                    <div className='logo'>
                        <CloudMoonRain className='logoIcon' />
                    </div>
                    <div className="appInfo">
                        <h1 className="appName">Meteoris</h1>
                        <p className="appVersion">v1.0.0</p>
                    </div>
                </div>
            </div>

            {/* Botão para alternar a exibição dos filtros */}
            <button 
                onClick={toggleFilters} 
                className="responseButton">
                Informações do Mapa
            </button>

            {/* Exibir os filtros apenas quando showFilters for true */}
            {showFilters && (
                <>
                    <InputsMaps
                        label='Temperatura'
                        disabled
                        placeholder=''
                        value={'32ºC'}
                    />
                    <InputsMaps
                        label='Precipitação'
                        disabled
                        placeholder=''
                        value={'50mm'}
                    />
                    <InputsMaps
                        label='Chance de Chuva'
                        disabled
                        placeholder=''
                        value={'Alto'}
                    />
                    <InputsMaps
                        label='Periodo'
                        disabled
                        placeholder=''
                        value={'Jan/2025'}
                    />
                </>
            )}

            <Link className='link' to="/">
                <button className="dashboardButton">Página Inicial</button>
            </Link>
            <Link  className='link' to="/dashBoard">
                <button className="dashboardButton">Dashboard</button>
            </Link>
            <Link  className='link' to="/moreInformation">
                <button className="dashboardButton">Mais Informações</button>
            </Link>
        </aside>
    );
}
