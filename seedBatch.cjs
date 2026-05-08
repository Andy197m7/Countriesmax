
const data = [
  { "countryCode": "AZE", "countryName": "Azerbaijan", "medianAge": 34.3, "ciaGrowth": "0.64%", "wbGrowth": "0.4%", "unGrowth": "0.34%" },
  { "countryCode": "BHS", "countryName": "Bahamas, The", "medianAge": 30.7, "ciaGrowth": "0.82%", "wbGrowth": "0.6%", "unGrowth": "0.53%" },
  { "countryCode": "BRB", "countryName": "Barbados", "medianAge": 41.4, "ciaGrowth": "0.23%", "wbGrowth": "0.1%", "unGrowth": "0.12%" },
  { "countryCode": "BLR", "countryName": "Belarus", "medianAge": 42.1, "ciaGrowth": "-0.40%", "wbGrowth": "-1.1%", "unGrowth": "-0.73%" },
  { "countryCode": "BLZ", "countryName": "Belize", "medianAge": 26.8, "ciaGrowth": "1.63%", "wbGrowth": "1.3%", "unGrowth": "1.36%" },
  { "countryCode": "BEN", "countryName": "Benin", "medianAge": 17.2, "ciaGrowth": "3.48%", "wbGrowth": "2.7%", "unGrowth": "2.65%" },
  { "countryCode": "BIH", "countryName": "Bosnia and Herzegovina", "medianAge": 44.8, "ciaGrowth": "-0.23%", "wbGrowth": "-0.9%", "unGrowth": "-1.24%" },
  { "countryCode": "BWA", "countryName": "Botswana", "medianAge": 27.1, "ciaGrowth": "1.34%", "wbGrowth": "1.5%", "unGrowth": "1.48%" },
  { "countryCode": "BRN", "countryName": "Brunei", "medianAge": 32.3, "ciaGrowth": "1.38%", "wbGrowth": "0.8%", "unGrowth": "0.72%" },
  { "countryCode": "BGR", "countryName": "Bulgaria", "medianAge": 45.1, "ciaGrowth": "-0.66%", "wbGrowth": "-0.5%", "unGrowth": "-1.33%" },
  { "countryCode": "BFA", "countryName": "Burkina Faso", "medianAge": 18.7, "ciaGrowth": "2.60%", "wbGrowth": "2.5%", "unGrowth": "2.45%" },
  { "countryCode": "MMR", "countryName": "Burma (Myanmar)", "medianAge": 30.8, "ciaGrowth": "0.83%", "wbGrowth": "0.7%", "unGrowth": "0.68%" },
  { "countryCode": "BDI", "countryName": "Burundi", "medianAge": 18.4, "ciaGrowth": "3.64%", "wbGrowth": "2.7%", "unGrowth": "2.71%" },
  { "countryCode": "CPV", "countryName": "Cabo Verde", "medianAge": 28.8, "ciaGrowth": "1.18%", "wbGrowth": "1.1%", "unGrowth": "1.01%" },
  { "countryCode": "CMR", "countryName": "Cameroon", "medianAge": 18.9, "ciaGrowth": "2.73%", "wbGrowth": "2.6%", "unGrowth": "2.57%" },
  { "countryCode": "CAF", "countryName": "Central African Republic", "medianAge": 20.4, "ciaGrowth": "2.94%", "wbGrowth": "2.9%", "unGrowth": "3.01%" },
  { "countryCode": "TCD", "countryName": "Chad", "medianAge": 16.7, "ciaGrowth": "4.04%", "wbGrowth": "3.1%", "unGrowth": "3.11%" },
  { "countryCode": "COM", "countryName": "Comoros", "medianAge": 22.7, "ciaGrowth": "1.69%", "wbGrowth": "1.8%", "unGrowth": "1.75%" },
  { "countryCode": "CRI", "countryName": "Costa Rica", "medianAge": 35.5, "ciaGrowth": "1.04%", "wbGrowth": "0.6%", "unGrowth": "0.53%" },
  { "countryCode": "CIV", "countryName": "Cote d'Ivoire", "medianAge": 21.2, "ciaGrowth": "3.52%", "wbGrowth": "2.5%", "unGrowth": "2.49%" },
  { "countryCode": "CYP", "countryName": "Cyprus", "medianAge": 39.5, "ciaGrowth": "1.00%", "wbGrowth": "0.8%", "unGrowth": "0.63%" },
  { "countryCode": "DJI", "countryName": "Djibouti", "medianAge": 26.3, "ciaGrowth": "1.86%", "wbGrowth": "1.4%", "unGrowth": "1.38%" },
  { "countryCode": "DMA", "countryName": "Dominica", "medianAge": 37.0, "ciaGrowth": "-0.71%", "wbGrowth": "0.4%", "unGrowth": "0.33%" },
  { "countryCode": "DOM", "countryName": "Dominican Republic", "medianAge": 29.2, "ciaGrowth": "0.84%", "wbGrowth": "0.9%", "unGrowth": "0.88%" },
  { "countryCode": "ECU", "countryName": "Ecuador", "medianAge": 28.0, "ciaGrowth": "1.11%", "wbGrowth": "1.0%", "unGrowth": "1.12%" },
  { "countryCode": "SLV", "countryName": "El Salvador", "medianAge": 29.7, "ciaGrowth": "0.51%", "wbGrowth": "0.4%", "unGrowth": "0.44%" },
  { "countryCode": "GNQ", "countryName": "Equatorial Guinea", "medianAge": 22.1, "ciaGrowth": "5.50%", "wbGrowth": "2.3%", "unGrowth": "2.21%" },
  { "countryCode": "ERI", "countryName": "Eritrea", "medianAge": 21.3, "ciaGrowth": "2.11%", "wbGrowth": "2.4%", "unGrowth": "2.31%" },
  { "countryCode": "EST", "countryName": "Estonia", "medianAge": 45.0, "ciaGrowth": "-0.74%", "wbGrowth": "-0.1%", "unGrowth": "-0.22%" },
  { "countryCode": "SWZ", "countryName": "Eswatini", "medianAge": 24.6, "ciaGrowth": "1.54%", "wbGrowth": "1.6%", "unGrowth": "1.61%" },
  { "countryCode": "FJI", "countryName": "Fiji", "medianAge": 31.6, "ciaGrowth": "0.39%", "wbGrowth": "0.6%", "unGrowth": "0.55%" },
  { "countryCode": "GAB", "countryName": "Gabon", "medianAge": 22.0, "ciaGrowth": "3.18%", "wbGrowth": "2.0%", "unGrowth": "1.95%" },
  { "countryCode": "GMB", "countryName": "Gambia, The", "medianAge": 20.2, "ciaGrowth": "3.18%", "wbGrowth": "2.5%", "unGrowth": "2.41%" },
  { "countryCode": "GEO", "countryName": "Georgia", "medianAge": 38.3, "ciaGrowth": "-0.43%", "wbGrowth": "-0.3%", "unGrowth": "-0.24%" },
  { "countryCode": "GHA", "countryName": "Ghana", "medianAge": 21.4, "ciaGrowth": "2.17%", "wbGrowth": "2.0%", "unGrowth": "1.91%" },
  { "countryCode": "GRD", "countryName": "Grenada", "medianAge": 35.4, "ciaGrowth": "0.31%", "wbGrowth": "0.5%", "unGrowth": "0.44%" },
  { "countryCode": "GTM", "countryName": "Guatemala", "medianAge": 24.8, "ciaGrowth": "1.54%", "wbGrowth": "1.4%", "unGrowth": "1.38%" },
  { "countryCode": "GIN", "countryName": "Guinea", "medianAge": 19.4, "ciaGrowth": "2.73%", "wbGrowth": "2.4%", "unGrowth": "2.33%" },
  { "countryCode": "GNB", "countryName": "Guinea-Bissau", "medianAge": 18.4, "ciaGrowth": "2.52%", "wbGrowth": "2.1%", "unGrowth": "2.11%" },
  { "countryCode": "GUY", "countryName": "Guyana", "medianAge": 28.3, "ciaGrowth": "0.16%", "wbGrowth": "0.6%", "unGrowth": "0.55%" },
  { "countryCode": "HTI", "countryName": "Haiti", "medianAge": 25.0, "ciaGrowth": "1.16%", "wbGrowth": "1.2%", "unGrowth": "1.24%" },
  { "countryCode": "VAT", "countryName": "Holy See (Vatican)", "medianAge": 57.3, "ciaGrowth": "0.00%", "wbGrowth": "0.00%", "unGrowth": "0.00%" },
  { "countryCode": "HND", "countryName": "Honduras", "medianAge": 25.7, "ciaGrowth": "1.18%", "wbGrowth": "1.5%", "unGrowth": "1.44%" },
  { "countryCode": "KIR", "countryName": "Kiribati", "medianAge": 27.3, "ciaGrowth": "1.02%", "wbGrowth": "1.6%", "unGrowth": "1.51%" },
  { "countryCode": "KWT", "countryName": "Kuwait", "medianAge": 30.3, "ciaGrowth": "1.15%", "wbGrowth": "0.9%", "unGrowth": "0.88%" },
  { "countryCode": "KGZ", "countryName": "Kyrgyzstan", "medianAge": 28.3, "ciaGrowth": "0.86%", "wbGrowth": "1.6%", "unGrowth": "1.51%" },
  { "countryCode": "LAO", "countryName": "Laos", "medianAge": 25.4, "ciaGrowth": "1.29%", "wbGrowth": "1.3%", "unGrowth": "1.21%" },
  { "countryCode": "LVA", "countryName": "Latvia", "medianAge": 45.5, "ciaGrowth": "-1.13%", "wbGrowth": "-0.6%", "unGrowth": "-0.95%" },
  { "countryCode": "LBN", "countryName": "Lebanon", "medianAge": 36.3, "ciaGrowth": "-0.74%", "wbGrowth": "-1.6%", "unGrowth": "-0.44%" },
  { "countryCode": "LSO", "countryName": "Lesotho", "medianAge": 23.9, "ciaGrowth": "0.66%", "wbGrowth": "1.1%", "unGrowth": "1.05%" },
  { "countryCode": "LBR", "countryName": "Liberia", "medianAge": 19.9, "ciaGrowth": "2.71%", "wbGrowth": "2.1%", "unGrowth": "2.11%" },
  { "countryCode": "LBY", "countryName": "Libya", "medianAge": 26.2, "ciaGrowth": "1.41%", "wbGrowth": "1.1%", "unGrowth": "1.05%" },
  { "countryCode": "LIE", "countryName": "Liechtenstein", "medianAge": 44.2, "ciaGrowth": "0.70%", "wbGrowth": "0.6%", "unGrowth": "0.55%" },
  { "countryCode": "LTU", "countryName": "Lithuania", "medianAge": 45.1, "ciaGrowth": "-1.04%", "wbGrowth": "-0.5%", "unGrowth": "-0.55%" },
  { "countryCode": "LUX", "countryName": "Luxembourg", "medianAge": 39.9, "ciaGrowth": "1.58%", "wbGrowth": "1.3%", "unGrowth": "1.22%" }
];

const { execSync } = require('child_process');

try {
  const jsonString = JSON.stringify(data);
  // We need to escape the JSON string for the shell
  const escapedJson = jsonString.replace(/"/g, '\\"');
  console.log("Running ingestion...");
  execSync(`npx convex run population:ingestGrowthBatch "{\\"batch\\": ${escapedJson}}"`, { stdio: 'inherit' });
  console.log("Ingestion complete.");
} catch (e) {
  console.error("Error during ingestion:", e.message);
  process.exit(1);
}
