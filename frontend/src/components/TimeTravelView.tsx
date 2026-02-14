"use client";

import { 
  X, 
  Target, 
  CheckCircle2, 
  Zap, 
  History, 
  TrendingUp,
  Clock,
  ShieldCheck,
  Flame,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";
import { UnitHierarchy, HistoricalHabitState } from "../types";
import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";

interface TimeTravelViewProps {
  userId: string;
  date: Date;
  onClose: () => void;
}

export function TimeTravelView({ userId, date, onClose }: TimeTravelViewProps) {
  const dateStr = format(date, "yyyy-MM-dd");
  const [snapshot, setSnapshot] = useState<HistoricalHabitState[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSnapshot = async () => {
      try {
        setLoading(true);
        const data = await fetchApi(`/dashboard/snapshot?user_id=${userId}&date_str=${dateStr}`);
        setSnapshot(data.habits);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSnapshot();
  }, [userId, dateStr]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/90 backdrop-blur-xl"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        className="relative w-full max-w-6xl bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header Section */}
        <div className="p-8 md:p-12 border-b border-border bg-primary/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/30">
                <History className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-4xl font-black tracking-tighter uppercase font-heading leading-none">
                  Historical Log <span className="text-primary/40">v1.0</span>
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-black uppercase tracking-[0.4em] text-primary">Temporal_Anchor:</span>
                  <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded uppercase">
                    {format(date, "EEEE, MMMM do, yyyy")}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-[0.2em] max-w-md leading-relaxed border-l-2 border-primary pl-6">
              Reviewing the system state for the selected temporal coordinates. Analysis includes physical logs, surplus allocations, and debt impact.
            </p>
          </div>

          <button 
            onClick={onClose}
            className="p-4 hover:bg-muted rounded-full transition-all group active:scale-90"
          >
            <X className="w-8 h-8 text-muted-foreground group-hover:text-foreground" />
          </button>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12">
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="p-8 bg-card border border-border rounded-3xl animate-pulse space-y-4">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-12 w-full bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <AnimatePresence mode="popLayout">
                {snapshot?.map((habit, idx) => (
                  <HabitSnapshot key={habit.habit_id} habit={habit} index={idx} />
                ))}
              </AnimatePresence>

              {(!snapshot || snapshot.length === 0) && (
                <div className="col-span-full py-32 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="p-6 bg-muted rounded-full">
                    <AlertCircle className="w-12 h-12 text-muted-foreground/30" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-bold uppercase tracking-tight font-heading">No Active Parameters</p>
                    <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">System was not tracking any habits on this specific date.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="p-8 border-t border-border bg-muted/30 flex items-center justify-between">
          <div className="flex gap-8">
            <div className="flex flex-col">
              <span className="text-xxs font-black text-muted-foreground uppercase tracking-widest">Total Active Modules</span>
              <span className="text-2xl font-black font-heading">{snapshot?.length || 0}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xxs font-black text-muted-foreground uppercase tracking-widest">Temporal Accuracy</span>
              <span className="text-2xl font-black font-heading text-emerald-500">100.0%</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs font-black text-primary uppercase tracking-[0.3em] animate-pulse">
            <Zap className="w-4 h-4 fill-current" />
            Live_Ledger_Sync
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function HabitSnapshot({ habit, index }: { habit: HistoricalHabitState; index: number }) {
  const convertValue = (seconds: number, targetUnit: string) => {
    const TIME_UNITS: Record<string, number> = {
      second: 1, seconds: 1, sec: 1, s: 1,
      minute: 60, minutes: 60, min: 60, m: 60,
      hour: 3600, hours: 3600, hr: 3600, h: 3600,
      day: 86400, days: 86400, d: 86400
    };

    const getMultiplier = (unit: string, hierarchy: UnitHierarchy): number => {
      const lower = unit.toLowerCase();
      if (TIME_UNITS[lower]) return TIME_UNITS[lower];

      const resolve = (u: string, visited = new Set<string>()): number => {
        if (TIME_UNITS[u.toLowerCase()]) return TIME_UNITS[u.toLowerCase()];
        if (visited.has(u)) return 0;
        visited.add(u);
        const convs = hierarchy[u];
        if (!convs) return 0;
        for (const [next, mult] of Object.entries(convs)) {
          const res = resolve(next, visited);
          if (res > 0) return (mult as number) * res;
        }
        return 0;
      };
      return resolve(unit);
    };

    const mult = getMultiplier(targetUnit, habit.unit_hierarchy);
    return mult > 0 ? seconds / mult : seconds;
  };

  const unit = habit.unit;
  const target = convertValue(habit.target, unit);
  const actualDone = convertValue(habit.physically_logged, unit);
  const received = convertValue(habit.received_from_surplus || 0, unit);
  const totalAllocated = convertValue(habit.total_allocated, unit);
  
  const isFull = habit.is_full;
  const statusColor = isFull ? "text-emerald-500" : "text-primary";

  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative bg-card border border-border rounded-3xl p-8 hover:border-primary/30 transition-all shadow-sm overflow-hidden"
    >
      <div className={`absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity`}>
        {isFull ? <ShieldCheck className="w-32 h-32" /> : <Clock className="w-32 h-32" />}
      </div>

      <div className="space-y-8 relative z-10">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h4 className="text-2xl font-black tracking-tight font-heading uppercase">{habit.name}</h4>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest bg-muted px-2 py-0.5 rounded">
                UNIT: {unit}
              </span>
              <span className={`text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded ${isFull ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'}`}>
                {isFull ? 'PROTOCOL_SECURED' : 'DELTA_PENDING'}
              </span>
            </div>
          </div>
          {isFull && <CheckCircle2 className="w-8 h-8 text-emerald-500 fill-emerald-500/10" />}
        </div>

        <div className="grid grid-cols-2 gap-12">
          {/* Target Stats */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
              <Target className="w-3 h-3" /> System Target
            </div>
            <p className="text-4xl font-black font-heading tracking-tighter">
              {target.toFixed(1)} <span className="text-sm font-bold opacity-30">{unit}</span>
            </p>
          </div>

          {/* Achieved Stats */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-500">
              <TrendingUp className="w-3 h-3" /> Total Achieved
            </div>
            <p className={`text-4xl font-black font-heading tracking-tighter ${statusColor}`}>
              {totalAllocated.toFixed(1)} <span className="text-sm font-bold opacity-30">{unit}</span>
            </p>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="pt-8 border-t border-border grid grid-cols-2 gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xxs font-black uppercase tracking-widest text-muted-foreground">
              <Flame className="w-3 h-3" /> Physically Logged
            </div>
            <p className="text-xl font-black font-heading tracking-tight">
              {actualDone.toFixed(1)} <span className="text-xs opacity-30">{unit}</span>
            </p>
            <p className="text-xxs text-muted-foreground uppercase font-bold">Action performed on this date</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xxs font-black uppercase tracking-widest text-primary">
              <Zap className="w-3 h-3" /> Surplus Allocation
            </div>
            <p className="text-xl font-black font-heading tracking-tight text-primary">
              +{received.toFixed(1)} <span className="text-xs opacity-30">{unit}</span>
            </p>
            <p className="text-xxs text-muted-foreground uppercase font-bold">Injected from temporal buffer</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xxs font-black uppercase tracking-widest mb-1">
            <span className="text-muted-foreground">Fulfillment Status</span>
            <span>{target > 0 ? Math.min(100, (totalAllocated / target) * 100).toFixed(0) : 100}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden border border-border/50 p-0.5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${target > 0 ? Math.min(100, (totalAllocated / target) * 100) : 100}%` }}
              className={`h-full rounded-full ${isFull ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]' : 'bg-primary'}`}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
