
const { ConvexHttpClient } = require("convex/browser");
const fs = require("fs");
require("dotenv").config({ path: ".env.development.local" });

const client = new ConvexHttpClient(process.env.VITE_CONVEX_URL);

async function exportData() {
  console.log("Exporting countries...");
  const countries = await client.query("population:listAllCountries");
  
  console.log("Exporting all records...");
  const records = [];
  for (const c of countries) {
    const data = await client.query("population:getCountryData", { code: c.code });
    records.push({ code: c.code, records: data.records });
  }

  const exportObj = {
    countries,
    records
  };

  fs.writeFileSync("convex_export.json", JSON.stringify(exportObj, null, 2));
  console.log("Export complete: convex_export.json");
}

exportData().catch(console.error);
