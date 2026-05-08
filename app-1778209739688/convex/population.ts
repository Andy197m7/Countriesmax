import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getGlobalTrends = query({
  args: { mode: v.union(v.literal("history"), v.literal("projections")) },
  returns: v.array(
    v.object({
      year: v.number(),
      population: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("populationRecords")
      .withIndex("by_country_code", (q) => q.eq("countryCode", "WLD"))
      .collect();

    return records
      .filter(r => args.mode === "history" ? r.year <= 2024 : r.year >= 2024)
      .map((r) => ({ year: r.year, population: r.population }))
      .sort((a, b) => a.year - b.year);
  },
});

export const getCountryData = query({
  args: { code: v.string() },
  returns: v.object({
    country: v.object({
      _id: v.id("countries"),
      _creationTime: v.number(),
      name: v.string(),
      code: v.string(),
      region: v.string(),
      subregion: v.string(),
      medianAge: v.optional(v.number()),
      lifeExpectancy: v.optional(v.number()),
      growthCIA: v.optional(v.number()),
      growthWB: v.optional(v.number()),
      growthUN: v.optional(v.number()),
    }),
    records: v.array(v.object({
      year: v.number(),
      population: v.number(),
    }))
  }),
  handler: async (ctx, args) => {
    const country = await ctx.db
      .query("countries")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .unique();
    
    if (!country) {
      // Fallback for global or missing
      const world = await ctx.db.query("countries").withIndex("by_code", q => q.eq("code", "WLD")).unique();
      const records = await ctx.db.query("populationRecords").withIndex("by_country_code", q => q.eq("countryCode", "WLD")).collect();
      return {
        country: world!,
        records: records.map(r => ({ year: r.year, population: r.population })).sort((a, b) => a.year - b.year)
      };
    }

    const records = await ctx.db
      .query("populationRecords")
      .withIndex("by_country_code", (q) => q.eq("countryCode", args.code))
      .collect();

    return {
      country,
      records: records
        .map(r => ({ year: r.year, population: r.population }))
        .sort((a, b) => a.year - b.year)
    };
  }
});

export const searchCountries = query({
  args: { query: v.string() },
  returns: v.array(v.object({
    name: v.string(),
    code: v.string(),
  })),
  handler: async (ctx, args) => {
    if (!args.query) return [];
    const countries = await ctx.db.query("countries").collect();
    return countries
      .filter(c => c.name.toLowerCase().includes(args.query.toLowerCase()))
      .slice(0, 5)
      .map(c => ({ name: c.name, code: c.code }));
  }
});

export const getHotspots = query({
  args: { limit: v.number() },
  returns: v.array(
    v.object({
      countryName: v.string(),
      countryCode: v.string(),
      currentPopulation: v.number(),
      growthRate: v.number(),
      medianAge: v.optional(v.number()),
    })
  ),
  handler: async (ctx, args) => {
    const countries = await ctx.db.query("countries").collect();
    const hotspots = [];

    for (const country of countries) {
      if (country.code === "WLD") continue;
      const records = await ctx.db
        .query("populationRecords")
        .withIndex("by_country_code", (q) => q.eq("countryCode", country.code))
        .collect();
      
      const r2024 = records.find(r => r.year === 2024);
      const r2030 = records.find(r => r.year === 2030);

      if (r2024 && r2030) {
        const growthRate = ((r2030.population - r2024.population) / r2024.population / 6) * 100;
        hotspots.push({
          countryName: country.name,
          countryCode: country.code,
          currentPopulation: r2024.population,
          growthRate,
          medianAge: country.medianAge,
        });
      }
      }

    return hotspots
      .sort((a, b) => b.growthRate - a.growthRate)
      .slice(0, args.limit);
  },
});

export const listAllCountries = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("countries"),
    _creationTime: v.number(),
    name: v.string(),
    code: v.string(),
    region: v.string(),
    subregion: v.string(),
    growthCIA: v.optional(v.number()),
    growthWB: v.optional(v.number()),
    growthUN: v.optional(v.number()),
    medianAge: v.optional(v.number()),
    lifeExpectancy: v.optional(v.number()),
  })),
  handler: async (ctx) => {
    return await ctx.db.query("countries").collect();
  }
});

