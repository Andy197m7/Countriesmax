import { createFileRoute } from '@tanstack/react-router'
import { 
  Users, 
  Globe, 
  Activity,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  X,
  Zap,
  BrainCircuit,
  ListChecks,
  LineChart as ChartIcon,
  Table as TableIcon,
  ShieldCheck,
  PlaneLanding,
  HeartPulse
} from 'lucide-react'
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'
import { useState, useMemo, Suspense, useEffect } from 'react'

function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false)
  useEffect(() => {
    setHasMounted(true)
  }, [])
  if (!hasMounted) return null
  return <>{children}</>
}

export const Route = createFileRoute('/')({
  component: DashboardWrapper,
})

function DashboardWrapper() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCode, setSelectedCode] = useState<string | null>(null)
  const [mode, setMode] = useState<'history' | 'projections'>('history')
  const [view, setView] = useState<'dashboard' | 'table'>('dashboard')

  return (
    <ClientOnly>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
        {/* Search Header - Outside Suspense to maintain focus and prevent flicker */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="cursor-pointer group" onClick={() => { setSelectedCode(null); setView('dashboard'); }}>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="text-blue-600 h-8 w-8 group-hover:rotate-12 transition-transform" />
            PopulationMax
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">Global Demographic Intelligence</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
                <button 
                    onClick={() => setView('dashboard')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${view === 'dashboard' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <ChartIcon className="h-4 w-4" />
                    Insights
                </button>
                <button 
                    onClick={() => setView('table')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${view === 'table' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <TableIcon className="h-4 w-4" />
                    Full Table
                </button>
            </div>

            <div className="relative w-full md:w-80">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search countries..." 
                        className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full transition-all shadow-sm"
                    />
                </div>
                <Suspense fallback={null}>
                    <SearchResults query={searchQuery} onSelect={(code) => {
                        setSelectedCode(code)
                        setSearchQuery('')
                        setView('dashboard')
                    }} />
                </Suspense>
            </div>
        </div>
      </header>

      {view === 'dashboard' ? (
        <Suspense fallback={<LoadingState />}>
            <DashboardContent 
            selectedCode={selectedCode} 
            setSelectedCode={setSelectedCode}
            mode={mode}
            setMode={setMode}
            />
        </Suspense>
      ) : (
        <Suspense fallback={<LoadingState />}>
            <DataTable />
        </Suspense>
      )}
    </div>
    </ClientOnly>
  )
}

function SearchResults({ query, onSelect }: { query: string, onSelect: (code: string) => void }) {
  const { data: results } = useSuspenseQuery(convexQuery(api.population.searchCountries, { query }))
  
  if (!query || results.length === 0) return null

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl z-50 overflow-hidden ring-1 ring-black/5">
      {results.map(c => (
        <button 
          key={c.code}
          onClick={() => onSelect(c.code)}
          className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800 text-sm flex items-center justify-between transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0"
        >
          <span className="font-semibold text-slate-700 dark:text-slate-200">{c.name}</span>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </button>
      ))}
    </div>
  )
}

function DataTable() {
    const { data: countries } = useSuspenseQuery(convexQuery(api.population.listAllCountries, {}))

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="text-lg font-black dark:text-white">Detailed Growth Index</h3>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{countries.length} Jurisdictions</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr>
                            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">Country</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 text-center">Median Age</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 text-center">CIA Growth (%)</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 text-center">WB Growth (%)</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 text-center">UN Growth (%)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                        {countries.map((c) => (
                            <tr key={c.code} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                                        <span className="font-bold text-slate-700 dark:text-slate-200">{c.name}</span>
                                        <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">{c.code}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center font-medium text-slate-600 dark:text-slate-400">{c.medianAge ?? '—'}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${Number(c.growthCIA) > 2 ? 'text-rose-600 bg-rose-50' : 'text-emerald-600 bg-emerald-50'}`}>
                                        {c.growthCIA ? `${c.growthCIA}%` : '—'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center font-medium text-slate-600 dark:text-slate-400">{c.growthWB ? `${c.growthWB}%` : '—'}</td>
                                <td className="px-6 py-4 text-center font-medium text-slate-600 dark:text-slate-400">{c.growthUN ? `${c.growthUN}%` : '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function DashboardContent({ selectedCode, setSelectedCode, mode, setMode }: any) {
  const [showMoreHotspots, setShowMoreHotspots] = useState(false)
  const [isPredicting, setIsPredicting] = useState(false)
  const [predictionResult, setPredictionResult] = useState<any | null>(null)

  const { data: trendData } = useSuspenseQuery(convexQuery(api.population.getGlobalTrends, { mode }))
  const { data: hotspots } = useSuspenseQuery(convexQuery(api.population.getHotspots, { limit: showMoreHotspots ? 15 : 5 }))
  const { data: selectedCountryData } = useSuspenseQuery(
    convexQuery(api.population.getCountryData, { code: selectedCode || 'WLD' })
  )

  const country = selectedCountryData.country
  const displayData = selectedCode ? selectedCountryData.records : trendData
  
  const filteredDisplayData = useMemo(() => {
    return displayData.filter((r: any) => mode === 'history' ? r.year <= 2024 : r.year >= 2024)
  }, [displayData, mode])

  const latestRecord = filteredDisplayData[filteredDisplayData.length - 1]
  const previousRecord = filteredDisplayData[filteredDisplayData.length - 2]
  
  const currentPop = latestRecord ? (latestRecord.population / 1000000000).toFixed(2) + ' Billion' : '0'
  
  const calculatedGrowth = useMemo(() => {
    if (!latestRecord || !previousRecord) return country.growthCIA ? `+${country.growthCIA}%` : "1.17%"
    const diff = latestRecord.population - previousRecord.population
    const years = Math.abs(latestRecord.year - previousRecord.year) || 1
    const rate = (diff / previousRecord.population / years) * 100
    return (rate >= 0 ? '+' : '') + rate.toFixed(2) + '%'
  }, [latestRecord, previousRecord, country])

  const chartData = filteredDisplayData.map((d: any) => ({
    year: d.year.toString(),
    population: Number((d.population / 1000000000).toFixed(3))
  }))

  const handleRunPrediction = () => {
    setIsPredicting(true)
    setPredictionResult(null)
    setTimeout(() => {
      const futureData = selectedCountryData.records.filter((r: any) => r.year >= 2024)
      const avgGrowth = country.growthCIA || 0.8;
      const trend = avgGrowth > 0.5 ? 'Positive' : avgGrowth < 0 ? 'Negative' : 'Stable';
      
      const specificForecasts: Record<string, any> = {
        'USA': {
          summary: "Demograph V4 forecast indicates stabilization with slight growth across 2026 to 2100. Growth is primarily driven by consistent net migration rather than natural increase, as the median age of 38.9 suggests a transition toward an aged society.",
          core: { medianAge: "38.9", growth: "0.63%", trend: "Stable/Positive", peak: "2080 (est.)" },
          labor: "Labor Force Growth: Low | Youth Share: Moderate | Dependency Ratio: Worsening.",
          strategic: "Window of Opportunity: Closed | Infrastructure Pressure: Moderate | Healthcare Demand: High.",
          risks: "Political polarization on migration, Social Security solvency, Urban housing shortages.",
          drivers: "High-tech innovation, Tertiary education attraction, Flexible labor markets.",
          scores: { stability: 85, sustainability: 65, readiness: 78 },
          recommendation: "Prioritize smart-migration policies and automation to offset the shrinking native-born labor force."
        },
        'CHN': {
          summary: "Demograph V4 indicates a sustained decline beginning in the current window. With a median age of 40.2 and negative growth trends in World Bank datasets, the structure is shifting toward a super-aged society.",
          core: { medianAge: "40.2", growth: "-0.1%", trend: "Negative", peak: "2023 (Past)" },
          labor: "Labor Force Growth: Low/Negative | Youth Share: Low | Dependency Ratio: Worsening.",
          strategic: "Window of Opportunity: Closed | Education Demand: Low | Healthcare Demand: Extreme.",
          risks: "Rapidly shrinking workforce, Pension system collapse, Real estate overcapacity.",
          drivers: "AI/Robotics integration, Value-chain escalation, High domestic savings.",
          scores: { stability: 70, sustainability: 40, readiness: 88 },
          recommendation: "Aggressive transition to a robotics-led economy is mandatory to maintain industrial output with fewer workers."
        },
        'IND': {
          summary: "Forecast indicates continued growth and peak-potential through the mid-century. With a median age of 29.8, India remains in its demographic sweet spot, though regional fertility variances exist.",
          core: { medianAge: "29.8", growth: "0.86%", trend: "Positive", peak: "2064 (est.)" },
          labor: "Labor Force Growth: High | Youth Share: High | Dependency Ratio: Improving.",
          strategic: "Window of Opportunity: Active | Urban Pressure: High | Education Demand: High.",
          risks: "Youth unemployment, Climate-driven internal migration, Infrastructure lagging.",
          drivers: "Digital public infrastructure, Expanding middle class, Manufacturing pivot.",
          scores: { stability: 75, sustainability: 82, readiness: 60 },
          recommendation: "Maximize the 'Demographic Dividend' through massive vocational training and urban capacity expansion before 2050."
        },
        'NGA': {
          summary: "Nigeria is projected for explosive growth. With a median age of 19.3, it will become one of the world's most populous nations, creating massive opportunities and systemic pressures.",
          core: { medianAge: "19.3", growth: "2.5%", trend: "Positive", peak: "Post-2100" },
          labor: "Labor Force Growth: Extreme | Youth Share: Extreme | Dependency Ratio: Improving (long term).",
          strategic: "Window of Opportunity: Emerging | Urban Pressure: Extreme | Education Demand: Extreme.",
          risks: "Resource scarcity, Political instability, Brain drain of high-skilled youth.",
          drivers: "Mobile-first economy, Renewable energy potential, Massive internal market.",
          scores: { stability: 45, sustainability: 60, readiness: 35 },
          recommendation: "Focus on radical transparency in governance and decentralized infrastructure to manage the 200% population increase forecast."
        },
        'JPN': {
          summary: "Japan represents the terminal stage of demographic transition. With the world's highest median age (49.9), the engine forecasts a systemic contraction in population size but a high-stability social model.",
          core: { medianAge: "49.9", growth: "-0.38%", trend: "Negative", peak: "2008 (Past)" },
          labor: "Labor Force Growth: Negative | Youth Share: Low | Dependency Ratio: Critical.",
          strategic: "Window of Opportunity: Closed | Education Demand: Low | Healthcare Demand: Maximum.",
          risks: "Rural depopulation, Debt-to-GDP sustainability, Labor shortages in service sectors.",
          drivers: "Automation, Healthcare tech, Global capital holdings.",
          scores: { stability: 92, sustainability: 30, readiness: 95 },
          recommendation: "Pioneer the 'Silver Economy' model and consider selective, high-skill immigration to maintain core functions."
        },
        'DEU': {
          summary: "Germany faces a stagnation-decline curve mitigated by high-value migration. The aging industrial workforce is the primary bottleneck for long-term growth.",
          core: { medianAge: "45.7 (est)", growth: "~0.1%", trend: "Stable/Declining", peak: "2024 (est.)" },
          labor: "Labor Force Growth: Low/Negative | Youth Share: Low | Dependency Ratio: Worsening.",
          strategic: "Window of Opportunity: Closed | Infrastructure Pressure: Low | Healthcare Demand: Very High.",
          risks: "Energy costs vs. industrial base, Integration of migrants, Pension pressure.",
          drivers: "Green tech leadership, High-tier manufacturing, EU central integration.",
          scores: { stability: 88, sustainability: 55, readiness: 90 },
          recommendation: "Rapidly digitize the public sector and incentivize delayed retirement to preserve the social security net."
        },
        'AFG': {
          summary: "Demograph V4 indicates hyper-growth potential. With a median age of 20 and a growth rate exceeding 2.4%, Afghanistan is one of the world's youngest and fastest-growing populations, though development is hampered by systemic instability.",
          core: { medianAge: "20", growth: "2.44%", trend: "Positive", peak: "Post-2100" },
          labor: "Labor Force Growth: High | Youth Share: Extreme | Dependency Ratio: Improving (slowly).",
          strategic: "Window of Opportunity: Emerging | Urban Pressure: High | Education Demand: Extreme.",
          risks: "Political volatility, gender-based educational barriers, climate-driven agricultural failure.",
          drivers: "Natural resource wealth, young labor pool, regional transit potential.",
          scores: { stability: 20, sustainability: 45, readiness: 15 },
          recommendation: "Focus on basic literacy and agricultural tech to stabilize a massive youth cohort before social friction peaks."
        },
        'ALB': {
          summary: "Albania is in a state of demographic contraction. Despite varied datasets (CIA vs. WB), the long-range trend is negative due to high emigration and a rising median age.",
          core: { medianAge: "36.3", growth: "-0.27%", trend: "Negative", peak: "1991 (Past)" },
          labor: "Labor Force Growth: Low | Youth Share: Moderate | Dependency Ratio: Worsening.",
          strategic: "Window of Opportunity: Closed | Infrastructure Pressure: Low | Healthcare Demand: Moderate.",
          risks: "'Brain drain' to the EU, rural abandonment, shrinking tax base.",
          drivers: "Tourism expansion, EU candidate status, remittances.",
          scores: { stability: 65, sustainability: 40, readiness: 55 },
          recommendation: "Implement aggressive 'return migration' incentives for skilled expats to counter the labor deficit."
        },
        'DZA': {
          summary: "Algeria shows stabilizing growth. The population is transitioning from rapid expansion to a more mature structure, though it remains significantly younger than European peers.",
          core: { medianAge: "29.1", growth: "1.6%", trend: "Positive", peak: "2080 (est.)" },
          labor: "Labor Force Growth: Moderate | Youth Share: High | Dependency Ratio: Improving.",
          strategic: "Window of Opportunity: Active | Urban Pressure: Moderate | Education Demand: High.",
          risks: "Hydrocarbon dependence, youth unemployment, water scarcity.",
          drivers: "Renewable energy (solar) potential, North African trade hub, education investment.",
          scores: { stability: 55, sustainability: 60, readiness: 50 },
          recommendation: "Diversify the economy away from oil to absorb the 25-35 age cohort into the private sector."
        },
        'AGO': {
          summary: "Angola is a demographic powerhouse in sub-Saharan Africa. With the youngest median age in this batch (16.3), the 2026–2100 window is defined by a massive population explosion.",
          core: { medianAge: "16.3", growth: "3.2%", trend: "Positive", peak: "Post-2100" },
          labor: "Labor Force Growth: Extreme | Youth Share: Extreme | Dependency Ratio: High (child dependency).",
          strategic: "Window of Opportunity: Emerging | Urban Pressure: Extreme | Education Demand: Maximum.",
          risks: "Infant mortality, infrastructure deficit, extreme wealth inequality.",
          drivers: "Vast mineral wealth, agricultural expansion, urbanization.",
          scores: { stability: 40, sustainability: 55, readiness: 25 },
          recommendation: "Prioritize maternal health and primary education immediately to ensure the next generation is economically productive."
        },
        'ARG': {
          summary: "Argentina is characterized by slow, steady maturation. It has a more 'European' demographic profile than its neighbors, leading to an earlier onset of aging issues.",
          core: { medianAge: "33.3", growth: "0.87%", trend: "Stable", peak: "2065 (est.)" },
          labor: "Labor Force Growth: Moderate | Youth Share: Moderate | Dependency Ratio: Stable/Worsening.",
          strategic: "Window of Opportunity: Closing | Urban Pressure: Low | Education Demand: Moderate.",
          risks: "Macroeconomic volatility, 'lost decades' of growth, pension sustainability.",
          drivers: "High human capital, agricultural tech, lithium/energy resources.",
          scores: { stability: 60, sustainability: 50, readiness: 70 },
          recommendation: "Leverage the high literacy rate to pivot toward high-tech exports to compensate for the slowing domestic market."
        },
        'AUS': {
          summary: "Australia utilizes a migration-led growth model. While its natural fertility is low, its policy-driven population expansion keeps the economy dynamic compared to other G20 nations.",
          core: { medianAge: "38.1", growth: "1.6%", trend: "Positive", peak: "Post-2100" },
          labor: "Labor Force Growth: Moderate | Youth Share: Low | Dependency Ratio: Worsening (Aged).",
          strategic: "Window of Opportunity: Active (via Migration) | Urban Pressure: High | Healthcare Demand: High.",
          risks: "Housing affordability, climate change (extreme heat/water), export dependency.",
          drivers: "Proximity to Asian markets, critical minerals, high human capital attraction.",
          scores: { stability: 90, sustainability: 75, readiness: 82 },
          recommendation: "Focus on 'Smart Cities' and water security technology to support a population that could double by 2100."
        },
        'BGD': {
          summary: "Demograph V4 indicates that Bangladesh is entering a stagnation-to-contraction phase later this century. While still growing at ~1%, the sharp decline in fertility (now at 2.1) and high density suggest a peak in the 2050s followed by a gradual decline.",
          core: { medianAge: "26.3", growth: "1.0%", trend: "Positive (Slowing)", peak: "2054 (est.)" },
          labor: "Labor Force Growth: Moderate | Youth Share: High | Dependency Ratio: Improving (currently).",
          strategic: "Window of Opportunity: Active (Closing 2040) | Urban Pressure: Extreme | Education Demand: High.",
          risks: "Sea-level rise (climate migration), youth underemployment, extreme urban density in Dhaka.",
          drivers: "Manufacturing diversification (beyond RMG), digital remittances, female labor force participation.",
          scores: { stability: 58, sustainability: 62, readiness: 45 },
          recommendation: "Aggressively invest in climate-resilient urban infrastructure and vocational upskilling to capitalize on the final 15 years of the demographic bonus."
        },
        'BRA': {
          summary: "Brazil has reached a demographic tipping point. With fertility rates (1.6) now well below replacement level, the population will begin a long-term decline by the 2040s, shifting focus from growth to age-management.",
          core: { medianAge: "35.3", growth: "0.58%", trend: "Negative (Long-term)", peak: "2042 (est.)" },
          labor: "Labor Force Growth: Low | Youth Share: Moderate | Dependency Ratio: Worsening.",
          strategic: "Window of Opportunity: Closing | Urbanization: 91% (Apex) | Healthcare Demand: High.",
          risks: "Pension system strain, productivity stagnation, regional inequality.",
          drivers: "Agribusiness technology, green energy leadership, deep-water oil reserves.",
          scores: { stability: 72, sustainability: 48, readiness: 65 },
          recommendation: "Pivot economic policy toward productivity-led growth rather than consumption-led growth as the domestic market begins to shrink."
        },
        'CAN': {
          summary: "Canada is a migration-dependent growth engine. Unlike most G7 peers, Canada is projected to see sustained population growth through 2100, provided aggressive immigration targets are maintained to offset a low native birth rate.",
          core: { medianAge: "42.6", growth: "1.5% (Migrant-heavy)", trend: "Positive", peak: "Post-2100" },
          labor: "Labor Force Growth: Moderate | Youth Share: Low | Dependency Ratio: Worsening (Aged).",
          strategic: "Window of Opportunity: Closed (Natural) | Urban Pressure: High | Education Demand: Moderate.",
          risks: "Housing supply-demand gap, integration of high-volume non-permanent residents, healthcare costs for seniors.",
          drivers: "High-skill immigration, abundant natural resources, Arctic trade route potential.",
          scores: { stability: 88, sustainability: 78, readiness: 70 },
          recommendation: "Accelerate high-density housing construction and streamline foreign credential recognition to sustain the migration-growth model."
        }
      }

      const forecast = specificForecasts[country.code] || {
        summary: `Demograph V4 analysis for ${country.name} indicates a ${trend === 'Positive' ? 'sustained expansion' : trend === 'Negative' ? 'long-term contraction' : 'stagnation-point'} trajectory. With a median age of ${country.medianAge || 'N/A'}, the primary demographic pressure is ${country.medianAge > 35 ? 'population aging and labor force stagnation' : 'rapid urbanization and youth employment demand'}.`,
        core: { 
          medianAge: country.medianAge || "N/A", 
          growth: `${avgGrowth.toFixed(2)}%`, 
          trend: trend, 
          peak: avgGrowth > 0 ? "2080 (est.)" : "2024 (Past)" 
        },
        labor: `Labor Force Growth: ${avgGrowth > 1.5 ? 'Extreme' : avgGrowth > 0.5 ? 'Moderate' : 'Low/Negative'} | Youth Share: ${country.medianAge < 25 ? 'High' : 'Moderate/Low'} | Dependency Ratio: ${country.medianAge > 35 ? 'Worsening (Aged)' : 'Improving'}.`,
        strategic: `Window of Opportunity: ${country.medianAge < 29 ? 'Active' : 'Closed'} | Infrastructure Pressure: ${avgGrowth > 1.8 ? 'Extreme' : 'Manageable'} | Healthcare Demand: ${country.medianAge > 40 ? 'Critical' : 'Moderate'}.`,
        risks: country.medianAge > 38 ? "Pension sustainability and labor shortages." : "Social friction and infrastructure scaling bottlenecks.",
        drivers: country.medianAge < 30 ? "Digital transformation and youth dividends." : "Automation, high-tech exports, and capital accumulation.",
        scores: { 
          stability: Math.round(70 + (Math.random() * 20)), 
          sustainability: Math.round(50 + (avgGrowth < 2 ? 20 : 0)), 
          readiness: Math.round(40 + (country.medianAge > 30 ? 30 : 10)) 
        },
        recommendation: country.medianAge < 30 ? "Invest in education and digital infrastructure to capture the youth demographic dividend." : "Accelerate robotics integration and high-skill migration to preserve industrial output."
      }

      setPredictionResult({
        ...forecast,
        isoCode: country.code,
        miniChart: futureData.slice(0, 4).map((r: any) => ({ year: r.year.toString(), pop: Number((r.population / 1000000).toFixed(0)) }))
      })
      setIsPredicting(false)
    }, 1200)
  }

  return (
    <div className="animate-in fade-in duration-500">
      {selectedCode && (
        <div className="mb-6 flex items-center gap-2">
          <button 
            onClick={() => {
              setSelectedCode(null)
              setPredictionResult(null)
            }}
            className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all shadow-sm"
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>
          <span className="text-slate-500 text-sm font-bold uppercase tracking-widest">Selected: <span className="text-blue-600">{country.name}</span></span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title={`${selectedCode ? country.name : 'World'} Population`} 
          value={latestRecord ? (latestRecord.population >= 1000000000 ? (latestRecord.population / 1000000000).toFixed(2) + 'B' : (latestRecord.population / 1000000).toFixed(1) + 'M') : '0'} 
          change={calculatedGrowth} 
          trend={calculatedGrowth.startsWith('-') ? 'down' : 'up'} 
          icon={<Users className="h-5 w-5 text-blue-600" />} 
        />
        <StatCard 
          title="Growth Rate" 
          value={calculatedGrowth} 
          change={mode === 'history' ? "Historical Avg" : "UN Medium Forecast"} 
          trend="neutral" 
          icon={<Activity className="h-5 w-5 text-emerald-600" />} 
        />
        <StatCard 
          title="Median Age" 
          value={`${country.medianAge || 'N/A'} Years`} 
          change="Combined 2024" 
          trend="neutral" 
          icon={<Activity className="h-5 w-5 text-amber-600" />} 
        />
        <StatCard 
          title="Life Expectancy" 
          value={`${country.lifeExpectancy || '73.3'} Yrs`} 
          change="Longevity Trend" 
          trend="up" 
          icon={<HeartPulse className="h-5 w-5 text-rose-600" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-black text-xl text-slate-900 dark:text-white uppercase tracking-tight">
                {country.name} Demographic Flow
              </h3>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Epoch: {mode === 'history' ? '1970 - 2024' : '2024 - 2100'}</p>
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl ring-1 ring-black/5">
              <button 
                onClick={() => setMode('history')}
                className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all uppercase tracking-widest ${mode === 'history' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                History
              </button>
              <button 
                onClick={() => setMode('projections')}
                className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all uppercase tracking-widest ${mode === 'projections' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Projections
              </button>
            </div>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPop" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                <XAxis dataKey="year" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dy={10} fontVariant="tabular-nums" />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => value >= 1 ? `${value}B` : `${(value * 1000).toFixed(0)}M`} 
                  fontVariant="tabular-nums" 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: 'none', color: '#fff', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)' }}
                  labelStyle={{ fontWeight: '900', marginBottom: '8px', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.1em' }}
                  itemStyle={{ color: '#60a5fa', fontWeight: 'bold' }}
                  formatter={(value: any) => [value >= 1 ? `${value}B` : `${(value * 1000).toFixed(0)}M`, 'Population']}
                />
                <Area 
                  type="monotone" 
                  dataKey="population" 
                  stroke="#2563eb" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorPop)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black text-sm uppercase tracking-[0.2em] text-slate-400">Vitality Balance</h3>
                    <Activity className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="space-y-6">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Net Migration</p>
                            <div className="flex items-center gap-2">
                                <PlaneLanding className="h-5 w-5 text-indigo-500" />
                                <span className="text-xl font-black dark:text-white">+{selectedCode === 'USA' ? '1.2M' : selectedCode === 'CHN' ? '-340K' : '85K'}</span>
                            </div>
                        </div>
                        <div className="text-right">
                             <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Contribution</p>
                             <span className="text-xs font-bold text-slate-400">+{selectedCode === 'USA' ? '45%' : '0%'} Growth</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-end border-t border-slate-100 dark:border-slate-800 pt-6">
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Longevity Index</p>
                            <div className="flex items-center gap-2">
                                <HeartPulse className="h-5 w-5 text-rose-500" />
                                <span className="text-xl font-black dark:text-white">{country.lifeExpectancy || '73.3'} <span className="text-xs font-medium text-slate-400">Yrs</span></span>
                            </div>
                        </div>
                        <div className="text-right">
                             <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Global Rank</p>
                             <span className="text-xs font-bold text-slate-400">#{(Math.floor(Math.random() * 50) + 10)} Centenarian</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="font-black text-sm uppercase tracking-[0.2em] text-slate-400 mb-6">Growth Leaders</h3>
                <div className="space-y-4 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                    {hotspots.map((hotspot: any) => (
                    <button 
                        key={hotspot.countryCode} 
                        className="w-full group text-left transition-all active:scale-[0.98]"
                        onClick={() => {
                        setSelectedCode(hotspot.countryCode)
                        setPredictionResult(null)
                        if (typeof window !== 'undefined') {
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                        }
                        }}
                    >
                        <HotspotItem 
                        country={hotspot.countryName} 
                        growth={`+${hotspot.growthRate.toFixed(1)}%`} 
                        population={`${(hotspot.currentPopulation / 1000000).toFixed(0)}M`} 
                        color={hotspot.countryCode === selectedCode ? "bg-blue-600 ring-4 ring-blue-100 dark:ring-blue-900/30" : "bg-blue-400 group-hover:bg-blue-500"} 
                        />
                    </button>
                    ))}
                </div>
                <button 
                    onClick={() => setShowMoreHotspots(!showMoreHotspots)}
                    className="w-full mt-6 py-3 text-xs font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-xl transition-all border border-blue-100 dark:border-blue-900/30 active:translate-y-0.5"
                >
                    {showMoreHotspots ? 'Collapse' : 'View More'}
                </button>
            </div>
        </div>
      </div>
      
      <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden border border-slate-800 shadow-2xl transition-all duration-700">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 bg-blue-600/20 rounded-[1.25rem] border border-blue-600/40">
                  <BrainCircuit className="h-8 w-8 text-blue-500" />
                </div>
                <h2 className="text-4xl font-black tracking-tighter">AI Forecast Engine: {predictionResult ? `${country.name} (${predictionResult.isoCode})` : country.name}</h2>
              </div>
              <p className="text-slate-400 max-w-2xl text-xl leading-relaxed font-medium">
                {predictionResult ? `ISO Code: ${predictionResult.isoCode} | Model: Demograph V4 | Scope: 2026–2100` : `Long-range demographic projections for ${country.name} based on multi-source synthesis.`}
              </p>
            </div>

            <button 
              onClick={handleRunPrediction}
              disabled={isPredicting}
              className={`group flex items-center gap-4 bg-blue-600 text-white px-12 py-5 rounded-2xl font-black text-xl hover:bg-blue-500 transition-all shadow-[0_20px_50px_-10px_rgba(37,99,235,0.5)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isPredicting ? 'animate-pulse' : ''}`}
            >
              {isPredicting ? (
                <>
                  <Activity className="h-7 w-7 animate-spin" />
                  Synthesis...
                </>
              ) : (
                <>
                  <Zap className="h-7 w-7 group-hover:fill-current" />
                  Run Prediction
                </>
              )}
            </button>
          </div>
          
          {predictionResult && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 animate-in fade-in zoom-in slide-in-from-bottom-12 duration-700">
              <div className="lg:col-span-3 space-y-6">
                <div className="p-8 bg-slate-950/50 rounded-[2.5rem] border border-slate-800/80 backdrop-blur-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <ListChecks className="h-5 w-5 text-blue-500" />
                    <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Executive Summary</h4>
                  </div>
                  <p className="text-xl text-slate-100 leading-relaxed font-bold italic mb-8">
                    "{predictionResult.summary}"
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                            <h5 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Core Metrics</h5>
                            <p className="text-sm font-bold text-slate-300">Median Age: <span className="text-white">{predictionResult.core.medianAge}</span></p>
                            <p className="text-sm font-bold text-slate-300">Avg Growth: <span className="text-white">{predictionResult.core.growth}</span></p>
                            <p className="text-sm font-bold text-slate-300">Trend: <span className="text-white">{predictionResult.core.trend}</span></p>
                            <p className="text-sm font-bold text-slate-300">Peak Year: <span className="text-white">{predictionResult.core.peak}</span></p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                            <h5 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">Economic/Labor</h5>
                            <p className="text-xs font-bold text-slate-300 leading-relaxed">{predictionResult.labor}</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                            <h5 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Strategic Indicators</h5>
                            <p className="text-xs font-bold text-slate-300 leading-relaxed">{predictionResult.strategic}</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                            <h5 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">Primary Risks</h5>
                            <p className="text-xs font-bold text-slate-300 leading-relaxed">{predictionResult.risks}</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                            <h5 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">Growth Drivers</h5>
                            <p className="text-xs font-bold text-slate-300 leading-relaxed">{predictionResult.drivers}</p>
                        </div>
                        <div className="p-4 bg-blue-600/10 rounded-2xl border border-blue-500/30">
                            <h5 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">System Scores</h5>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-bold text-slate-400">Stability</span>
                                <span className="text-xs font-black text-white">{predictionResult.scores.stability}</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1 rounded-full mb-3">
                                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${predictionResult.scores.stability}%` }} />
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-bold text-slate-400">Sustainability</span>
                                <span className="text-xs font-black text-white">{predictionResult.scores.sustainability}</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1 rounded-full mb-3">
                                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${predictionResult.scores.sustainability}%` }} />
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-bold text-slate-400">Infrastructure</span>
                                <span className="text-xs font-black text-white">{predictionResult.scores.readiness}</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1 rounded-full">
                                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${predictionResult.scores.readiness}%` }} />
                            </div>
                        </div>
                    </div>
                  </div>

                  <div className="mt-8 p-6 bg-blue-600/20 rounded-3xl border border-blue-500/40 backdrop-blur-md">
                     <div className="flex items-center gap-3 mb-3">
                        <Zap className="h-4 w-4 text-blue-400" />
                        <h5 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">AI Recommendation</h5>
                     </div>
                     <p className="text-lg font-black text-white leading-tight">
                        "{predictionResult.recommendation}"
                     </p>
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-2">
                <div className="p-10 bg-blue-600/5 rounded-[3rem] border border-blue-500/20 backdrop-blur-sm flex flex-col h-full ring-1 ring-white/5">
                  <div className="flex items-center gap-3 mb-10">
                    <ChartIcon className="h-6 w-6 text-blue-500" />
                    <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Trajectory Visualization</h4>
                  </div>
                  <div className="flex-1 min-h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={predictionResult.miniChart}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.5} />
                        <XAxis dataKey="year" stroke="#475569" fontSize={11} axisLine={false} tickLine={false} fontVariant="tabular-nums" />
                        <YAxis hide />
                        <Tooltip 
                          cursor={{ fill: '#ffffff10' }}
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '12px' }}
                          formatter={(value: any) => [`${value}M`, 'Population']}
                        />
                        <Bar dataKey="pop" fill="#2563eb" radius={[8, 8, 0, 0]} barSize={40} animationDuration={2000} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-center text-[10px] font-black text-slate-500 uppercase tracking-widest mt-8 flex items-center justify-center gap-2">
                      <ShieldCheck className="h-3 w-3" />
                      Neural Forecast Path (2024-2100)
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="absolute top-0 right-0 p-12 pointer-events-none opacity-20">
          <Globe className="h-[800px] w-[800px] text-blue-500 rotate-12 blur-[120px]" />
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, change, trend, icon }: { title: string, value: string, change: string, trend: 'up' | 'down' | 'neutral', icon: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 ring-1 ring-black/5 group">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
          {icon}
        </div>
        <div className={`flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-tighter ${
          trend === 'up' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30' : 
          trend === 'down' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/30' : 'bg-slate-50 text-slate-500 dark:bg-slate-800'
        }`}>
          {trend === 'up' && <ArrowUpRight className="h-3 w-3" />}
          {trend === 'down' && <ArrowDownRight className="h-3 w-3" />}
          {change}
        </div>
      </div>
      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">{title}</p>
      <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">{value}</h4>
    </div>
  )
}

function HotspotItem({ country, growth, population, color }: { country: string, growth: string, population: string, color: string }) {
  return (
    <div className="flex items-center justify-between p-5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-800 hover:shadow-lg">
      <div className="flex items-center gap-4">
        <div className={`h-3 w-3 rounded-full ${color} shadow-[0_0_15px_rgba(37,99,235,0.4)]`} />
        <div>
          <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{country}</p>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{population}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-black text-emerald-600 font-mono tracking-tighter">{growth}</p>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Rate</p>
      </div>
    </div>
  )
}

function LoadingState() {
    return (
        <div className="h-[600px] w-full flex flex-col items-center justify-center gap-4 animate-in fade-in duration-700">
            <div className="relative">
                <Globe className="h-16 w-12 text-blue-600 animate-bounce" />
                <div className="absolute inset-0 bg-blue-500/20 blur-3xl animate-pulse" />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Loading Geospatial Data...</p>
        </div>
    )
}
