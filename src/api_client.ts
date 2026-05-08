
const BASE_URL = "/api";

export const api = {
  listAllCountries: async () => {
    try {
      const res = await fetch(`${BASE_URL}/countries`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    } catch (e) {
      console.error("Fetch error in listAllCountries:", e);
      throw e;
    }
  },
  searchCountries: async (query: string) => {
    try {
      const res = await fetch(`${BASE_URL}/search?query=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    } catch (e) {
      console.error("Fetch error in searchCountries:", e);
      throw e;
    }
  },
  getCountryData: async (code: string) => {
    try {
      const res = await fetch(`${BASE_URL}/country/${code}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    } catch (e) {
      console.error("Fetch error in getCountryData:", e);
      throw e;
    }
  },
  getGlobalTrends: async (mode: string) => {
    try {
      const res = await fetch(`${BASE_URL}/global-trends?mode=${mode}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    } catch (e) {
      console.error("Fetch error in getGlobalTrends:", e);
      throw e;
    }
  },
  getHotspots: async (limit: number) => {
    try {
      const res = await fetch(`${BASE_URL}/hotspots?limit=${limit}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    } catch (e) {
      console.error("Fetch error in getHotspots:", e);
      throw e;
    }
  },
  predict: async (code: string) => {
    try {
      const res = await fetch(`${BASE_URL}/predict/${code}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    } catch (e) {
      console.error("Fetch error in predict:", e);
      throw e;
    }
  }
};
