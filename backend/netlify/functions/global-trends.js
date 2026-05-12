const { getRecordsByCode, corsHeaders, respond } = require("./_data");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: corsHeaders(), body: "" };
  try {
    const mode = event.queryStringParameters?.mode || "history";
    const all = getRecordsByCode("WLD").sort((a, b) => a.year - b.year);
    const records = mode === "history" ? all.filter((r) => r.year <= 2024) : all.filter((r) => r.year >= 2024);
    return respond(200, records);
  } catch (err) { return respond(500, { error: err.message }); }
};
