/**
 * PopulationMax — High-Performance Projection Engine (C++17)
 *
 * Computes population projections for 200+ countries using three methods:
 *   1. Linear regression       (baseline)
 *   2. Exponential smoothing   (trend-adaptive)
 *   3. Logistic growth model   (carrying-capacity-aware)
 *
 * Designed for batch processing: reads data.json, writes projections.json.
 * Can be compiled as a standalone CLI or embedded as a native module.
 *
 * Build:
 *   g++ -std=c++17 -O2 -o projector projector.cpp -lm
 *   ./projector --data data.json --output projections.json
 *
 * Or with CMake:
 *   cmake -B build && cmake --build build
 */

#include <algorithm>
#include <cmath>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <map>
#include <numeric>
#include <sstream>
#include <stdexcept>
#include <string>
#include <vector>

// ─── Minimal JSON helpers (no external deps) ────────────────────────────────
// Production code would use nlohmann/json or RapidJSON.
// This lightweight parser covers the exact schema of data.json.

namespace json_util {

// Read entire file to string
std::string read_file(const std::string& path) {
    std::ifstream f(path);
    if (!f) throw std::runtime_error("Cannot open: " + path);
    return {std::istreambuf_iterator<char>(f), {}};
}

// Extract the value of a simple string key from a flat JSON object
std::string extract_str(const std::string& obj, const std::string& key) {
    auto pos = obj.find("\"" + key + "\"");
    if (pos == std::string::npos) return "";
    pos = obj.find(':', pos) + 1;
    while (pos < obj.size() && (obj[pos] == ' ' || obj[pos] == '\n')) ++pos;
    if (obj[pos] == '"') {
        auto end = obj.find('"', pos + 1);
        return obj.substr(pos + 1, end - pos - 1);
    }
    // numeric
    auto end = obj.find_first_of(",}\n", pos);
    return obj.substr(pos, end - pos);
}

} // namespace json_util

// ─── Domain types ────────────────────────────────────────────────────────────

struct Record {
    int    year;
    double population;
};

struct Country {
    std::string              code;
    std::string              name;
    std::string              region;
    double                   growthCIA{0.0};
    std::vector<Record>      records;
};

// ─── Statistical utilities ───────────────────────────────────────────────────

struct LinearModel { double slope, intercept; };

LinearModel linear_regression(const std::vector<double>& x,
                               const std::vector<double>& y) {
    const int n = static_cast<int>(x.size());
    if (n < 2) throw std::invalid_argument("Need ≥ 2 data points");

    double sx = std::accumulate(x.begin(), x.end(), 0.0);
    double sy = std::accumulate(y.begin(), y.end(), 0.0);
    double sxy = 0.0, sx2 = 0.0;
    for (int i = 0; i < n; ++i) { sxy += x[i] * y[i]; sx2 += x[i] * x[i]; }

    double denom = n * sx2 - sx * sx;
    if (std::abs(denom) < 1e-9) throw std::runtime_error("Degenerate regression");

    double slope     = (n * sxy - sx * sy) / denom;
    double intercept = (sy - slope * sx) / n;
    return {slope, intercept};
}

double r_squared(const std::vector<double>& y_true,
                 const std::vector<double>& y_pred) {
    double mean_y = std::accumulate(y_true.begin(), y_true.end(), 0.0) / y_true.size();
    double ss_tot = 0.0, ss_res = 0.0;
    for (size_t i = 0; i < y_true.size(); ++i) {
        ss_tot += (y_true[i] - mean_y) * (y_true[i] - mean_y);
        ss_res += (y_true[i] - y_pred[i]) * (y_true[i] - y_pred[i]);
    }
    return ss_tot < 1e-12 ? 1.0 : 1.0 - ss_res / ss_tot;
}

// ─── Projection methods ──────────────────────────────────────────────────────

/** 1. Simple linear extrapolation on historical population. */
std::map<int, double> project_linear(const Country& c,
                                     const std::vector<int>& target_years) {
    std::vector<double> xs, ys;
    for (auto& r : c.records) {
        if (r.year <= 2024) { xs.push_back(r.year); ys.push_back(r.population); }
    }
    auto model = linear_regression(xs, ys);
    std::map<int, double> out;
    for (int yr : target_years)
        out[yr] = std::max(0.0, model.slope * yr + model.intercept);
    return out;
}

/** 2. Exponential smoothing: fit r in P(t) = P0 * e^(r*t). */
std::map<int, double> project_exponential(const Country& c,
                                          const std::vector<int>& target_years) {
    std::vector<double> xs, ys;
    for (auto& r : c.records) {
        if (r.year <= 2024 && r.population > 0) {
            xs.push_back(r.year);
            ys.push_back(std::log(r.population));
        }
    }
    auto model = linear_regression(xs, ys);   // fit on log scale
    std::map<int, double> out;
    for (int yr : target_years)
        out[yr] = std::exp(model.slope * yr + model.intercept);
    return out;
}

/** 3. Logistic growth: P(t) = K / (1 + A * e^(-r*t))
 *  K (carrying capacity) is estimated as 1.5× the maximum observed population. */
std::map<int, double> project_logistic(const Country& c,
                                       const std::vector<int>& target_years) {
    if (c.records.empty()) return {};

    double P_max = 0.0;
    for (auto& r : c.records)
        if (r.year <= 2024) P_max = std::max(P_max, r.population);

    const double K = P_max * 1.5;
    const double r = (c.growthCIA > 0.0 ? c.growthCIA : 1.2) / 100.0;

    // Use 2024 (or latest) population as P0
    double P0 = c.records.back().population;
    for (auto& rec : c.records)
        if (rec.year == 2024) { P0 = rec.population; break; }

    const int t0  = 2024;
    const double A = (K / P0) - 1.0;

    std::map<int, double> out;
    for (int yr : target_years) {
        double t = yr - t0;
        out[yr] = K / (1.0 + A * std::exp(-r * t));
    }
    return out;
}

