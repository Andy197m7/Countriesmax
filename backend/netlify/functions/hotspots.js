const { getCountries, getRecordsByCode, corsHeaders, respond } = require("./_data");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: corsHeaders(), body: "" };
  try {
    const limit = parseInt(event.queryStringParameters?.limit || "5", 10);
    const hotspots = getCountries()
      .filter((c) => c.code !== "WLD" && c.growthCIA != null)
      .sort((a, b) => b.growthCIA - a.growthCIA)
      .slice(0, limit)
      .map((c) => {
        const rec2024 = getRecordsByCode(c.code).find((r) => r.year === 2024);
        return { countryCode: c.code, countryName: c.name, growthRate: c.growthCIA || 0, currentPopulation: rec2024?.population || 0 };
      });
    return respond(200, hotspots);
  } catch (err) { return respond(500, { error: err.message }); }
};
