const { getCountries, corsHeaders, respond } = require("./_data");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: corsHeaders(), body: "" };
  try {
    return respond(200, getCountries().sort((a, b) => a.name.localeCompare(b.name)));
  } catch (err) { return respond(500, { error: err.message }); }
};
