"use client";

import { useMemo, useState } from "react";
import { Settings, RotateCcw, Calendar } from "lucide-react";
import { AgendaItem } from "../types";
import { isTimeUnit, formatDuration, convertFromSeconds } from "@/lib/utils";
import { differenceInCalendarDays, parseISO } from "date-fns";

import { motion } from "motion/react";

interface HabitRegistryCardProps {
  habit: AgendaItem;
  onEdit: (habit: AgendaItem) => void;
}

export function HabitRegistryCard({ habit, onEdit }: HabitRegistryCardProps) {
  const totalDays = useMemo(() => {
    const start = parseISO(habit.start_date);
    const today = new Date();
    return Math.max(0, differenceInCalendarDays(today, start)) + 1;
  }, [habit.start_date]);

  // Unit View Management
  const availableUnits = useMemo(() => {
    const units = new Set<string>();
    if (habit.mark_off_unit) units.add(habit.mark_off_unit);
    if (habit.display_unit) units.add(habit.display_unit);
    Object.keys(habit.unit_hierarchy).forEach(u => units.add(u));
    return Array.from(units);
  }, [habit.mark_off_unit, habit.display_unit, habit.unit_hierarchy]);

  const [currentViewUnit, setCurrentViewUnit] = useState(habit.display_unit || habit.mark_off_unit);

  const cycleUnit = (e: React.MouseEvent) => {
    e.stopPropagation();
    const idx = availableUnits.indexOf(currentViewUnit);
    const nextIdx = (idx + 1) % availableUnits.length;
    setCurrentViewUnit(availableUnits[nextIdx]);
  };

  const formatValue = (valueSeconds: number) => {
    if (isTimeUnit(currentViewUnit)) {
      // getMultiplier logic is already inside formatDuration if we pass seconds, 
      // but here we have seconds and want to display in currentViewUnit
      // Actually, formatDuration is for human readable time. 
      // If the unit is "minutes", we might want "10.5 minutes" or "10m 30s".
      // Let's stick to the convention used in HabitCard.
      const val = convertFromSeconds(valueSeconds, currentViewUnit, habit.unit_hierarchy);
      return val.toFixed(1);
    }
    return convertFromSeconds(valueSeconds, currentViewUnit, habit.unit_hierarchy).toFixed(1);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="p-6 sm:p-10 md:p-12 glass-card rounded-[2rem] sm:rounded-[3rem] space-y-6 sm:space-y-10 hover:shadow-2xl transition-all group relative h-full flex flex-col border-2 hover:border-primary/40 bg-card/60 backdrop-blur-2xl"
    >
      <div className="absolute top-1/2 -translate-y-1/2 left-0 w-1.5 sm:w-2 h-1/2 bg-primary opacity-40 group-hover:opacity-100 transition-all rounded-r-full shadow-lg" style={{ backgroundColor: habit.color }} />
      
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6">
        <div className="space-y-3 sm:space-y-4 overflow-hidden w-full">
          <h3 className="text-xl sm:text-2xl md:text-4xl font-black uppercase tracking-tight font-heading leading-tight text-foreground truncate">{habit.name}</h3>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button 
              onClick={cycleUnit}
              className="text-[9px] sm:text-[10px] font-black px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-primary text-background tracking-[0.1em] sm:tracking-[0.2em] uppercase hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 sm:gap-2 leading-none shadow-lg shadow-primary/20"
            >
              <RotateCcw className="w-2.5 h-2.5 sm:w-3 h-3" />
              {currentViewUnit}
            </button>
            <span className="text-[9px] sm:text-[10px] font-black font-mono px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-muted/80 text-foreground/60 uppercase tracking-widest self-center leading-none border border-border/20 shadow-inner">BASE: {habit.base_unit_name}</span>
          </div>
        </div>
        <button onClick={() => onEdit(habit)} className="p-3 sm:p-4 bg-background/50 hover:bg-primary/10 rounded-xl sm:rounded-2xl transition-all shadow-xl border border-border/10 hover:border-primary/20 text-foreground group/btn active:scale-90 self-end sm:self-start shrink-0">
          <Settings className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-y-6 sm:gap-y-10 gap-x-4 sm:gap-x-8 pt-6 sm:pt-10 border-t-2 border-border/10 grow">
        <div className="space-y-1 sm:space-y-2">
          <p className="text-[9px] sm:text-[10px] md:text-xs font-black text-foreground/40 uppercase tracking-[0.2em] sm:tracking-[0.3em] font-mono">PRIORITY_IDX</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-black font-heading leading-none text-foreground">{habit.priority}</p>
        </div>
        <div className="space-y-1 sm:space-y-2">
          <p className="text-[9px] sm:text-[10px] md:text-xs font-black text-foreground/40 uppercase tracking-[0.2em] sm:tracking-[0.3em] font-mono">USUAL_TARGET</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-black font-heading text-primary leading-none">
            {habit.modal_completion_hour !== null && habit.modal_completion_hour !== undefined 
              ? (habit.modal_completion_hour === 0 ? "12 AM" : habit.modal_completion_hour < 12 ? `${habit.modal_completion_hour} AM` : habit.modal_completion_hour === 12 ? "12 PM" : `${habit.modal_completion_hour - 12} PM`)
              : "N/A"}
          </p>
        </div>
        <div className="space-y-1 sm:space-y-2 overflow-hidden">
          <p className="text-[9px] sm:text-[10px] md:text-xs font-black text-foreground/40 uppercase tracking-[0.2em] sm:tracking-[0.3em] font-mono">AVG_VELOCITY</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-black font-heading text-indigo-500 leading-none truncate">
            {formatValue(habit.avgWorkPerDay || 0)} <span className="text-[9px] sm:text-xs font-black opacity-30">{currentViewUnit}</span>
          </p>
        </div>
        <div className="space-y-1 sm:space-y-2 overflow-hidden">
          <p className="text-[9px] sm:text-[10px] md:text-xs font-black text-foreground/40 uppercase tracking-[0.2em] sm:tracking-[0.3em] font-mono">LIFETIME_EFFORT</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-black font-heading text-foreground/80 leading-none truncate">
            {formatValue(habit.totalLifetimeSeconds || 0)} <span className="text-[9px] sm:text-xs font-black opacity-30">{currentViewUnit}</span>
          </p>
        </div>
        <div className="col-span-2 pt-3 sm:pt-4 bg-muted/10 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-border/5">
          <p className="text-[9px] sm:text-[10px] md:text-xs font-black text-foreground/40 uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-2 sm:mb-4 font-mono">TRACKED_DURATION_GENESIS</p>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Calendar className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <p className="text-xl sm:text-3xl md:text-4xl font-black font-heading text-emerald-500 leading-none">
              {totalDays} <span className="text-[9px] sm:text-[10px] md:text-xs font-black opacity-40 uppercase tracking-widest ml-1 sm:ml-2">DAYS</span>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