// ─── Data loading (hand-rolled, schema-specific) ─────────────────────────────

std::vector<Country> parse_countries(const std::string& json) {
    std::vector<Country> countries;

    // Find "countries" array
    auto arr_start = json.find("\"countries\"");
    if (arr_start == std::string::npos) throw std::runtime_error("No 'countries' key");
    arr_start = json.find('[', arr_start);
    int depth = 0;
    size_t pos = arr_start;
    size_t obj_start = std::string::npos;

    while (pos < json.size()) {
        char ch = json[pos];
        if (ch == '{') {
            if (depth == 0) obj_start = pos;
            ++depth;
        } else if (ch == '}') {
            --depth;
            if (depth == 0 && obj_start != std::string::npos) {
                std::string obj = json.substr(obj_start, pos - obj_start + 1);
                Country c;
                c.code   = json_util::extract_str(obj, "code");
                c.name   = json_util::extract_str(obj, "name");
                c.region = json_util::extract_str(obj, "region");
                auto gstr = json_util::extract_str(obj, "growthCIA");
                if (!gstr.empty() && gstr != "null")
                    c.growthCIA = std::stod(gstr);
                if (!c.code.empty()) countries.push_back(std::move(c));
                obj_start = std::string::npos;
            }
        } else if (ch == ']' && depth == 0) break;
        ++pos;
    }
    return countries;
}

void attach_records(std::vector<Country>& countries, const std::string& json) {
    std::map<std::string, Country*> idx;
    for (auto& c : countries) idx[c.code] = &c;

    auto recs_start = json.find("\"records\"");
    if (recs_start == std::string::npos) return;
    recs_start = json.find('{', recs_start);

    // Scan top-level keys within records object
    size_t pos = recs_start + 1;
    while (pos < json.size()) {
        // Find next country code key
        auto key_start = json.find('"', pos);
        if (key_start == std::string::npos) break;
        auto key_end = json.find('"', key_start + 1);
        std::string code = json.substr(key_start + 1, key_end - key_start - 1);
        if (code.size() > 4) break;  // past records object

        auto arr_s = json.find('[', key_end);
        auto arr_e = json.find(']', arr_s);
        std::string arr = json.substr(arr_s, arr_e - arr_s + 1);

        if (idx.count(code)) {
            // Parse year/population pairs
            size_t p = 0;
            while ((p = arr.find('"', p)) != std::string::npos) {
                p = arr.find('{', p);
                if (p == std::string::npos) break;
                auto obj_e = arr.find('}', p);
                std::string obj = arr.substr(p, obj_e - p + 1);
                auto yr_s  = json_util::extract_str(obj, "year");
                auto pop_s = json_util::extract_str(obj, "population");
                if (!yr_s.empty() && !pop_s.empty())
                    idx[code]->records.push_back({std::stoi(yr_s), std::stod(pop_s)});
                p = obj_e + 1;
            }
            std::sort(idx[code]->records.begin(), idx[code]->records.end(),
                      [](auto& a, auto& b){ return a.year < b.year; });
        }
        pos = arr_e + 1;
    }
}

// ─── Output ──────────────────────────────────────────────────────────────────

void write_projections(const std::vector<Country>& countries,
                       const std::vector<int>& target_years,
                       const std::string& out_path) {
    std::ofstream f(out_path);
    if (!f) throw std::runtime_error("Cannot write: " + out_path);

    f << "[\n";
    bool first_c = true;
    for (auto& c : countries) {
        if (c.records.empty()) continue;
        if (!first_c) f << ",\n";
        first_c = false;

        auto lin  = project_linear(c, target_years);
        auto expn = project_exponential(c, target_years);
        auto logi = project_logistic(c, target_years);

        f << "  {\"code\":\"" << c.code << "\",\"name\":\"" << c.name
          << "\",\"projections\":[\n";
        bool first_y = true;
        for (int yr : target_years) {
            if (!first_y) f << ",\n";
            first_y = false;
            f << "    {\"year\":" << yr
              << ",\"linear\":"      << std::fixed << std::setprecision(0) << lin[yr]
              << ",\"exponential\":" << expn[yr]
              << ",\"logistic\":"    << logi[yr]
              << "}";
        }
        f << "\n  ]}";
    }
    f << "\n]\n";
    std::cout << "[WRITE] projections → " << out_path
              << "  (" << countries.size() << " countries)\n";
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

int main(int argc, char** argv) {
    std::string data_path    = "data.json";
    std::string output_path  = "projections.json";

    for (int i = 1; i < argc - 1; ++i) {
        std::string flag = argv[i];
        if (flag == "--data")   data_path   = argv[i + 1];
        if (flag == "--output") output_path = argv[i + 1];
    }

    try {
        std::cout << "[LOAD] reading " << data_path << " …\n";
        auto raw = json_util::read_file(data_path);

        auto countries = parse_countries(raw);
        std::cout << "[LOAD] " << countries.size() << " countries\n";
        attach_records(countries, raw);

        const std::vector<int> target_years = {2030, 2040, 2050, 2075, 2100};
        write_projections(countries, target_years, output_path);

        std::cout << "[DONE]\n";
    } catch (const std::exception& ex) {
        std::cerr << "ERROR: " << ex.what() << "\n";
        return 1;
    }
    return 0;
}
