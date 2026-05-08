import json
import math

def calculate_demographic_momentum(data):
    """
    Calculates population momentum based on growth rates and median age.
    """
    results = []
    for country in data:
        name = country.get('name')
        median_age = country.get('medianAge', 30)
        growth = country.get('growthCIA', 1.0)
        
        # Momentum formula simulation: Lower median age + high growth = high momentum
        # Score from 0 to 100
        age_factor = max(0, (50 - median_age) / 30)
        growth_factor = min(1, growth / 3)
        momentum_score = (age_factor * 0.6 + growth_factor * 0.4) * 100
        
        results.append({
            "country": name,
            "momentum_score": round(momentum_score, 2),
            "classification": "High" if momentum_score > 70 else "Medium" if momentum_score > 40 else "Low"
        })
    
    return sorted(results, key=lambda x: x['momentum_score'], reverse=True)

if __name__ == "__main__":
    # Example usage with mock data representing the database structure
    sample_data = [
        {"name": "Nigeria", "medianAge": 19.3, "growthCIA": 2.53},
        {"name": "Japan", "medianAge": 49.9, "growthCIA": -0.41},
        {"name": "USA", "medianAge": 38.9, "growthCIA": 0.68}
    ]
    
    print("--- Demograph Python Engine Analysis ---")
    results = calculate_demographic_momentum(sample_data)
    for r in results:
        print(f"{r['country']}: Score {r['momentum_score']} ({r['classification']} Momentum)")