export const syncDemographics = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const ageData = await (ctx.db as any).query("median_age").collect();
    for (const d of ageData) {
      const existing = await ctx.db
        .query("countries")
        .withIndex("by_code", (q) => q.eq("code", d.countryCode))
        .unique();
      
      if (existing) {
        await ctx.db.patch(existing._id, {
          medianAge: d.medianAge,
        });
      } else {
        await ctx.db.insert("countries", {
          name: d.countryName,
          code: d.countryCode,
          region: "Global",
          subregion: "Global",
          medianAge: d.medianAge,
        });
        
        // Add minimal population records so it doesn't crash the dashboard
        const currentPop = 10000000; // placeholder 10M
        const historicalYears = [1970, 1980, 1990, 2000, 2010, 2020, 2024];
        for (const year of historicalYears) {
           await ctx.db.insert("populationRecords", {
             countryCode: d.countryCode,
             year,
             population: Math.round(currentPop * (0.5 + (year - 1970) * 0.01))
           });
        }
        const futureYears = [2030, 2050, 2100];
        for (const year of futureYears) {
           await ctx.db.insert("populationRecords", {
             countryCode: d.countryCode,
             year,
             population: Math.round(currentPop * (1.1 + (year - 2024) * 0.005))
           });
        }
      }
    }
    return null;
  }
});

export const addRequestedCountries = mutation({
  args: { countries: v.array(v.object({ name: v.string(), code: v.string() })) },
  returns: v.null(),
  handler: async (ctx, args) => {
    for (const c of args.countries) {
      const existing = await ctx.db
        .query("countries")
        .withIndex("by_code", (q) => q.eq("code", c.code))
        .unique();
      
      if (!existing) {
        await ctx.db.insert("countries", {
          name: c.name,
          code: c.code,
          region: "Global",
          subregion: "Global",
        });
        
        const currentPop = 5000000; // placeholder 5M
        const years = [1970, 1980, 1990, 2000, 2010, 2020, 2024, 2030, 2050, 2100];
        for (const year of years) {
           await ctx.db.insert("populationRecords", {
             countryCode: c.code,
             year,
             population: Math.round(currentPop * (0.7 + (year - 1970) * 0.01))
           });
        }
      }
    }
    return null;
  }
});

