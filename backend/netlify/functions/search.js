const { getCountries, corsHeaders, respond } = require("./_data");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: corsHeaders(), body: "" };
  try {
    const query = (event.queryStringParameters?.query || "").toLowerCase().trim();
    if (!query) return respond(200, []);
    const results = getCountries()
      .filter((c) => c.name.toLowerCase().includes(query) || c.code.toLowerCase().includes(query))
      .slice(0, 10)
      .map((c) => ({ code: c.code, name: c.name }));
    return respond(200, results);
  } catch (err) { return respond(500, { error: err.message }); }
};
