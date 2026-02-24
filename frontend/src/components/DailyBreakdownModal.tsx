"use client";

import React, { useMemo } from "react";
import { 
  X,
  PieChart as PieChartIcon,
  Clock,
  Zap
} from "lucide-react";
import { motion } from "motion/react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip
} from "recharts";
import { User, DashboardAgenda } from "../types";
import { formatDuration } from "@/lib/utils";

interface DailyBreakdownModalProps {
  user: User;
  agenda: DashboardAgenda;
  onClose: () => void;
}

const COLORS = [
  "#6366f1", // primary
  "#f59e0b", // amber
  "#10b981", // emerald
  "#ec4899", // pink
  "#3b82f6", // blue
  "#ef4444", // red
  "#8b5cf6", // violet
  "#14b8a6", // teal
  "#f97316", // orange
  "#a855f7", // purple
];

export function DailyBreakdownModal({ user, agenda, onClose }: DailyBreakdownModalProps) {
  const chartData = useMemo(() => {
    const data: { name: string; value: number; color: string }[] = [];
    let colorIndex = 0;

    // 1. Add Buffers (Sleep, Chores, etc.)
    const buffers = user?.daily_buffers || {};
    Object.entries(buffers).forEach(([name, seconds]) => {
      data.push({
        name,
        value: Number(seconds || 0),
        color: COLORS[colorIndex++ % COLORS.length]
      });
    });

    // 2. Add Tier 1 Habits (Today's Targets)
    const tier1 = agenda?.tier1 || [];
    tier1.forEach(habit => {
      const deficit = Number(habit.todayDeficit || 0);
      if (deficit > 0) {
        data.push({
          name: habit.name,
          value: deficit,
          color: habit.color || COLORS[colorIndex++ % COLORS.length]
        });
      }
    });

    // 3. Add Remaining Capacity
    const usedSeconds = data.reduce((acc, curr) => acc + curr.value, 0);
    const totalSeconds = 24 * 3600;
    const remainingSeconds = Math.max(0, totalSeconds - usedSeconds);

    if (remainingSeconds > 0) {
      data.push({
        name: "Remaining Capacity",
        value: remainingSeconds,
        color: "#e2e8f0" // Slate-200 / muted
      });
    }

    return data;
  }, [user, agenda]);

  const totalUsedSeconds = useMemo(() => {
    return chartData.filter(d => d.name !== "Remaining Capacity").reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData]);

  const freeCapacitySeconds = useMemo(() => {
    const total = 24 * 3600;
    return Math.max(0, total - totalUsedSeconds);
  }, [totalUsedSeconds]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl glass-card rounded-[3rem] p-10 shadow-2xl overflow-hidden border border-white/20 bg-white/80"
      >
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-3 hover:bg-black/5 rounded-2xl transition-all"
        >
          <X className="w-6 h-6 text-muted-foreground" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-10">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                  <PieChartIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-4xl font-black tracking-tight uppercase font-heading leading-none text-foreground">Daily Spectrum</h2>
                  <p className="text-primary text-xs font-bold uppercase tracking-[0.5em] mt-2">Temporal_Allocation_Analysis</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-medium max-w-sm">
                Visualizing how your 24-hour cycle is distributed between core habits, daily buffers, and available capacity.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-white border border-border rounded-[2rem] space-y-2 shadow-sm">
                <p className="text-xxs font-black text-muted-foreground uppercase tracking-widest">Total Committed</p>
                <p className="text-3xl font-black font-heading text-primary">{formatDuration(totalUsedSeconds)}</p>
              </div>
              <div className="p-6 bg-white border border-border rounded-[2rem] space-y-2 shadow-sm">
                <p className="text-xxs font-black text-muted-foreground uppercase tracking-widest">Free Capacity</p>
                <p className="text-3xl font-black font-heading text-emerald-500">{formatDuration(freeCapacitySeconds)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Zap className="w-3 h-3 text-primary" /> Key Metrics
              </h4>
              <div className="space-y-2">
                {chartData.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/50 border border-border/50 rounded-xl text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="font-bold uppercase tracking-tight">{entry.name}</span>
                    </div>
                    <span className="font-mono text-muted-foreground">{formatDuration(entry.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="h-[500px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={120}
                  outerRadius={180}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  animationBegin={0}
                  animationDuration={1500}
                  minAngle={10}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '1.5rem', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    padding: '1rem',
                    fontFamily: 'inherit',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    fontSize: '10px'
                  }}
                  formatter={(value: any, name: any) => [formatDuration(Number(value || 0)), name]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <Clock className="w-10 h-10 text-primary/20 mb-2" />
              <span className="text-4xl font-black font-heading leading-none">24h</span>
              <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Total Cycle</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
