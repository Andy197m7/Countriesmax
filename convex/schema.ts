import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  countries: defineTable({
    name: v.string(),
    code: v.string(), // ISO 3166-1 alpha-3
    region: v.string(),
    subregion: v.string(),
    medianAge: v.optional(v.number()),
    lifeExpectancy: v.optional(v.number()),
    growthCIA: v.optional(v.number()),
    growthWB: v.optional(v.number()),
    growthUN: v.optional(v.number()),
    netMigration: v.optional(v.number()),
  }).index("by_code", ["code"]),

  populationRecords: defineTable({
    countryCode: v.string(),
    year: v.number(),
    population: v.number(),
  })
    .index("by_country_code", ["countryCode"])
    .index("by_year", ["year"])
    .index("by_country_code_and_year", ["countryCode", "year"]),

  predictions: defineTable({
    countryCode: v.string(),
    targetYear: v.number(),
    predictedPopulation: v.number(),
    confidence: v.number(),
    analysis: v.string(),
  }).index("by_country_code", ["countryCode"]),
});