export const seedData = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const existingCountries = await ctx.db.query("countries").collect();
    for (const c of existingCountries) await ctx.db.delete(c._id);
    const existingRecords = await ctx.db.query("populationRecords").collect();
    for (const r of existingRecords) await ctx.db.delete(r._id);

    const countryData = [
      { name: "World", code: "WLD", r2024: 8118836000, r2030: 8546141000, r2050: 9709492000, r2100: 10349323000, age: 31.0, life: 73.3, growthCIA: 1.17, growthWB: 0.99, growthUN: 1.09 },
      { name: "Afghanistan", code: "AFG", r2024: 42647492, r2030: 50039402, r2050: 76885134, r2100: 130216739, age: 20.0, life: 54.1, growthCIA: 2.22, growthWB: 2.7, growthUN: 2.41 },
      { name: "Albania", code: "ALB", r2024: 2791765, r2030: 2671885, r2050: 2240166, r2100: 1184997, age: 36.3, life: 79.5, growthCIA: 0.16, growthWB: -1.1, growthUN: 0.13 },
      { name: "Algeria", code: "DZA", r2024: 46814308, r2030: 50154166, r2050: 59565554, r2100: 64487527, age: 29.1, life: 77.8, growthCIA: 1.54, growthWB: 1.6, growthUN: 1.67 },
      { name: "Angola", code: "AGO", r2024: 37885849, r2030: 45160458, r2050: 74295394, r2100: 150045574, age: 16.3, life: 62.1, growthCIA: 3.33, growthWB: 3.0, growthUN: 3.28 },
      { name: "Argentina", code: "ARG", r2024: 45696159, r2030: 46585022, r2050: 48308944, r2100: 38255990, age: 33.3, life: 77.1, growthCIA: 0.79, growthWB: 0.9, growthUN: 0.94 },
      { name: "Australia", code: "AUS", r2024: 26713205, r2030: 28188539, r2050: 32506969, r2100: 43143685, age: 38.1, life: 83.2, growthCIA: 1.13, growthWB: 2.4, growthUN: 1.30 },
      { name: "Bangladesh", code: "BGD", r2024: 174701211, r2030: 184424144, r2050: 203904900, r2100: 176366038, age: 29.6, life: 73.0, growthCIA: 0.89, growthWB: 1.0, growthUN: 1.04 },
      { name: "Brazil", code: "BRA", r2024: 217637297, r2030: 223908968, r2050: 230885725, r2100: 184547593, age: 35.1, life: 76.2, growthCIA: 0.61, growthWB: 0.5, growthUN: 0.63 },
      { name: "Canada", code: "CAN", r2024: 39107046, r2030: 41008596, r2050: 45890819, r2100: 53903779, age: 42.6, life: 82.8, growthCIA: 0.71, growthWB: 2.9, growthUN: 0.90 },
      { name: "China", code: "CHN", r2024: 1425178782, r2030: 1415605906, r2050: 1312636325, r2100: 633368108, age: 40.2, life: 78.2, growthCIA: 0.23, growthWB: -0.1, growthUN: 0.39 },
      { name: "DR Congo", code: "COD", r2024: 105625114, r2030: 127582053, r2050: 217494003, r2100: 432378400, age: 16.9, life: 60.1, growthCIA: 3.13, growthWB: 3.2, growthUN: 3.22 },
      { name: "Egypt", code: "EGY", r2024: 114484252, r2030: 125151725, r2050: 160339889, r2100: 205225076, age: 24.4, life: 70.2, growthCIA: 1.59, growthWB: 1.5, growthUN: 1.87 },
      { name: "Ethiopia", code: "ETH", r2024: 129719719, r2030: 149296378, r2050: 214812309, r2100: 323741600, age: 20.4, life: 66.0, growthCIA: 2.42, growthWB: 2.5, growthUN: 2.43 },
      { name: "France", code: "FRA", r2024: 64881830, r2030: 65543452, r2050: 65827072, r2100: 60851673, age: 42.6, life: 82.5, growthCIA: 0.31, growthWB: 0.3, growthUN: 0.39 },
      { name: "Germany", code: "DEU", r2024: 83252474, r2030: 82762675, r2050: 78932228, r2100: 68936102, age: 46.8, life: 81.3, growthCIA: -0.12, growthWB: -0.1, growthUN: 0.20 },
      { name: "India", code: "IND", r2024: 1441719852, r2030: 1514994080, r2050: 1670490596, r2100: 1529850119, age: 29.8, life: 70.1, growthCIA: 0.70, growthWB: 0.8, growthUN: 1.10 },
      { name: "Indonesia", code: "IDN", r2024: 279798049, r2030: 292150100, r2050: 317225213, r2100: 296623475, age: 31.5, life: 72.3, growthCIA: 0.76, growthWB: 0.7, growthUN: 1.05 },
      { name: "Israel", code: "ISR", r2024: 9311652, r2030: 10134951, r2050: 12991790, r2100: 18410403, age: 30.1, life: 82.8, growthCIA: 1.43, growthWB: 2.1, growthUN: 1.55 },
      { name: "Italy", code: "ITA", r2024: 58697744, r2030: 57544258, r2050: 52250484, r2100: 36874247, age: 48.4, life: 82.3, growthCIA: -0.11, growthWB: -0.3, growthUN: -0.13 },
      { name: "Japan", code: "JPN", r2024: 122631432, r2030: 118514802, r2050: 103784357, r2100: 73644064, age: 49.9, life: 84.7, growthCIA: -0.41, growthWB: -0.5, growthUN: -0.23 },
      { name: "Mexico", code: "MEX", r2024: 129388467, r2030: 134534107, r2050: 143772364, r2100: 115626629, age: 30.8, life: 75.3, growthCIA: 0.61, growthWB: 0.7, growthUN: 1.23 },
      { name: "Nigeria", code: "NGA", r2024: 229152217, r2030: 262580426, r2050: 377459883, r2100: 546091662, age: 19.3, life: 54.1, growthCIA: 2.53, growthWB: 2.4, growthUN: 2.58 },
      { name: "Pakistan", code: "PAK", r2024: 245209815, r2030: 274029836, r2050: 367808468, r2100: 487017405, age: 22.9, life: 69.1, growthCIA: 1.91, growthWB: 2.0, growthUN: 1.91 },
      { name: "Russia", code: "RUS", r2024: 143957079, r2030: 141432741, r2050: 133133035, r2100: 112068747, age: 41.9, life: 72.8, growthCIA: -0.24, growthWB: -0.3, growthUN: 0.01 },
      { name: "South Africa", code: "ZAF", r2024: 61020221, r2030: 64659278, r2050: 73529753, r2100: 74559590, age: 30.4, life: 64.9, growthCIA: 1.07, growthWB: 0.9, growthUN: 1.20 },
      { name: "United Kingdom", code: "GBR", r2024: 67961439, r2030: 69175770, r2050: 71684966, r2100: 70485072, age: 40.8, life: 81.7, growthCIA: 0.49, growthWB: 0.8, growthUN: 0.58 },
      { name: "United States", code: "USA", r2024: 341814420, r2030: 352162301, r2050: 375391963, r2100: 394041155, age: 38.9, life: 77.2, growthCIA: 0.68, growthWB: 0.5, growthUN: 0.71 },
      { name: "Vietnam", code: "VNM", r2024: 99497680, r2030: 102699905, r2050: 107012939, r2100: 91036732, age: 33.1, life: 75.2, growthCIA: 0.93, growthWB: 0.7, growthUN: 1.00 },
    ];

    for (const d of countryData) {
      await ctx.db.insert("countries", { 
        name: d.name, 
        code: d.code, 
        region: "Global", 
        subregion: "Global",
        medianAge: d.age,
        lifeExpectancy: d.life,
        growthCIA: d.growthCIA,
        growthWB: d.growthWB,
        growthUN: d.growthUN
      });

      const historicalPoints = [
        { year: 1970, pop: d.r2024 * 0.45 },
        { year: 1980, pop: d.r2024 * 0.55 },
        { year: 1990, pop: d.r2024 * 0.65 },
        { year: 2000, pop: d.r2024 * 0.75 },
        { year: 2010, pop: d.r2024 * 0.85 },
        { year: 2020, pop: d.r2024 * 0.95 },
      ];

      for (const h of historicalPoints) {
        await ctx.db.insert("populationRecords", {
          countryCode: d.code,
          year: h.year,
          population: Math.round(h.pop),
        });
      }

      await ctx.db.insert("populationRecords", { countryCode: d.code, year: 2024, population: d.r2024 });
      await ctx.db.insert("populationRecords", { countryCode: d.code, year: 2030, population: d.r2030 });
      await ctx.db.insert("populationRecords", { countryCode: d.code, year: 2050, population: d.r2050 });
      await ctx.db.insert("populationRecords", { countryCode: d.code, year: 2100, population: d.r2100 });
    }
    return null;
  },
});

