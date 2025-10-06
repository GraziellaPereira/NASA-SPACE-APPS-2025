# 🌍 METEORIS by Earth Trailblazers  

**NASA Space Apps Challenge 2025 Project**  

Meteoris is a web application designed to revolutionize how tourists plan their trips to Brazil!  
Using predictive machine learning models trained on 18 years of NASA open climate data, Meteoris allows users to forecast weather conditions for any city, month, and year — even far into the future.  

The platform combines **climate prediction, data visualization**, and **AI-based travel recommendations** to help travelers make informed, safe, and optimized travel decisions.  

---

## 🚀 How to Run the Project  

### 1. Clone the repository  
```bash
git clone https://github.com/GraziellaPereira/NASA-SPACE-APPS-2025.git
```

### 2. Download the dataset

Go to the folder:  
```
notebooks/DATASETS/clima_brasil_mensal
```

Open the file `link.txt` and download the `.parquet` dataset from Google Drive.

Place the downloaded file in the same directory.

---

### 3. Run the FastAPI (Python) backend

Open the Python API directory and start the server:
```bash
cd api-python
uvicorn main:app --reload
```

This will start the machine learning API that handles climate predictions and data visualizations.

---

### 4. Run the .NET (C#) backend

Open the backend folder and start the proxy service:
```bash
cd backend-csharp/backend-csharp
dotnet run
```

This backend acts as a bridge between the React frontend and the FastAPI service.

---

### 5. Run the React frontend

Open the React app directory and start the development server:
```bash
cd frontend-react/Meteoris/src
npm run dev
```

This will launch the Meteoris web interface on your local environment.

---

### 6. 🌤 Enjoy Meteoris!

Once everything is running, open your browser at the displayed local address (usually [http://localhost:5173](http://localhost:5173)) and start exploring future weather predictions and travel tips for destinations across Brazil.
