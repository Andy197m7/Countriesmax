
const data = [
  { code: "USA", life: 77.2, migration: 1200000 },
  { code: "CHN", life: 78.2, migration: -340000 },
  { code: "IND", life: 70.1, migration: -480000 },
  { code: "NGA", life: 54.1, migration: -60000 },
  { code: "JPN", life: 84.7, migration: 70000 },
  { code: "DEU", life: 81.3, migration: 320000 },
  { code: "CAN", life: 82.8, migration: 450000 },
  { code: "AUS", life: 83.2, migration: 190000 },
  { code: "AFG", life: 54.1, migration: -120000 },
  { code: "ALB", life: 79.5, migration: -15000 },
  { code: "DZA", life: 77.8, migration: -10000 },
  { code: "AGO", life: 62.1, migration: 0 },
  { code: "ARG", life: 77.1, migration: 5000 },
  { code: "BGD", life: 73.0, migration: -350000 },
  { code: "BRA", life: 76.2, migration: 20000 }
];

const { execSync } = require('child_process');
try {
  const jsonString = JSON.stringify(data);
  const escapedJson = jsonString.replace(/"/g, '\\"');
  console.log("Updating metadata...");
  execSync(`npx convex run population:updateDemographicMetadata "{\\"data\\": ${escapedJson}}"`, { stdio: 'inherit' });
  console.log("Update complete.");
} catch (e) {
  console.error("Error:", e.message);
}
