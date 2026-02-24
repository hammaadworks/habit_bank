"use client";

import React, { useMemo } from "react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip
} from "recharts";
import { User, DashboardAgenda } from "../types";
import { formatDuration, cn } from "@/lib/utils";
import { Clock } from "lucide-react";

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

export function DailySpectrumWidget({ user, agenda, size = "md" }: { user: User; agenda: DashboardAgenda; size?: "sm" | "md" }) {
  const chartData = useMemo(() => {
    const data: { name: string; value: number; color: string }[] = [];
    let colorIndex = 0;

    // 1. Add Buffers
    const buffers = user?.daily_buffers || {};
    Object.entries(buffers).forEach(([name, seconds]) => {
      data.push({
        name,
        value: Number(seconds || 0),
        color: COLORS[colorIndex++ % COLORS.length]
      });
    });

    // 2. Add All Habits (Today's Targets)
    const allHabits = [...(agenda?.tier1 || []), ...(agenda?.tier2 || []), ...(agenda?.completed || [])];
    allHabits.forEach(habit => {
      const target = Number(habit.todayTarget || 0);
      if (target > 0) {
        data.push({
          name: habit.name,
          value: target,
          color: habit.color || COLORS[colorIndex++ % COLORS.length]
        });
      }
    });

    // 3. Add Remaining Capacity (Discretionary)
    const usedSeconds = data.reduce((acc, curr) => acc + curr.value, 0);
    const totalSeconds = 24 * 3600;
    const remainingSeconds = Math.max(0, totalSeconds - usedSeconds);

    if (remainingSeconds > 0) {
      data.push({
        name: "Discretionary Time",
        value: remainingSeconds,
        color: "#e2e8f0" // Slate-200 / muted
      });
    }

    return data;
  }, [user, agenda]);

  return (
    <div className="flex flex-col h-full w-full gap-3 sm:gap-6">
      {/* Chart Section - Expands to fill available space */}
      <div className={cn(
        "w-full relative group shrink-0", 
        size === "sm" ? "flex-[1] min-h-[180px] sm:min-h-[220px]" : "aspect-square"
      )}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius="72%"
              outerRadius="95%"
              paddingAngle={3}
              dataKey="value"
              stroke="none"
              animationBegin={0}
              animationDuration={800}
              minAngle={12}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                borderRadius: '1rem', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                padding: '0.75rem',
                fontFamily: 'inherit',
                fontWeight: '900',
                textTransform: 'uppercase',
                fontSize: '9px',
                zIndex: 100
              }}
              formatter={(value: any, name: any, props: any) => [formatDuration(Number(value || 0)), `${props.payload.index + 1}. ${name}`]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <Clock className={cn("text-primary/20 mb-1 sm:mb-2", size === "sm" ? "w-3 h-3 sm:w-4 h-4" : "w-6 h-6")} />
          <span className={cn("font-black font-heading leading-none tracking-tighter", size === "sm" ? "text-xl sm:text-2xl" : "text-4xl")}>24h</span>
          <span className={cn("font-black text-muted-foreground uppercase tracking-[0.2em] sm:tracking-[0.3em]", size === "sm" ? "text-[7px] sm:text-[8px]" : "text-[10px]")}>Cycle</span>
        </div>
      </div>

      {/* Legend Section - Takes the rest of the space and is scrollable */}
      <div className={cn(
        "flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-1 sm:space-y-2 px-1 sm:px-2 pb-2 sm:pb-4",
        size !== "sm" && "mt-4"
      )}>
        {chartData.map((entry, index) => (
          <div key={index} className="flex items-center justify-between group/item py-0.5 sm:py-1">
            <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
              <span className="text-[8px] sm:text-[9px] font-black text-muted-foreground/30 w-4 sm:w-5 font-mono shrink-0">{(index + 1).toString().padStart(2, '0')}</span>
              <div 
                className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 shadow-sm transition-transform group-hover/item:scale-125" 
                style={{ backgroundColor: entry.color }} 
              />
              <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-wider sm:tracking-widest text-muted-foreground/80 truncate group-hover/item:text-foreground transition-colors font-heading">
                {entry.name}
              </span>
            </div>
            <span className="text-[8px] sm:text-[9px] font-black font-mono text-muted-foreground/40 shrink-0 bg-muted/30 sm:bg-muted/50 px-1.5 sm:px-2 py-0.5 rounded-md">
              {formatDuration(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
