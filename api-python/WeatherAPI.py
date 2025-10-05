import pyarrow as pa
if hasattr(pa, "unregister_extension_type"):
    try:
        pa.unregister_extension_type("pandas.period")
    except Exception:
        pass

from fastapi import FastAPI, Query, HTTPException
from pydantic import BaseModel
import requests
import joblib
import pandas as pd
import numpy as np
import os
import matplotlib
matplotlib.use("Agg")  # Para backend headless (sem interface gráfica)
import matplotlib.pyplot as plt
import seaborn as sns
import matplotlib.dates as mdates
import base64
from io import BytesIO

app = FastAPI()

# Caminho dos modelos
MODEL_PATH = "../ai-model/clima_model.joblib"
SCALER_PATH = "../ai-model/scaler.joblib"

# Carregar modelo e scaler na inicialização
model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)

# Caminho do dataset para plotagens
DATASET_PATH = "../notebooks/DATASETS/clima_brasil_mensal/clima_brasil_2000_2025.parquet"

class WeatherRequest(BaseModel):
    cidade: str
    uf: str
    mes: int
    ano: int

@app.get("/")
def root():
    return {"message": "Weather Prediction API"}

def geocode_city(cidade, uf):
    uf = uf.upper()
    url = "https://nominatim.openstreetmap.org/search"
    params = {"city": cidade, "state": uf, "country": "Brazil", "format": "json"}
    resp = requests.get(url, params=params, headers={"User-Agent": "weather-app"})
    data = resp.json()
    if not data:
        # fallback: tentar só com city
        params.pop("state")
        data = requests.get(url, params=params, headers={"User-Agent": "weather-app"}).json()
    if not data:
        raise HTTPException(status_code=404, detail=f"Cidade/UF '{cidade}-{uf}' não encontrados.")
    return float(data[0]["lat"]), float(data[0]["lon"])


@app.get("/predict")
def predict(
    cidade: str = Query(..., description="Nome da cidade"),
    uf: str = Query(..., description="UF do estado (ex: SP, RJ, MG)"),
    mes: int = Query(..., ge=1, le=12, description="Mês (1-12)"),
    ano: int = Query(..., description="Ano (ex: 2025)")
):
    # 1. Geocoding
    lat, lon = geocode_city(cidade, uf)

    # 2. Preparar dados para o modelo
    X = pd.DataFrame([{
        "lat": lat,
        "lon": lon,
        "month": mes,
        "year": ano
    }])
    X_scaled = scaler.transform(X)

    # 3. Previsão
    pred = model.predict(X_scaled)[0]
    temp_celsius = float(np.round(pred[0], 2))
    prectot = float(pred[1])

    # 4. Temperatura mínima e máxima
    temp_min = float(np.round(temp_celsius - 3, 2))
    temp_max = float(np.round(temp_celsius + 4, 2))

    # 5. Converter precipitação para mm/mês
    seconds_in_month = 30 * 24 * 60 * 60
    prectot_mm = float(np.round(prectot * seconds_in_month, 2))

    # 6. Classificar chance de chuva
    if prectot_mm > 50:
        chance_chuva = "Muito Alta"
    elif prectot_mm >= 10:
        chance_chuva = "Alta"
    elif prectot_mm >= 2:
        chance_chuva = "Média"
    else:
        chance_chuva = "Baixa"

    return {
        "cidade": cidade,
        "uf": uf,
        "latitude": lat,
        "longitude": lon,
        "mes": mes,
        "ano": ano,
        "temperatura_media": temp_celsius,
        "temperatura_minima": temp_min,
        "temperatura_maxima": temp_max,
        "precipitacao_mm": prectot_mm,
        "chance_chuva": chance_chuva
    }

def load_and_preprocess_data():
    data = pd.read_parquet(DATASET_PATH)
    seconds_in_month = 30 * 24 * 60 * 60
    data['PRECTOT'] = (data['PRECTOT'] * seconds_in_month).round(2)
    colunas_para_excluir = ['day', 'hour', 'week_day']
    colunas_existentes = [col for col in colunas_para_excluir if col in data.columns]
    data = data.drop(columns=colunas_existentes)
    data = data[(data['lat'] >= -33) & (data['lat'] <= 5) & (data['lon'] >= -74) & (data['lon'] <= -35)]
    data['time'] = pd.to_datetime(data['time'])
    data['T2M_Celsius'] = (data['T2M'] - 273.15).round(2)
    data['QV2M_percentage'] = (data['QV2M'] * 100).round(3)
    data['year'] = data['time'].dt.year
    data['month'] = data['time'].dt.month
    data['T2M_min'] = (data['T2M_Celsius'] - 3).round(2)
    data['T2M_max'] = (data['T2M_Celsius'] + 4).round(2)
    # Umidade relativa
    data['e'] = (data['QV2M'] * data['PS']) / (0.622 + 0.378 * data['QV2M'])
    data['es'] = 610.78 * np.exp((17.27 * data['T2M_Celsius']) / (data['T2M_Celsius'] + 237.3))
    data['UR_percent'] = (data['e'] / data['es'] * 100).clip(0, 100).round(2)
    data = data.drop(columns=['e', 'es'])
    return data

def plot_to_base64(fig):
    buf = BytesIO()
    fig.savefig(buf, format="png", bbox_inches="tight")
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode("utf-8")
    plt.close(fig)
    return img_base64

