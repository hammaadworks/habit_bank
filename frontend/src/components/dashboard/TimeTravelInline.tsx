"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { fetchApi } from "@/lib/api";
import { cn, getMultiplier } from "@/lib/utils";
import { HistoricalHabitState } from "@/types";

export function TimeTravelInline({ userId, date }: { userId: string, date: Date }) {
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

  if (loading) return <div className="p-12 text-center text-xs font-black uppercase tracking-[0.5em] animate-pulse">Reconstructing Temporal State...</div>;

  if (!snapshot || snapshot.length === 0) return (
    <div className="py-20 text-center bg-muted/20 rounded-[2.5rem] border border-dashed border-border">
      <p className="text-lg font-bold uppercase tracking-tight font-heading">No Historical Data</p>
      <p className="text-xs text-muted-foreground uppercase tracking-widest mt-2">No habits were active on this date.</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {snapshot.map((habit) => (
        <HabitSnapshotInline key={habit.habit_id} habit={habit} />
      ))}
    </div>
  );
}

function HabitSnapshotInline({ habit }: { habit: HistoricalHabitState }) {
  const isFull = habit.is_full;
  
  const convertValue = (seconds: number) => {
    const mult = getMultiplier(habit.unit, habit.unit_hierarchy);
    return mult > 0 ? seconds / mult : seconds;
  };

  const target = convertValue(habit.target);
  const totalAllocated = convertValue(habit.total_allocated);

  return (
    <div className="p-8 bg-card border border-border rounded-3xl space-y-6">
      <div className="flex items-start justify-between">
        <h4 className="text-xl font-black tracking-tight font-heading uppercase">{habit.name}</h4>
        {isFull && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xxs font-black text-muted-foreground uppercase tracking-widest mb-1">Target</p>
          <p className="text-xl font-bold font-heading">{target.toFixed(1)} <span className="text-xs opacity-30">{habit.unit}</span></p>
        </div>
        <div>
          <p className="text-xxs font-black text-muted-foreground uppercase tracking-widest mb-1">Achieved</p>
          <p className={cn("text-xl font-bold font-heading", isFull ? "text-emerald-500" : "text-primary")}>
            {totalAllocated.toFixed(1)} <span className="text-xs opacity-30">{habit.unit}</span>
          </p>
        </div>
      </div>

      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${target > 0 ? Math.min(100, (totalAllocated / target) * 100) : 100}%` }}
          className={cn("h-full", isFull ? "bg-emerald-500" : "bg-primary")}
        />
      </div>
    </div>
  );
}
