const { getCountryByCode, getRecordsByCode, corsHeaders, respond } = require("./_data");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: corsHeaders(), body: "" };
  try {
    const parts = event.path.split("/");
    const code = parts[parts.length - 1].toUpperCase();
    let country = getCountryByCode(code) || getCountryByCode("WLD");
    if (!country) return respond(404, { error: "Country not found" });
    const records = getRecordsByCode(country.code).sort((a, b) => a.year - b.year);
    return respond(200, { country, records });
  } catch (err) { return respond(500, { error: err.message }); }
};
