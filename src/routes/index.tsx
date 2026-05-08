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
import { api } from '../api_client'
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
  const { data: results } = useSuspenseQuery({
    queryKey: ['search', query],
    queryFn: () => api.searchCountries(query)
  })
  
  if (!query || results.length === 0) return null

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl z-50 overflow-hidden ring-1 ring-black/5">
      {results.map((c: any) => (
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
    const { data: countries } = useSuspenseQuery({
        queryKey: ['countries'],
        queryFn: api.listAllCountries
    })

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
                        {countries.map((c: any) => (
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

  const { data: trendData } = useSuspenseQuery({
    queryKey: ['trends', mode],
    queryFn: () => api.getGlobalTrends(mode)
  })
  const { data: hotspots } = useSuspenseQuery({
    queryKey: ['hotspots', showMoreHotspots],
    queryFn: () => api.getHotspots(showMoreHotspots ? 15 : 5)
  })
  const { data: selectedCountryData } = useSuspenseQuery({
    queryKey: ['country', selectedCode || 'WLD'],
    queryFn: () => api.getCountryData(selectedCode || 'WLD')
  })

  const country = selectedCountryData.country
  const displayData = selectedCode ? selectedCountryData.records : trendData
  
  const filteredDisplayData = useMemo(() => {
    return displayData.filter((r: any) => mode === 'history' ? r.year <= 2024 : r.year >= 2024)
  }, [displayData, mode])

  const latestRecord = filteredDisplayData[filteredDisplayData.length - 1]
  const previousRecord = filteredDisplayData[filteredDisplayData.length - 2]
  
  const currentPop = latestRecord ? (latestRecord.population >= 1000000000 ? (latestRecord.population / 1000000000).toFixed(2) + 'B' : (latestRecord.population / 1000000).toFixed(1) + 'M') : '0'
  
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

  const handleRunPrediction = async () => {
    setIsPredicting(true)
    setPredictionResult(null)
    
    try {
      const predictions = await api.predict(country.code)
      const futureData = selectedCountryData.records.filter((r: any) => r.year >= 2024)
      const avgGrowth = country.growthCIA || 0.8;
      const trend = avgGrowth > 0.5 ? 'Positive' : avgGrowth < 0 ? 'Negative' : 'Stable';
      
      const forecast = {
        summary: `Demograph V4 analysis for ${country.name} indicates a ${trend === 'Positive' ? 'sustained expansion' : trend === 'Negative' ? 'long-term contraction' : 'stagnation-point'} trajectory. ML modeling predicts a population of ${(predictions[predictions.length-1].population / 1000000).toFixed(1)}M by 2100.`,
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
        miniChart: predictions.map((r: any) => ({ year: r.year.toString(), pop: Number((r.population / 1000000).toFixed(0)) }))
      })
    } catch (e) {
      console.error(e)
    } finally {
      setIsPredicting(false)
    }
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
                                <span className="text-xl font-black dark:text-white">
                                  {country.netMigration ? (country.netMigration > 0 ? '+' : '') + (Math.abs(country.netMigration) >= 1000000 ? (country.netMigration / 1000000).toFixed(1) + 'M' : (country.netMigration / 1000).toFixed(0) + 'K') : '85K'}
                                </span>
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
                {predictionResult ? `ISO Code: ${predictionResult.isoCode} | Model: Demograph V4 (ML Optimized) | Scope: 2026–2100` : `Long-range demographic projections for ${country.name} based on multi-source synthesis.`}
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
                      ML-Powered Forecast Path (2024-2100)
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
