/**
 * PopulationMax — Java API Client & Data Access Layer
 *
 * Provides:
 *   - PopulationApiClient : typed HTTP client for all backend endpoints
 *   - PopulationRepository: in-memory caching layer with TTL
 *   - PopulationAnalytics : statistical helpers (CAGR, percentile ranks, etc.)
 *   - CLI demo             : prints a summary table for any country code
 *
 * Requires Java 11+. No external dependencies (uses java.net.http).
 *
 * Build & run:
 *   javac PopulationMax.java
 *   java  PopulationMax USA
 */

import java.io.*;
import java.net.*;
import java.net.http.*;
import java.time.*;
import java.util.*;
import java.util.stream.*;

// ─── Domain models ────────────────────────────────────────────────────────────

record PopulationRecord(int year, long population) {}

record CountryMeta(
    String code,
    String name,
    String region,
    String subregion,
    Double medianAge,
    Double growthCIA,
    Double lifeExpectancy,
    Long   netMigration
) {}

record CountryDetail(CountryMeta country, List<PopulationRecord> records) {}

record Hotspot(
    String countryCode,
    String countryName,
    double growthRate,
    long   currentPopulation
) {}

record Projection(int year, long population) {}

// ─── Minimal JSON parser ──────────────────────────────────────────────────────
// Production code would use Jackson or Gson; this avoids external deps.

class JsonParser {

    static String strField(String json, String key) {
        int i = json.indexOf("\"" + key + "\"");
        if (i < 0) return null;
        i = json.indexOf(':', i) + 1;
        while (i < json.length() && json.charAt(i) == ' ') i++;
        if (json.charAt(i) == '"') {
            int end = json.indexOf('"', i + 1);
            return json.substring(i + 1, end);
        }
        int end = json.length();
        for (char ch : new char[]{',', '}', ']', '\n'}) {
            int p = json.indexOf(ch, i);
            if (p >= 0 && p < end) end = p;
        }
        String v = json.substring(i, end).trim();
        return v.equals("null") ? null : v;
    }

    static Double dblField(String json, String key) {
        String v = strField(json, key);
        return (v == null) ? null : Double.parseDouble(v);
    }

    static Long longField(String json, String key) {
        String v = strField(json, key);
        return (v == null) ? null : (long) Double.parseDouble(v);
    }

    /** Split a JSON array string into individual object strings. */
    static List<String> splitObjects(String arrayJson) {
        List<String> out = new ArrayList<>();
        int depth = 0, start = -1;
        for (int i = 0; i < arrayJson.length(); i++) {
            char ch = arrayJson.charAt(i);
            if (ch == '{') { if (depth++ == 0) start = i; }
            else if (ch == '}') { if (--depth == 0 && start >= 0) { out.add(arrayJson.substring(start, i + 1)); start = -1; } }
        }
        return out;
    }

    static PopulationRecord parseRecord(String obj) {
        return new PopulationRecord(
            Objects.requireNonNull(longField(obj, "year")).intValue(),
            Objects.requireNonNull(longField(obj, "population"))
        );
    }

    static CountryMeta parseMeta(String obj) {
        return new CountryMeta(
            strField(obj, "code"),     strField(obj, "name"),
            strField(obj, "region"),   strField(obj, "subregion"),
            dblField(obj, "medianAge"), dblField(obj, "growthCIA"),
            dblField(obj, "lifeExpectancy"), longField(obj, "netMigration")
        );
    }

    static Hotspot parseHotspot(String obj) {
        return new Hotspot(
            strField(obj, "countryCode"), strField(obj, "countryName"),
            Objects.requireNonNull(dblField(obj, "growthRate")),
            Objects.requireNonNull(longField(obj, "currentPopulation"))
        );
    }

    static Projection parseProjection(String obj) {
        return new Projection(
            Objects.requireNonNull(longField(obj, "year")).intValue(),
            Objects.requireNonNull(longField(obj, "population"))
        );
    }
}

// ─── HTTP client ──────────────────────────────────────────────────────────────

class PopulationApiClient {

    private final String baseUrl;
    private final HttpClient http;

    PopulationApiClient(String baseUrl) {
        this.baseUrl = baseUrl.replaceAll("/$", "");
        this.http    = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
    }

