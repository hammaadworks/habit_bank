"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import { format, parseISO } from "date-fns";
import { TimelineDay } from "./Heatmap";
import { Activity } from "lucide-react";

export function HabitChart({ timeline, unitName }: { timeline: TimelineDay[], unitName: string }) {
  const chartData = useMemo(() => {
    // Only take the last 30 days for a cleaner chart, or use the whole timeline if it's small
    const recent = timeline.slice(-30);
    return recent.map(day => ({
      ...day,
      formattedDate: format(parseISO(day.date), "MMM d"),
      // Cap the logged effort to not skew the chart too much if there was a massive over-log,
      // but let's keep the raw value for now, or just chart it as is.
    }));
  }, [timeline]);

  if (timeline.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Activity className="w-4 h-4 text-primary" />
        <h4 className="text-xs text-primary font-bold uppercase tracking-[0.4em]">PERFORMANCE_TRAJECTORY // 30_DAY_TREND</h4>
      </div>
      
      <div className="h-64 w-full bg-card border border-border rounded-xl p-4 overflow-hidden" style={{ minWidth: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorLogged" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(120, 120, 120, 0.2)" vertical={false} />
            <XAxis 
              dataKey="formattedDate" 
              stroke="currentColor" 
              fontSize={10} 
              tickLine={false}
              axisLine={false}
              minTickGap={30}
              className="font-mono text-foreground/60 font-black"
            />
            <YAxis 
              stroke="currentColor" 
              fontSize={10} 
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
              className="font-mono text-foreground/60 font-black"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--card)', 
                borderColor: 'rgba(120, 120, 120, 0.2)',
                borderRadius: '1rem',
                fontFamily: 'var(--font-heading)',
                fontWeight: '900',
                fontSize: '11px',
                color: 'var(--foreground)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                textTransform: 'uppercase'
              }}
              itemStyle={{ color: 'var(--foreground)' }}
              labelStyle={{ color: 'var(--primary)', marginBottom: '4px', fontWeight: '900' }}
            />
            <Area 
              type="monotone" 
              dataKey="target" 
              name="Target Quota"
              stroke="#F59E0B" 
              strokeWidth={2}
              strokeDasharray="6 6"
              fillOpacity={1} 
              fill="url(#colorTarget)" 
            />
            <Area 
              type="monotone" 
              dataKey="physically_logged_today" 
              name="Actual Effort"
              stroke="#0891B2" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorLogged)" 
              activeDot={{ r: 6, fill: '#0891B2', stroke: 'var(--card)', strokeWidth: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