export const ingestGrowthBatch = mutation({
  args: {
    batch: v.array(
      v.object({
        countryCode: v.string(),
        countryName: v.string(),
        medianAge: v.number(),
        ciaGrowth: v.string(),
        wbGrowth: v.string(),
        unGrowth: v.string(),
      })
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    for (const item of args.batch) {
      const cia = parseFloat(item.ciaGrowth.replace("%", ""));
      const wb = parseFloat(item.wbGrowth.replace("%", ""));
      const un = parseFloat(item.unGrowth.replace("%", ""));

      const existing = await ctx.db
        .query("countries")
        .withIndex("by_code", (q) => q.eq("code", item.countryCode))
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, {
          medianAge: item.medianAge,
          growthCIA: cia,
          growthWB: wb,
          growthUN: un,
        });
      } else {
        await ctx.db.insert("countries", {
          name: item.countryName,
          code: item.countryCode,
          region: "Global",
          subregion: "Global",
          medianAge: item.medianAge,
          growthCIA: cia,
          growthWB: wb,
          growthUN: un,
        });

        // Add placeholder records if it's a new country
        const currentPop = 5000000;
        const years = [1970, 1980, 1990, 2000, 2010, 2020, 2024, 2030, 2050, 2100];
        for (const year of years) {
          await ctx.db.insert("populationRecords", {
            countryCode: item.countryCode,
            year,
            population: Math.round(currentPop * (0.8 + (year - 1970) * 0.01)),
          });
        }
      }
    }
    return null;
  },
});

export const updateHighFidelityProjections = mutation({
  args: {
    data: v.array(
      v.object({
        name: v.string(),
        r2024: v.number(),
        r2030: v.number(),
        r2050: v.number(),
        r2100: v.number(),
      })
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const allCountries = await ctx.db.query("countries").collect();
    
    for (const item of args.data) {
      // Find country by name match
      const country = allCountries.find(c => 
        c.name.toLowerCase() === item.name.toLowerCase() || 
        c.name.toLowerCase().includes(item.name.toLowerCase()) ||
        item.name.toLowerCase().includes(c.name.toLowerCase())
      );

      if (country) {
        const projections = [
          { year: 2024, pop: item.r2024 },
          { year: 2030, pop: item.r2030 },
          { year: 2050, pop: item.r2050 },
          { year: 2100, pop: item.r2100 },
        ];

        for (const p of projections) {
          const existing = await ctx.db
            .query("populationRecords")
            .withIndex("by_country_code_and_year", (q) => 
              q.eq("countryCode", country.code).eq("year", p.year)
            )
            .unique();
          
          if (existing) {
            await ctx.db.patch(existing._id, { population: Math.round(p.pop) });
          } else {
            await ctx.db.insert("populationRecords", {
              countryCode: country.code,
              year: p.year,
              population: Math.round(p.pop),
            });
          }
        }
      }
    }
    return null;
  },
});
