
import json
import sqlite3
import pandas as pd
import numpy as np
import math
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from sklearn.linear_model import LinearRegression
from typing import List, Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "population.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS countries (
            code TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            median_age REAL,
            growth_cia REAL,
            growth_wb REAL,
            growth_un REAL,
            life_expectancy REAL,
            net_migration REAL
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS population_records (
            country_code TEXT,
            year INTEGER,
            population INTEGER,
            PRIMARY KEY (country_code, year),
            FOREIGN KEY (country_code) REFERENCES countries(code)
        )
    ''')
    
    # Load from export if DB is empty
    cursor.execute("SELECT count(*) FROM countries")
    if cursor.fetchone()[0] == 0:
        try:
            with open("convex_export.json", "r") as f:
                data = json.load(f)
                
            for c in data["countries"]:
                cursor.execute('''
                    INSERT INTO countries (code, name, median_age, growth_cia, growth_wb, growth_un, life_expectancy, net_migration)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (c["code"], c["name"], c.get("medianAge"), c.get("growthCIA"), c.get("growthWB"), c.get("growthUN"), c.get("lifeExpectancy"), c.get("netMigration")))
            
            for country_entry in data["records"]:
                code = country_entry["code"]
                for r in country_entry["records"]:
                    cursor.execute('''
                        INSERT INTO population_records (country_code, year, population)
                        VALUES (?, ?, ?)
                    ''', (code, r["year"], r["population"]))
            
            conn.commit()
        except Exception as e:
            print(f"Migration error: {e}")
            
    conn.close()

@app.on_event("startup")
async def startup_event():
    init_db()

def safe_val(val):
    if val is None: return None
    try:
        if math.isnan(val) or math.isinf(val):
            return None
    except:
        pass
    return val

@app.get("/countries")
async def list_countries():
    conn = sqlite3.connect(DB_PATH)
    df = pd.read_sql_query("SELECT * FROM countries ORDER BY name", conn)
    conn.close()
    
    result = []
    for _, row in df.iterrows():
        result.append({
            "code": row["code"],
            "name": row["name"],
            "medianAge": safe_val(row["median_age"]),
            "growthCIA": safe_val(row["growth_cia"]),
            "growthWB": safe_val(row["growth_wb"]),
            "growthUN": safe_val(row["growth_un"]),
            "lifeExpectancy": safe_val(row["life_expectancy"]),
            "netMigration": safe_val(row["net_migration"])
        })
    return result

@app.get("/search")
async def search_countries(query: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT code, name FROM countries WHERE name LIKE ? OR code LIKE ? LIMIT 10", (f"%{query}%", f"%{query}%"))
    rows = cursor.fetchall()
    conn.close()
    return [{"code": r[0], "name": r[1]} for r in rows]

@app.get("/country/{code}")
async def get_country_data(code: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM countries WHERE code = ?", (code,))
    row = cursor.fetchone()
    if not row:
        cursor.execute("SELECT * FROM countries WHERE code = 'WLD'")
        row = cursor.fetchone()
        
    country = {
        "code": row[0],
        "name": row[1],
        "medianAge": safe_val(row[2]),
        "growthCIA": safe_val(row[3]),
        "growthWB": safe_val(row[4]),
        "growthUN": safe_val(row[5]),
        "lifeExpectancy": safe_val(row[6]),
        "netMigration": safe_val(row[7])
    }
    
    df_records = pd.read_sql_query("SELECT year, population FROM population_records WHERE country_code = ? ORDER BY year", conn, params=(code,))
    records = []
    for _, r in df_records.iterrows():
        records.append({"year": int(r["year"]), "population": int(r["population"])})
    
    conn.close()
    return {"country": country, "records": records}

@app.get("/global-trends")
async def get_global_trends(mode: str = "history"):
    conn = sqlite3.connect(DB_PATH)
    if mode == "history":
        query = "SELECT year, population FROM population_records WHERE country_code = 'WLD' AND year <= 2024 ORDER BY year"
    else:
        query = "SELECT year, population FROM population_records WHERE country_code = 'WLD' AND year >= 2024 ORDER BY year"
    
    df = pd.read_sql_query(query, conn)
    conn.close()
    
    records = []
    for _, r in df.iterrows():
        records.append({"year": int(r["year"]), "population": int(r["population"])})
    return records

@app.get("/hotspots")
async def get_hotspots(limit: int = 5):
    conn = sqlite3.connect(DB_PATH)
    query = "SELECT code, name, growth_cia FROM countries WHERE code != 'WLD' AND growth_cia IS NOT NULL ORDER BY growth_cia DESC LIMIT ?"
    df = pd.read_sql_query(query, conn, params=(limit,))
    
    result = []
    for _, row in df.iterrows():
        cursor = conn.cursor()
        cursor.execute("SELECT population FROM population_records WHERE country_code = ? AND year = 2024", (row["code"],))
        pop = cursor.fetchone()
        pop_val = int(pop[0]) if pop else 0
        
        result.append({
            "countryCode": row["code"],
            "countryName": row["name"],
            "growthRate": safe_val(row["growth_cia"]) or 0.0,
            "currentPopulation": pop_val
        })
    conn.close()
    return result

@app.get("/predict/{code}")
async def predict_population(code: str):
    conn = sqlite3.connect(DB_PATH)
    df = pd.read_sql_query("SELECT year, population FROM population_records WHERE country_code = ? AND year <= 2024", conn, params=(code,))
    
    if len(df) < 2:
        conn.close()
        return [{"year": 2030, "population": 0}, {"year": 2050, "population": 0}, {"year": 2100, "population": 0}]
    
    X = df[["year"]].values
    y = df["population"].values
    
    model = LinearRegression()
    model.fit(X, y)
    
    future_years = np.array([[2030], [2050], [2100]])
    predictions = model.predict(future_years)
    
    result = []
    cursor = conn.cursor()
    cursor.execute("SELECT population FROM population_records WHERE country_code = ? AND year = 2024", (code,))
    r2024 = cursor.fetchone()
    if r2024:
        result.append({"year": 2024, "population": int(r2024[0])})
        
    for year, pop in zip(future_years.flatten(), predictions.flatten()):
        result.append({"year": int(year), "population": int(max(0, pop))})
        
    conn.close()
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
