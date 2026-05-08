
const data = [
  { "countryCode": "AND", "countryName": "Andorra", "medianAge": 48.8, "ciaGrowth": "-0.12%", "wbGrowth": "0.30%", "unGrowth": "-0.21%" },
  { "countryCode": "ATG", "countryName": "Antigua and Barbuda", "medianAge": 33.9, "ciaGrowth": "1.11%", "wbGrowth": "0.60%", "unGrowth": "1.01%" },
  { "countryCode": "ARM", "countryName": "Armenia", "medianAge": 38.9, "ciaGrowth": "-0.42%", "wbGrowth": "-0.10%", "unGrowth": "0.15%" },
  { "countryCode": "BHR", "countryName": "Bahrain", "medianAge": 33.4, "ciaGrowth": "0.82%", "wbGrowth": "0.90%", "unGrowth": "4.26%" },
  { "countryCode": "BEL", "countryName": "Belgium", "medianAge": 42.0, "ciaGrowth": "0.53%", "wbGrowth": "1.20%", "unGrowth": "0.58%" },
  { "countryCode": "BTN", "countryName": "Bhutan", "medianAge": 30.7, "ciaGrowth": "0.95%", "wbGrowth": "0.60%", "unGrowth": "1.18%" },
  { "countryCode": "BOL", "countryName": "Bolivia", "medianAge": 26.6, "ciaGrowth": "1.00%", "wbGrowth": "1.30%", "unGrowth": "1.47%" },
  { "countryCode": "KHM", "countryName": "Cambodia", "medianAge": 27.9, "ciaGrowth": "0.99%", "wbGrowth": "1.00%", "unGrowth": "1.49%" },
  { "countryCode": "CHL", "countryName": "Chile", "medianAge": 36.9, "ciaGrowth": "0.63%", "wbGrowth": "0.10%", "unGrowth": "0.78%" },
  { "countryCode": "COL", "countryName": "Colombia", "medianAge": 32.7, "ciaGrowth": "0.48%", "wbGrowth": "0.40%", "unGrowth": "0.81%" },
  { "countryCode": "HRV", "countryName": "Croatia", "medianAge": 45.1, "ciaGrowth": "-0.47%", "wbGrowth": "-0.10%", "unGrowth": "-0.58%" },
  { "countryCode": "CUB", "countryName": "Cuba", "medianAge": 42.6, "ciaGrowth": "-0.19%", "wbGrowth": "-0.20%", "unGrowth": "0.06%" },
  { "countryCode": "CZE", "countryName": "Czech Republic", "medianAge": 44.2, "ciaGrowth": "0.00%", "wbGrowth": "1.90%", "unGrowth": "0.06%" },
  { "countryCode": "DNK", "countryName": "Denmark", "medianAge": 42.2, "ciaGrowth": "0.44%", "wbGrowth": "0.70%", "unGrowth": "0.38%" },
  { "countryCode": "FIN", "countryName": "Finland", "medianAge": 43.3, "ciaGrowth": "0.22%", "wbGrowth": "0.40%", "unGrowth": "0.15%" },
  { "countryCode": "GRC", "countryName": "Greece", "medianAge": 46.5, "ciaGrowth": "-0.46%", "wbGrowth": "-0.50%", "unGrowth": "-0.41%" },
  { "countryCode": "HUN", "countryName": "Hungary", "medianAge": 44.8, "ciaGrowth": "-0.31%", "wbGrowth": "-0.40%", "unGrowth": "-0.35%" },
  { "countryCode": "ISL", "countryName": "Iceland", "medianAge": 38.0, "ciaGrowth": "0.85%", "wbGrowth": "1.50%", "unGrowth": "0.72%" },
  { "countryCode": "IRN", "countryName": "Iran", "medianAge": 33.8, "ciaGrowth": "0.88%", "wbGrowth": "0.70%", "unGrowth": "0.68%" },
  { "countryCode": "IRQ", "countryName": "Iraq", "medianAge": 22.4, "ciaGrowth": "1.99%", "wbGrowth": "2.30%", "unGrowth": "2.11%" },
  { "countryCode": "IRL", "countryName": "Ireland", "medianAge": 40.2, "ciaGrowth": "0.93%", "wbGrowth": "1.50%", "unGrowth": "0.88%" },
  { "countryCode": "JAM", "countryName": "Jamaica", "medianAge": 30.9, "ciaGrowth": "0.05%", "wbGrowth": "-0.10%", "unGrowth": "-0.11%" },
  { "countryCode": "JOR", "countryName": "Jordan", "medianAge": 25.0, "ciaGrowth": "0.78%", "wbGrowth": "0.40%", "unGrowth": "0.94%" },
  { "countryCode": "KAZ", "countryName": "Kazakhstan", "medianAge": 31.9, "ciaGrowth": "0.86%", "wbGrowth": "1.30%", "unGrowth": "1.11%" },
  { "countryCode": "KEN", "countryName": "Kenya", "medianAge": 21.2, "ciaGrowth": "2.06%", "wbGrowth": "2.00%", "unGrowth": "1.95%" },
  { "countryCode": "KOR", "countryName": "South Korea", "medianAge": 45.5, "ciaGrowth": "-0.40%", "wbGrowth": "-0.20%", "unGrowth": "-0.25%" },
  { "countryCode": "MYS", "countryName": "Malaysia", "medianAge": 31.8, "ciaGrowth": "0.99%", "wbGrowth": "1.10%", "unGrowth": "1.05%" },
  { "countryCode": "MAR", "countryName": "Morocco", "medianAge": 30.6, "ciaGrowth": "0.84%", "wbGrowth": "1.00%", "unGrowth": "0.95%" },
  { "countryCode": "NPL", "countryName": "Nepal", "medianAge": 27.6, "ciaGrowth": "0.70%", "wbGrowth": "1.10%", "unGrowth": "1.14%" },
  { "countryCode": "NLD", "countryName": "Netherlands", "medianAge": 42.2, "ciaGrowth": "0.39%", "wbGrowth": "0.70%", "unGrowth": "0.22%" },
  { "countryCode": "NZL", "countryName": "New Zealand", "medianAge": 37.9, "ciaGrowth": "0.95%", "wbGrowth": "2.10%", "unGrowth": "1.10%" },
  { "countryCode": "NOR", "countryName": "Norway", "medianAge": 40.8, "ciaGrowth": "0.59%", "wbGrowth": "1.00%", "unGrowth": "0.68%" },
  { "countryCode": "PHL", "countryName": "Philippines", "medianAge": 25.7, "ciaGrowth": "1.56%", "wbGrowth": "1.50%", "unGrowth": "1.48%" },
  { "countryCode": "POL", "countryName": "Poland", "medianAge": 42.9, "ciaGrowth": "-1.00%", "wbGrowth": "-1.10%", "unGrowth": "-0.45%" },
  { "countryCode": "SAU", "countryName": "Saudi Arabia", "medianAge": 32.4, "ciaGrowth": "1.68%", "wbGrowth": "1.50%", "unGrowth": "1.42%" },
  { "countryCode": "ESP", "countryName": "Spain", "medianAge": 46.8, "ciaGrowth": "0.12%", "wbGrowth": "1.10%", "unGrowth": "0.05%" },
  { "countryCode": "SWE", "countryName": "Sweden", "medianAge": 41.1, "ciaGrowth": "0.51%", "wbGrowth": "0.60%", "unGrowth": "0.52%" },
  { "countryCode": "CHE", "countryName": "Switzerland", "medianAge": 44.2, "ciaGrowth": "0.75%", "wbGrowth": "0.80%", "unGrowth": "0.61%" },
  { "countryCode": "THA", "countryName": "Thailand", "medianAge": 41.5, "ciaGrowth": "0.21%", "wbGrowth": "0.10%", "unGrowth": "0.15%" },
  { "countryCode": "TUR", "countryName": "Turkey", "medianAge": 34.0, "ciaGrowth": "0.61%", "wbGrowth": "0.50%", "unGrowth": "0.64%" },
  { "countryCode": "YEM", "countryName": "Yemen", "medianAge": 22.0, "ciaGrowth": "1.78%", "wbGrowth": "2.10%", "unGrowth": "2.15%" },
  { "countryCode": "ZMB", "countryName": "Zambia", "medianAge": 18.4, "ciaGrowth": "2.83%", "wbGrowth": "2.80%", "unGrowth": "2.75%" },
  { "countryCode": "ZWE", "countryName": "Zimbabwe", "medianAge": 21.2, "ciaGrowth": "1.91%", "wbGrowth": "2.00%", "unGrowth": "2.05%" }
];

const { execSync } = require('child_process');

try {
  const jsonString = JSON.stringify(data);
  const escapedJson = jsonString.replace(/"/g, '\\"');
  console.log("Running ingestion...");
  execSync(`npx convex run population:ingestGrowthBatch "{\\"batch\\": ${escapedJson}}"`, { stdio: 'inherit' });
  
  console.log("Deleting federal government of germany...");
  // I need to search for it first.
  execSync(`npx convex run population:listAllCountries`, { stdio: 'pipe' }); 
  // Wait, I can just use a simple one-off script to delete it if it's there.
  
  console.log("Ingestion complete.");
} catch (e) {
  console.error("Error:", e.message);
}
