const { getRecordsByCode, corsHeaders, respond } = require("./_data");

function linearRegression(years, populations) {
  const n = years.length;
  const sumX = years.reduce((a, b) => a + b, 0);
  const sumY = populations.reduce((a, b) => a + b, 0);
  const sumXY = years.reduce((s, x, i) => s + x * populations[i], 0);
  const sumX2 = years.reduce((s, x) => s + x * x, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return (year) => slope * year + intercept;
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: corsHeaders(), body: "" };
  try {
    const parts = event.path.split("/");
    const code = parts[parts.length - 1].toUpperCase();
    const records = getRecordsByCode(code).filter((r) => r.year <= 2024).sort((a, b) => a.year - b.year);

    if (records.length < 2) {
      return respond(200, [{ year: 2030, population: 0 }, { year: 2050, population: 0 }, { year: 2100, population: 0 }]);
    }

    const predict = linearRegression(records.map((r) => r.year), records.map((r) => r.population));
    const result = [];
    const rec2024 = records.find((r) => r.year === 2024);
    if (rec2024) result.push({ year: 2024, population: rec2024.population });
    for (const year of [2030, 2050, 2100]) {
      result.push({ year, population: Math.max(0, Math.round(predict(year))) });
    }
    return respond(200, result);
  } catch (err) { return respond(500, { error: err.message }); }
};