    private String get(String path) throws IOException, InterruptedException {
        var req = HttpRequest.newBuilder()
            .uri(URI.create(baseUrl + path))
            .timeout(Duration.ofSeconds(15))
            .GET().build();
        var res = http.send(req, HttpResponse.BodyHandlers.ofString());
        if (res.statusCode() != 200)
            throw new IOException("HTTP " + res.statusCode() + " for " + path);
        return res.body();
    }

    List<CountryMeta> getCountries() throws IOException, InterruptedException {
        return JsonParser.splitObjects(get("/api/countries"))
            .stream().map(JsonParser::parseMeta).collect(Collectors.toList());
    }

    CountryDetail getCountry(String code) throws IOException, InterruptedException {
        String body = get("/api/country/" + code.toUpperCase());
        // body = { "country": {...}, "records": [...] }
        int ci = body.indexOf("\"country\"");
        int ri = body.indexOf("\"records\"");
        String countryObj  = body.substring(body.indexOf('{', ci), body.indexOf('}', ci) + 1);
        String recordsArr  = body.substring(body.indexOf('[', ri), body.lastIndexOf(']') + 1);
        var meta    = JsonParser.parseMeta(countryObj);
        var records = JsonParser.splitObjects(recordsArr)
            .stream().map(JsonParser::parseRecord).collect(Collectors.toList());
        return new CountryDetail(meta, records);
    }

    List<PopulationRecord> getGlobalTrends(String mode) throws IOException, InterruptedException {
        return JsonParser.splitObjects(get("/api/global-trends?mode=" + mode))
            .stream().map(JsonParser::parseRecord).collect(Collectors.toList());
    }

    List<Hotspot> getHotspots(int limit) throws IOException, InterruptedException {
        return JsonParser.splitObjects(get("/api/hotspots?limit=" + limit))
            .stream().map(JsonParser::parseHotspot).collect(Collectors.toList());
    }

    List<Projection> getProjections(String code) throws IOException, InterruptedException {
        return JsonParser.splitObjects(get("/api/predict/" + code.toUpperCase()))
            .stream().map(JsonParser::parseProjection).collect(Collectors.toList());
    }
}

// ─── Caching repository ───────────────────────────────────────────────────────

class PopulationRepository {

    private final PopulationApiClient client;
    private final long ttlMillis;
    private final Map<String, Object>  cache   = new HashMap<>();
    private final Map<String, Long>    expires = new HashMap<>();

    PopulationRepository(PopulationApiClient client, Duration ttl) {
        this.client    = client;
        this.ttlMillis = ttl.toMillis();
    }

    @SuppressWarnings("unchecked")
    private <T> T cached(String key, ThrowingSupplier<T> loader)
        throws IOException, InterruptedException {
        long now = System.currentTimeMillis();
        if (cache.containsKey(key) && expires.get(key) > now)
            return (T) cache.get(key);
        T value = loader.get();
        cache.put(key, value);
        expires.put(key, now + ttlMillis);
        return value;
    }

    @FunctionalInterface interface ThrowingSupplier<T> {
        T get() throws IOException, InterruptedException;
    }

    List<CountryMeta> countries() throws IOException, InterruptedException {
        return cached("countries", client::getCountries);
    }

    CountryDetail country(String code) throws IOException, InterruptedException {
        return cached("country:" + code, () -> client.getCountry(code));
    }

    List<Hotspot> hotspots(int limit) throws IOException, InterruptedException {
        return cached("hotspots:" + limit, () -> client.getHotspots(limit));
    }

    List<Projection> projections(String code) throws IOException, InterruptedException {
        return cached("predict:" + code, () -> client.getProjections(code));
    }
}

// ─── Analytics ────────────────────────────────────────────────────────────────

class PopulationAnalytics {

    /** Compound annual growth rate between two records. */
    static double cagr(PopulationRecord from, PopulationRecord to) {
        int years = to.year() - from.year();
        if (years <= 0 || from.population() <= 0) return Double.NaN;
        return Math.pow((double) to.population() / from.population(), 1.0 / years) - 1.0;
    }

    /** Percentile rank of a value within a list (0–100). */
    static double percentileRank(List<Double> sorted, double value) {
        long below = sorted.stream().filter(v -> v < value).count();
        return 100.0 * below / sorted.size();
    }