@app.get("/plots")
def get_plots(
    cidade: str = Query(..., description="Nome da cidade"),
    uf: str = Query(..., description="UF do estado (ex: SP, RJ, MG)"),
    mes: int = Query(..., ge=1, le=12, description="Mês (1-12)"),
    ano: int = Query(..., description="Ano (ex: 2025)")
):
    # latitude, longitude, mes serão informados via API
    lat, lon = geocode_city(cidade, uf)
    tolerancia = 0.3  # ou até 0.5


    data = load_and_preprocess_data()

    # Ano final para os plots: se mês > 7, até 2024; senão, até 2025
    if mes > 7:
        ano_final = 2024
    else:
        ano_final = 2025

    # Filtro igual notebook
    df_mes = data[
        (data['lat'].between(lat - tolerancia, lat + tolerancia)) &
        (data['lon'].between(lon - tolerancia, lon + tolerancia)) &
        (data['month'] == mes) &
        (data['year'] >= 2007) & (data['year'] <= ano_final)
    ].sort_values('time')

    if df_mes.empty:
        raise HTTPException(status_code=404, detail="Dados não encontrados para os parâmetros informados.")

    # Plot 1: Temperaturas mínima, média e máxima (igual notebook)
    fig1, ax1 = plt.subplots(figsize=(12, 6))
    ax1.plot(df_mes['time'], df_mes['T2M_min'], color='blue', label='T2M_min (°C)')
    ax1.plot(df_mes['time'], df_mes['T2M_Celsius'], color='black', label='T2M_Celsius (°C)')
    ax1.plot(df_mes['time'], df_mes['T2M_max'], color='red', label='T2M_max (°C)')
    ax1.set_title(f"Minimum, mean and maximum temperatures ({df_mes['time'].iloc[0].strftime('%b')}) from 2007 to {ano_final}\nLat: {lat:.4f}, Lon: {lon:.4f}")
    ax1.set_xlabel('Month/Year')
    ax1.set_ylabel('Temperature (°C)')
    ax1.legend()
    ax1.grid(True)
    ax1.xaxis.set_major_locator(mdates.YearLocator())
    ax1.xaxis.set_major_formatter(mdates.DateFormatter('%b/%Y'))
    ax1.set_xticks(df_mes['time'])
    ax1.set_xticklabels([d.strftime('%b/%Y') for d in df_mes['time']])
    plt.setp(ax1.get_xticklabels(), rotation=45)
    plt.tight_layout()
    img1 = plot_to_base64(fig1)

    # Plot 2: Temperatura e precipitação por ano (igual notebook)
    by_year = df_mes.groupby('year').agg({
        'T2M_min': 'mean',
        'T2M_Celsius': 'mean',
        'T2M_max': 'mean',
        'PRECTOT': 'mean'
    }).reset_index()
    fig2, ax1 = plt.subplots(figsize=(14, 7))
    ax1.bar(by_year['year'], by_year['PRECTOT'], color='lightgreen', label="Precipitation (mm)", width=0.7)
    ax1.set_ylabel("Precipitation (mm)", color='green', fontsize=12)
    ax1.set_ylim(0, by_year['PRECTOT'].max() * 1.2)
    ax2 = ax1.twinx()
    ax2.plot(by_year['year'], by_year['T2M_max'], color='red', marker='s', label='Daily Maximum (°C)')
    ax2.plot(by_year['year'], by_year['T2M_Celsius'], color='black', marker='o', label='Daily Average (°C)')
    ax2.plot(by_year['year'], by_year['T2M_min'], color='deepskyblue', marker='^', label='Daily Minimum (°C)')
    ax2.set_ylabel("Temperature (°C)", color='black', fontsize=12)
    ax2.set_ylim(
        min(by_year['T2M_min'].min(), 0) - 2,
        by_year['T2M_max'].max() + 2
    )
    ax1.set_xticks(by_year['year'])
    ax1.set_xticklabels(by_year['year'], fontsize=11)
    ax1.set_xlabel('Year', fontsize=12)
    lines_1, labels_1 = ax1.get_legend_handles_labels()
    lines_2, labels_2 = ax2.get_legend_handles_labels()
    ax2.legend(lines_1 + lines_2, labels_1 + labels_2, loc='upper left', fontsize=11)
    month_abbr = df_mes['time'].iloc[0].strftime('%b')
    plt.title(f"Monthly Temperature and Precipitation in {month_abbr} ({lat:.4f}, {lon:.4f})\nFrom 2007 to {ano_final}", fontsize=14)
    plt.grid(axis='y', alpha=0.3)
    plt.tight_layout()
    img2 = plot_to_base64(fig2)

    # Plot 3: Umidade relativa média por ano (igual notebook)
    by_year_ur = df_mes.groupby('year').agg({'UR_percent': 'mean'}).reset_index()
    fig3, ax = plt.subplots(figsize=(12, 6))
    ax.fill_between(by_year_ur['year'], by_year_ur['UR_percent'], color='mediumspringgreen', alpha=0.5)
    ax.plot(by_year_ur['year'], by_year_ur['UR_percent'], color='mediumspringgreen', marker='o', linewidth=2, label="Humidity")
    ax.set_ylim(0, 100)
    ax.set_ylabel("Relative humidity (%)", fontsize=12)
    ax.set_xlabel("Year", fontsize=12)
    ax.set_xticks(by_year_ur['year'])
    ax.set_xticklabels(by_year_ur['year'], fontsize=11)
    ax.legend(loc='upper right')
    plt.title(f"Average relative humidity ({lat:.4f}, {lon:.4f}) in {df_mes['time'].iloc[0].strftime('%b')}\nFrom 2007 to {ano_final}", fontsize=14)
    plt.grid(axis='y', alpha=0.3)
    plt.tight_layout()
    img3 = plot_to_base64(fig3)

    return {
        "plot_temperaturas": img1,
        "plot_temp_precip": img2,
        "plot_umidade": img3
    }