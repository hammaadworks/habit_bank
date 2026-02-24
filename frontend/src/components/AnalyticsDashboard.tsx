"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Zap, 
  TrendingUp, 
  History, 
  ShieldCheck, 
  Clock,
  BarChart2,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  PieChart as PieChartIcon,
  Activity,
  Calendar
} from "lucide-react";
import { AgendaItem } from "../types";
import { formatDuration, isTimeUnit, convertFromSeconds } from "@/lib/utils";
import { Heatmap } from "./Heatmap";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { fetchApi } from "@/lib/api";
import { format, parseISO } from "date-fns";

export function AnalyticsDashboard({ 
  allHabits, 
  selectedId: initialSelectedId = "global",
  onSelectId,
  logicalToday
}: { 
  allHabits: AgendaItem[], 
  selectedId?: string,
  onSelectId?: (id: string) => void,
  logicalToday?: string
}) {
  const [selectedId, setSelectedId] = useState<string>(initialSelectedId);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  useEffect(() => {
    setSelectedId(initialSelectedId);
  }, [initialSelectedId]);

  const handleSelectChange = (id: string) => {
    setSelectedId(id);
    onSelectId?.(id);
  };

  const selectedHabit = useMemo(() => 
    allHabits.find(h => h.habit_id === selectedId),
  [allHabits, selectedId]);

  useEffect(() => {
    if (selectedId !== "global") {
      setLoadingTimeline(true);
      fetchApi(`/habits/${selectedId}/state`)
        .then(data => setTimeline(data.timeline))
        .catch(err => console.error(err))
        .finally(() => setLoadingTimeline(false));
    } else {
      setTimeline([]);
    }
  }, [selectedId]);

  // Global Stats
  const globalDebt = Math.floor(allHabits.reduce((acc, h) => acc + (h.historicalDebt || 0) + (h.todayDeficit || 0), 0));
  const globalSecured = Math.floor(allHabits.reduce((acc, h) => acc + (h.futureBuffer || 0), 0));
  const globalLifetime = Math.floor(allHabits.reduce((acc, h) => acc + (h.totalLifetimeSeconds || 0), 0));
  const solvencyRatio = globalDebt > 0 ? (globalSecured / globalDebt) : (globalSecured > 0 ? 99 : 1);
  const globalVelocity = allHabits.length > 0 ? (allHabits.reduce((acc, h) => acc + (h.debtVelocity || 0), 0) / allHabits.length) : 0;

  // Streak Calculation (Specific Habit)
  const streakData = useMemo(() => {
    if (!timeline.length) return { current: 0, max: 0, history: [] };
    let current = 0;
    let max = 0;
    let temp = 0;
    const history: any[] = [];
    
    timeline.forEach(day => {
      if (day.is_full) {
        temp++;
      } else {
        if (temp > max) max = temp;
        temp = 0;
      }
      history.push({ date: format(parseISO(day.date), "MMM d"), streak: temp });
    });
    current = temp;
    if (current > max) max = current;
    
    return { current, max, history };
  }, [timeline]);

  // Consistency Score (0-100)
  const consistencyScore = useMemo(() => {
    if (!timeline.length) return 0;
    const fullDays = timeline.filter(d => d.is_full).length;
    return Math.round((fullDays / timeline.length) * 100);
  }, [timeline]);

  // Day of Week Performance (Specific Habit)
  const dayOfWeekData = useMemo(() => {
    if (!timeline.length) return [];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const stats = days.map(d => ({ name: d, count: 0, total: 0 }));
    
    timeline.forEach(day => {
      const date = parseISO(day.date);
      const dayIdx = date.getDay();
      stats[dayIdx].total += 1;
      if (day.is_full) stats[dayIdx].count += 1;
    });
    
    return stats.map(s => ({
      name: s.name,
      score: s.total > 0 ? Math.round((s.count / s.total) * 100) : 0
    }));
  }, [timeline]);

  // Habit Comparison Data (for Global view)
  const comparisonData = useMemo(() => {
    return allHabits.map(h => ({
      name: h.name,
      debt: (h.historicalDebt || 0) + (h.todayDeficit || 0),
      secured: h.futureBuffer || 0,
      lifetime: h.totalLifetimeSeconds || 0,
      hour: h.modal_completion_hour
    })).sort((a, b) => b.debt - a.debt);
  }, [allHabits]);

  // Time of Day distribution (Global or Specific)
  const timeOfDayData = useMemo(() => {
    const hours = Array.from({ length: 24 }).map((_, i) => ({
      hour: i,
      label: i === 0 ? "12AM" : i < 12 ? `${i}AM` : i === 12 ? "12PM" : `${i-12}PM`,
      count: 0
    }));
    
    if (selectedId === "global") {
      allHabits.forEach(h => {
        if (h.modal_completion_hour !== null && h.modal_completion_hour !== undefined) {
          hours[h.modal_completion_hour].count += 1;
        }
      });
    } else if (selectedHabit) {
      if (selectedHabit.modal_completion_hour !== null && selectedHabit.modal_completion_hour !== undefined) {
        hours[selectedHabit.modal_completion_hour].count = 1;
      }
    }
    return hours;
  }, [allHabits, selectedId, selectedHabit]);

  // Timeline Data (for Specific Habit view)
  const timelineData = useMemo(() => {
    if (!selectedHabit || !timeline.length) return [];
    return timeline.map(day => ({
      date: format(parseISO(day.date), "MMM d"),
      target: convertFromSeconds(day.target, selectedHabit.mark_off_unit, selectedHabit.unit_hierarchy),
      achieved: convertFromSeconds(day.allocated_to_this_day, selectedHabit.mark_off_unit, selectedHabit.unit_hierarchy),
      logged: convertFromSeconds(day.physically_logged_today, selectedHabit.mark_off_unit, selectedHabit.unit_hierarchy),
    })).slice(-30); // Last 30 days
  }, [timeline, selectedHabit]);

  const velocityData = useMemo(() => {
    if (!selectedHabit || !timeline.length) return [];
    const window = 7;
    const data = [];
    for (let i = window; i < timeline.length; i++) {
      const slice = timeline.slice(i - window, i);
      const target = slice.reduce((acc, d) => acc + d.target, 0);
      const logged = slice.reduce((acc, d) => acc + d.physically_logged_today, 0);
      data.push({
        date: format(parseISO(timeline[i].date), "MMM d"),
        velocity: target > 0 ? (logged / target) : (logged > 0 ? 1 : 0)
      });
    }
    return data.slice(-30);
  }, [timeline, selectedHabit]);

  // Insights Generation
  const insights = useMemo(() => {
    const tips = [];
    if (selectedId === "global") {
      // Solvency Insight
      if (solvencyRatio < 1) {
        tips.push({
          type: "warning",
          icon: ShieldCheck,
          title: "Solvency Alert",
          text: `Your solvency ratio is ${(solvencyRatio * 100).toFixed(0)}%. You are 'Temporal Junk' status. You owe more to your past than you've saved for your future. Focus on clearing the Backlog.`
        });
      } else {
        tips.push({
          type: "success",
          icon: ShieldCheck,
          title: "System Solvent",
          text: `Solvency at ${(solvencyRatio).toFixed(2)}x. Your future is secured by your past discipline. You have a healthy buffer to absorb life's volatility.`
        });
      }

      if (globalDebt > 0) {
        const topDebtor = comparisonData[0];
        tips.push({
          type: "warning",
          icon: AlertTriangle,
          title: "Debt Concentration",
          text: `"${topDebtor?.name || 'Protocol'}" is your primary time-leak. It accounts for ${((topDebtor.debt / globalDebt) * 100).toFixed(0)}% of your total backlog.`
        });
      }

      if (globalVelocity > 0.8) {
        tips.push({
          type: "success",
          icon: Zap,
          title: "High-Performance Mode",
          text: `System velocity is ${(globalVelocity * 100).toFixed(0)}%. Your execution engine is highly efficient. This is the time to introduce new 'Tier 1' protocols.`
        });
      }
    } else if (selectedHabit) {
      const debt = (selectedHabit.historicalDebt || 0) + (selectedHabit.todayDeficit || 0);
      const usualTime = (selectedHabit.modal_completion_hour !== null && selectedHabit.modal_completion_hour !== undefined) ? 
        (selectedHabit.modal_completion_hour === 0 ? "12 AM" : selectedHabit.modal_completion_hour < 12 ? `${selectedHabit.modal_completion_hour} AM` : selectedHabit.modal_completion_hour === 12 ? "12 PM" : `${selectedHabit.modal_completion_hour - 12} PM`)
        : "N/A";
      
      if (debt > 0) {
        tips.push({
          type: "warning",
          icon: Clock,
          title: "Consistency Deficit",
          text: `You usually tackle this at ${usualTime}. If you're missing sessions, try moving this habit 1 hour earlier to create a 'Buffer Zone'.`
        });
      } else {
        tips.push({
          type: "success",
          icon: CheckCircle2,
          title: "System Integrity High",
          text: `Consistency at ${usualTime} is maintaining perfect solvency for this protocol.`
        });
      }

      if (consistencyScore < 50) {
        tips.push({
          type: "warning",
          icon: AlertTriangle,
          title: "Fragile Protocol",
          text: `Consistency is only ${consistencyScore}%. This protocol is at risk of complete insolvency. Consider reducing target 'Quantity' to rebuild the streak.`
        });
      }

      if (streakData.current > 5) {
        tips.push({
          type: "success",
          icon: Zap,
          title: "Momentum Lock",
          text: `A ${streakData.current}-day streak creates significant neurological momentum. The 'Cost of Breaking' is at a local maximum. Protect this streak.`
        });
      }
    }
    return tips;
  }, [selectedId, globalDebt, comparisonData, timeOfDayData, selectedHabit, solvencyRatio, globalVelocity, consistencyScore, streakData]);

  return (
    <div className="space-y-16">
      {/* Header & Selector */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
            <BarChart2 className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tight font-heading">Neural Analytics</h2>
            <div className="flex items-center gap-3 text-xs font-black text-primary uppercase tracking-[0.3em] mt-1">
              <Zap className="w-4 h-4 fill-current" />
              Insight_Synthesis_Active
            </div>
          </div>
        </div>

        <select 
          value={selectedId}
          onChange={(e) => handleSelectChange(e.target.value)}
          className="bg-card border border-border rounded-xl px-6 py-4 text-sm font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-sm"
        >
          <option value="global">Global Aggregate View</option>
          <optgroup label="Specific Protocols">
            {allHabits.map(h => (
              <option key={h.habit_id} value={h.habit_id}>{h.name}</option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {selectedId === "global" ? (
          <>
            <StatCard icon={Activity} label="Active Protocols" value={allHabits.length} color="text-primary" bg="bg-primary/10" />
            <StatCard icon={History} label="Backlog Depth" value={formatDuration(globalDebt)} color="text-orange-500" bg="bg-orange-500/10" />
            <StatCard icon={ShieldCheck} label="Solvency Ratio" value={`${solvencyRatio.toFixed(2)}x`} color={solvencyRatio >= 1 ? "text-emerald-500" : "text-orange-500"} bg={solvencyRatio >= 1 ? "bg-emerald-500/10" : "bg-orange-500/10"} />
            <StatCard icon={TrendingUp} label="System Velocity" value={`${(globalVelocity * 100).toFixed(0)}%`} color="text-indigo-500" bg="bg-indigo-500/10" />
          </>
        ) : selectedHabit && (
          <>
            <StatCard 
              icon={Activity} 
              label="Consistency Score" 
              value={`${consistencyScore}%`} 
              color={consistencyScore > 70 ? "text-emerald-500" : consistencyScore > 40 ? "text-primary" : "text-orange-500"} 
              bg="bg-primary/5" 
            />
            <StatCard 
              icon={Zap} 
              label="Current Streak" 
              value={`${streakData.current} Days`} 
              color="text-primary" bg="bg-primary/10" 
            />
            <StatCard 
              icon={CheckCircle2} 
              label="Clearance Est." 
              value={selectedHabit.projectedClearanceDate ? format(parseISO(selectedHabit.projectedClearanceDate), "MMM d, yyyy") : "N/A"} 
              color="text-indigo-500" bg="bg-indigo-500/10" 
            />
            <StatCard 
              icon={ShieldCheck} 
              label="Max Streak" 
              value={`${streakData.max} Days`} 
              color="text-emerald-500" bg="bg-emerald-500/10" 
            />
            <StatCard 
              icon={History} 
              label="Backlog" 
              value={isTimeUnit(selectedHabit.mark_off_unit) ? formatDuration((selectedHabit.historicalDebt || 0) + (selectedHabit.todayDeficit || 0)) : `${((selectedHabit.historicalDebt || 0) + (selectedHabit.todayDeficit || 0)).toFixed(1)} ${selectedHabit.mark_off_unit}`} 
              color="text-orange-500" bg="bg-orange-500/10" 
            />
          </>
        )}
      </div>

      {/* Deep Dive Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Visualizations */}
        <div className="xl:col-span-2 space-y-8">
          {selectedId !== "global" && (
            <div className="p-10 md:p-12 glass-card rounded-[3rem] shadow-sm border-2 border-border/10 bg-card/40">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-foreground/40 mb-10 font-mono">Weekly_Performance_Profile_Continuity_%</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dayOfWeekData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(120, 120, 120, 0.2)" />
                    <XAxis dataKey="name" stroke="currentColor" fontSize={10} tickLine={false} axisLine={false} className="text-foreground/60 font-black" />
                    <YAxis stroke="currentColor" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} className="text-foreground/60 font-black" />
                    <Tooltip 
                      cursor={{fill: 'rgba(120, 120, 120, 0.1)'}}
                      contentStyle={{ borderRadius: '1.5rem', border: '2px solid rgba(120, 120, 120, 0.2)', backgroundColor: 'var(--card)', color: 'var(--foreground)', fontWeight: '900', fontSize: '11px', textTransform: 'uppercase', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="score" radius={[6, 6, 0, 0]} name="Consistency %">
                      {dayOfWeekData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.score > 80 ? "#10b981" : entry.score > 50 ? "#0891B2" : "#f59e0b"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          <div className="p-10 md:p-12 glass-card rounded-[3rem] shadow-sm border-2 border-border/10 bg-card/40">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-foreground/40 font-mono">
                {selectedId === "global" ? "Temporal_Distribution_Heatmap_Local_Hour" : "Protocol_Execution_Trace_Chronological_30D"}
              </h3>
            </div>
            
            <div className="h-96 w-full">
              {selectedId === "global" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeOfDayData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(120, 120, 120, 0.2)" />
                    <XAxis dataKey="label" stroke="currentColor" fontSize={9} tickLine={false} axisLine={false} interval={2} className="text-foreground/60 font-black" />
                    <YAxis stroke="currentColor" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} className="text-foreground/60 font-black" />
                    <Tooltip 
                      cursor={{fill: 'rgba(120, 120, 120, 0.1)'}}
                      contentStyle={{ borderRadius: '1.5rem', border: '2px solid rgba(120, 120, 120, 0.2)', backgroundColor: 'var(--card)', color: 'var(--foreground)', fontWeight: '900', fontSize: '11px', textTransform: 'uppercase', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="count" fill="#0891B2" radius={[6, 6, 0, 0]} name="Active Habits" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                loadingTimeline ? (
                  <div className="w-full h-full flex items-center justify-center text-primary animate-pulse text-xs font-black uppercase tracking-widest">
                    Synthesizing Trace...
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timelineData}>
                      <defs>
                        <linearGradient id="colorAchieved" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0891B2" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#0891B2" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(120, 120, 120, 0.2)" />
                      <XAxis dataKey="date" stroke="currentColor" fontSize={9} tickLine={false} axisLine={false} minTickGap={30} className="text-foreground/60 font-black" />
                      <YAxis stroke="currentColor" fontSize={10} tickLine={false} axisLine={false} className="text-foreground/60 font-black" />
                      <Tooltip 
                        contentStyle={{ borderRadius: '1.5rem', border: '2px solid rgba(120, 120, 120, 0.2)', backgroundColor: 'var(--card)', color: 'var(--foreground)', fontWeight: '900', fontSize: '11px', textTransform: 'uppercase', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
                      />
                      <Area type="monotone" dataKey="target" stroke="rgba(120, 120, 120, 0.5)" strokeWidth={2} fill="none" strokeDasharray="6 6" name="Target" />
                      <Area type="monotone" dataKey="achieved" stroke="#0891B2" strokeWidth={4} fillOpacity={1} fill="url(#colorAchieved)" name="Achieved" />
                    </AreaChart>
                  </ResponsiveContainer>
                )
              )}
            </div>
          </div>

          {!loadingTimeline && selectedId !== "global" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 bg-card border border-border rounded-[2.5rem] shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-8">Streak Continuity Graph</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={streakData.history.slice(-30)}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={9} tickLine={false} axisLine={false} minTickGap={30} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip 
                        cursor={{fill: 'hsl(var(--muted)/0.5)'}}
                        contentStyle={{ borderRadius: '1rem', border: '1px solid hsl(var(--border))', fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase' }}
                      />
                      <Bar dataKey="streak" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} name="Streak" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="p-8 bg-card border border-border rounded-[2.5rem] shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-8">Protocol Velocity (Rolling 7D)</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={velocityData}>
                      <defs>
                        <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={9} tickLine={false} axisLine={false} minTickGap={30} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '1rem', border: '1px solid hsl(var(--border))', fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase' }}
                        formatter={(v: any) => [`${(Number(v || 0) * 100).toFixed(1)}%`, "Velocity"]}
                      />
                      <Area type="monotone" dataKey="velocity" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorVelocity)" name="Velocity" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {selectedId !== "global" && (
            <div className="p-10 md:p-12 glass-card rounded-[3rem] shadow-sm border-2 border-border/10 bg-card/40">
              <Heatmap timeline={timeline} logicalToday={logicalToday} />
            </div>
          )}

          {selectedId === "global" && (
            <div className="p-8 bg-card border border-border rounded-[2.5rem] shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-8">Protocol Debt Concentration</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData.slice(0, 5)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} width={100} />
                    <Tooltip 
                      cursor={{fill: 'hsl(var(--muted)/0.5)'}}
                      contentStyle={{ borderRadius: '1rem', border: '1px solid hsl(var(--border))', fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase' }}
                      formatter={(val: any) => [formatDuration(Number(val || 0)), "Total Debt"]}
                    />
                    <Bar dataKey="debt" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Actionable Insights */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Strategic Directives</h3>
          </div>
          
          <div className="space-y-4">
            {insights.map((insight, idx) => (
              <div 
                key={idx} 
                className={`p-6 rounded-[2rem] border transition-all hover:scale-[1.02] ${
                  insight.type === 'warning' ? 'bg-orange-500/5 border-orange-500/20 text-orange-600' :
                  insight.type === 'success' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600' :
                  'bg-primary/5 border-primary/20 text-primary'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-white rounded-xl shadow-sm">
                    <insight.icon className="w-5 h-5 shrink-0" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-black uppercase tracking-tight text-sm">{insight.title}</h4>
                    <p className="text-sm font-medium leading-relaxed opacity-80 italic">&quot;{insight.text}&quot;</p>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="p-8 bg-primary text-white rounded-[2rem] shadow-xl shadow-primary/20 relative overflow-hidden group">
              <Zap className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform" />
              <h4 className="text-xs font-black uppercase tracking-widest mb-2">System Health</h4>
              <p className="text-2xl font-black font-heading leading-none mb-4">OPTIMAL</p>
              <p className="text-xs font-bold opacity-80 leading-relaxed uppercase tracking-tight">Your temporal resolution is consistent. Maintain current neural pathways.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bg }: { icon: any, label: string, value: string | number, color: string, bg: string }) {
  return (
    <div className="p-8 bg-card border-2 border-border/10 rounded-[2.5rem] space-y-6 shadow-sm hover:shadow-xl transition-all group hover:border-primary/20 bg-card/60 backdrop-blur-xl">
      <div className={`p-4 ${bg} rounded-2xl w-fit group-hover:scale-110 transition-transform shadow-inner`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className="text-xs font-black text-foreground/40 uppercase tracking-[0.3em] mb-2 font-mono">{label}</p>
        <p className={`text-3xl md:text-4xl font-black font-heading tracking-tighter ${color.includes('text-primary') ? 'text-foreground' : color}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
