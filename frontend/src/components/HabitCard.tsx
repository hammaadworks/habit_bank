"use client";

import { 
  ChevronDown, 
  Settings, 
  RotateCcw,
  Plus,
  ArrowRightLeft,
  Layers,
  Activity
} from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "motion/react";
import { Heatmap } from "./Heatmap";
import { HabitChart } from "./HabitChart";
import { AgendaItem } from "../types";
import { format, parseISO } from "date-fns";
import { formatDuration, isTimeUnit, getMultiplier, cn } from "@/lib/utils";
import { useHabit } from "@/hooks/useHabit";
import { HabitLogForm } from "./habit/HabitLogForm";
import { HabitStats } from "./habit/HabitStats";
import { TodayLogs } from "./habit/TodayLogs";

const SPRING_CONFIG = { type: "spring", stiffness: 400, damping: 30, mass: 1 } as const;

export function HabitCard({ 
  item, 
  type, 
  onLog,
  onEdit,
  logicalToday,
  isDashboard = false,
  onViewAnalytics
}: { 
  item: AgendaItem; 
  type: "tier1" | "tier2" | "completed"; 
  onLog: () => void;
  onEdit: () => void;
  logicalToday: string;
  isDashboard?: boolean;
  onViewAnalytics?: (id: string) => void;
}) {
  const {
    expanded,
    setExpanded,
    timeline,
    logValue,
    setLogValue,
    logUnit,
    setLogUnit,
    status,
    todayLogs,
    availableUnits,
    currentViewUnit,
    cycleUnit,
    totalDays,
    handleLog,
    handleDeleteLog,
    displayValue
  } = useHabit(item, logicalToday, onLog, isDashboard);

  const x = useMotionValue(0);
  const opacity = useTransform(x, [-100, 0, 100], [0, 1, 0]);

  const val = displayValue(type);

  return (
    <motion.div 
      layout
      transition={SPRING_CONFIG}
      whileTap={{ scale: 0.98 }}
      style={{ x, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 100) onEdit();
        if (info.offset.x < -100) setExpanded(!expanded);
      }}
      className={cn(
        "group relative rounded-[2.5rem] border transition-all duration-500 overflow-hidden cursor-pointer glass-card",
        expanded ? "md:col-span-2 lg:col-span-2 row-span-2" : "col-span-1"
      )}
      onClick={() => !expanded && setExpanded(true)}
    >
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="space-y-1 sm:space-y-1.5 overflow-hidden">
            <h3 className="text-lg sm:text-xl font-bold tracking-tight uppercase font-heading flex items-center gap-2 sm:gap-3 truncate">
              {item.name}
            </h3>
            {!isDashboard && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <button 
                  onClick={cycleUnit}
                  className="text-[9px] sm:text-xxs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg bg-primary/10 text-primary tracking-widest uppercase hover:bg-primary hover:text-white transition-all flex items-center gap-1"
                >
                  <RotateCcw className="w-2 h-2" />
                  {currentViewUnit}
                </button>
                {item.is_stacked && (
                  <span className="text-[9px] sm:text-xxs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg bg-muted text-muted-foreground tracking-widest uppercase self-center flex items-center gap-1">
                    <Layers className="w-2 h-2" />
                    Stacked
                  </span>
                )}
                {item.priority <= 10 && (
                  <span className="text-[9px] sm:text-xxs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg bg-accent/10 text-accent tracking-widest uppercase self-center">
                    Critical
                  </span>
                )}
              </div>
            )}
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-2 sm:p-2.5 hover:bg-white rounded-xl transition-all text-muted-foreground hover:text-primary border border-transparent hover:border-border shrink-0"
          >
            <Settings className="w-3.5 h-3.5 sm:w-4 h-4" />
          </button>
        </div>

        {!isDashboard && (
          <div className="space-y-1.5 sm:space-y-2">
            <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${item.progress_pct || 0}%` }}
                className="h-full bg-primary"
              />
            </div>
            <div className="flex justify-end text-[9px] sm:text-xxs font-bold uppercase tracking-widest text-muted-foreground">
              {item.progress_pct}% Completed
            </div>
          </div>
        )}

        <div className="flex items-end justify-between gap-2">
          <div className="space-y-0.5 overflow-hidden">
            {type === "tier1" ? (
              <>
                <div className={cn("font-black font-heading leading-none tracking-tighter text-primary truncate", isDashboard ? "text-2xl sm:text-3xl" : "text-4xl sm:text-5xl")}>
                  {isTimeUnit(currentViewUnit) ? formatDuration(val * (getMultiplier(currentViewUnit, item.unit_hierarchy) || 1)) : val.toFixed(1)}
                </div>
                <div className="text-[10px] sm:text-xxs font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em] text-muted-foreground ml-0.5 sm:ml-1">{currentViewUnit}_Remaining</div>
              </>
            ) : type === "tier2" ? (
              <>
                <div className={cn("font-black font-heading leading-none tracking-tighter text-orange-500 truncate", isDashboard ? "text-2xl sm:text-3xl" : "text-4xl sm:text-5xl")}>
                  {isTimeUnit(currentViewUnit) ? formatDuration(val * (getMultiplier(currentViewUnit, item.unit_hierarchy) || 1)) : val.toFixed(1)}
                </div>
                <div className="text-[10px] sm:text-xxs font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em] text-muted-foreground ml-0.5 sm:ml-1">{currentViewUnit}_Backlog</div>
              </>
            ) : (
              <>
                <div className={cn("font-black font-heading text-emerald-500 uppercase leading-none tracking-tighter truncate", isDashboard ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl")}>
                  Verified
                </div>
                <div className="text-[10px] sm:text-xxs font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em] text-muted-foreground ml-0.5 sm:ml-1 truncate">
                  +{isTimeUnit(currentViewUnit) ? formatDuration(val * (getMultiplier(currentViewUnit, item.unit_hierarchy) || 1)) : val.toFixed(1)} {currentViewUnit}_Surplus
                </div>
              </>
            )}
          </div>
          
          {!isDashboard && (
            <button 
              onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
              className="p-2.5 sm:p-3 bg-white/50 text-foreground rounded-lg sm:rounded-xl hover:bg-primary hover:text-white transition-all border border-border shadow-sm group-hover:scale-105 active:scale-95 shrink-0"
            >
              {expanded ? <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 rotate-180" /> : <Plus className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border bg-white/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-8 space-y-6 sm:space-y-10">
              <HabitLogForm 
                item={item}
                logValue={logValue}
                setLogValue={setLogValue}
                logUnit={logUnit}
                setLogUnit={setLogUnit}
                availableUnits={availableUnits}
                handleLog={handleLog}
                onCancel={() => !isDashboard && setExpanded(false)}
                status={status}
              />

              {!isDashboard && (
                <HabitStats 
                  item={item}
                  totalDays={totalDays}
                  currentViewUnit={currentViewUnit}
                />
              )}

              {!isDashboard && <HabitChart timeline={timeline} unitName={item.base_unit_name} />}

              <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-6 border-t border-white/20">
                {!isDashboard ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[9px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        <ArrowRightLeft className="w-3 h-3" /> Swipe: Right = Edit // Left = Close
                      </div>
                    </div>
                    <Heatmap timeline={timeline} logicalToday={logicalToday} />
                  </>
                ) : (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onViewAnalytics?.(item.habit_id); }}
                    className="w-full py-3 sm:py-4 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] transition-all flex items-center justify-center gap-2 sm:gap-3 border border-primary/20"
                  >
                    <Activity className="w-3.5 h-3.5 sm:w-4 h-4" />
                    Individual_Habit_Analytics
                  </button>
                )}
              </div>

              <TodayLogs 
                item={item}
                todayLogs={todayLogs}
                handleDeleteLog={handleDeleteLog}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