    /**
     * Compare a country's 2024 growth rate (CIA) against all countries
     * and return its percentile rank.
     */
    static double growthPercentile(CountryMeta target, List<CountryMeta> all) {
        if (target.growthCIA() == null) return Double.NaN;
        var rates = all.stream()
            .filter(c -> c.growthCIA() != null)
            .map(CountryMeta::growthCIA)
            .sorted()
            .collect(Collectors.toList());
        return percentileRank(rates, target.growthCIA());
    }

    /** Human-readable compact number (e.g. 8.1B, 330M, 4.5K). */
    static String compact(long n) {
        if (n >= 1_000_000_000L) return String.format("%.1fB", n / 1e9);
        if (n >= 1_000_000L)     return String.format("%.1fM", n / 1e6);
        if (n >= 1_000L)         return String.format("%.1fK", n / 1e3);
        return String.valueOf(n);
    }
}

// ─── CLI demo ─────────────────────────────────────────────────────────────────

public class PopulationMax {

    public static void main(String[] args) {
        String code = (args.length > 0) ? args[0] : "WLD";
        // Default to the local dev server; override with env var
        String base = System.getenv().getOrDefault(
            "POPULATION_API_URL", "http://localhost:8888");

        var client = new PopulationApiClient(base);
        var repo   = new PopulationRepository(client, Duration.ofMinutes(5));

        try {
            System.out.println("─".repeat(60));
            System.out.println("  PopulationMax  –  Country Profile: " + code.toUpperCase());
            System.out.println("─".repeat(60));

            CountryDetail detail = repo.country(code);
            CountryMeta   meta   = detail.country();
            List<PopulationRecord> records = detail.records();

            System.out.printf("  %-18s %s (%s / %s)%n",
                "Country:", meta.name(), meta.region(), meta.subregion());
            System.out.printf("  %-18s %.1f years%n",
                "Median Age:", meta.medianAge() != null ? meta.medianAge() : Double.NaN);
            System.out.printf("  %-18s %.1f years%n",
                "Life Expectancy:", meta.lifeExpectancy() != null ? meta.lifeExpectancy() : Double.NaN);
            System.out.printf("  %-18s %.2f %%%n",
                "Growth (CIA):", meta.growthCIA() != null ? meta.growthCIA() : Double.NaN);

            // Growth percentile among all countries
            var allCountries = repo.countries();
            double pct = PopulationAnalytics.growthPercentile(meta, allCountries);
            if (!Double.isNaN(pct))
                System.out.printf("  %-18s %.0f th percentile%n", "Growth Rank:", pct);

            System.out.println("\n  Historical records:");
            System.out.printf("  %-8s %-16s %s%n", "Year", "Population", "CAGR vs prev");
            System.out.println("  " + "─".repeat(40));
            for (int i = 0; i < records.size(); i++) {
                var r = records.get(i);
                if (r.year() > 2024) continue;
                String cagrStr = i == 0 ? "—" : String.format("%.2f %%",
                    PopulationAnalytics.cagr(records.get(i - 1), r) * 100);
                System.out.printf("  %-8d %-16s %s%n",
                    r.year(), PopulationAnalytics.compact(r.population()), cagrStr);
            }

            System.out.println("\n  Projections:");
            System.out.printf("  %-8s %-16s%n", "Year", "Population");
            System.out.println("  " + "─".repeat(28));
            for (var proj : repo.projections(code))
                System.out.printf("  %-8d %s%n",
                    proj.year(), PopulationAnalytics.compact(proj.population()));

            System.out.println("\n  Top 5 growth hotspots:");
            System.out.printf("  %-6s %-24s %-10s %s%n",
                "Rank", "Country", "Growth%", "Population");
            System.out.println("  " + "─".repeat(52));
            int rank = 1;
            for (var hs : repo.hotspots(5)) {
                System.out.printf("  %-6d %-24s %-10.2f %s%n",
                    rank++, hs.countryName(), hs.growthRate(),
                    PopulationAnalytics.compact(hs.currentPopulation()));
            }

            System.out.println("─".repeat(60));
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            System.exit(1);
        }
    }
}
