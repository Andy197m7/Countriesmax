const path = require("path");
const fs = require("fs");

let _cache = null;

function loadData() {
  if (_cache) return _cache;
  const dataPath = path.join(__dirname, "../../data.json");
  _cache = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  return _cache;
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Content-Type": "application/json",
  };
}

function respond(statusCode, body) {
  return { statusCode, headers: corsHeaders(), body: JSON.stringify(body) };
}

function getCountries() { return loadData().countries; }
function getRecordsMap() { return loadData().records; }
function getCountryByCode(code) { return getCountries().find((c) => c.code === code) || null; }
function getRecordsByCode(code) { return getRecordsMap()[code] || []; }

module.exports = { getCountries, getRecordsMap, getCountryByCode, getRecordsByCode, corsHeaders, respond };
