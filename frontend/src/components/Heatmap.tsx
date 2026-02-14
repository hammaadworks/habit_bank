"use client";

import { useState } from "react";
import { 
  History,
  Target
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { format, parseISO } from "date-fns";

const SPRING_CONFIG = { type: "spring", stiffness: 400, damping: 30, mass: 1 } as const;

export type TimelineDay = {
  date: string;
  target: number;
  physically_logged_today: number;
  allocated_to_this_day: number;
  is_full: boolean;
};

/**
 * Displays a heatmap of habit activity over the last 70 days.
 */
export function Heatmap({ timeline, logicalToday }: { timeline: TimelineDay[], logicalToday?: string }) {
  // Shows a loading/reconstructing state if the timeline data is not yet available.
  if (timeline.length === 0) return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-6">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 bg-rose-500/20 rounded-full flex items-center justify-center border border-rose-500/30"
        >
          <History className="w-6 h-6 text-rose-500" />
        </motion.div>
        <span className="text-xxs text-rose-500/40 font-black uppercase tracking-[0.5em]">Reconstructing Timeline</span>
      </div>
    </div>
  );
  
  const recent = timeline.slice(-70);
  
  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <Target className="w-4 h-4 text-primary" />
          <h4 className="text-xs text-primary font-bold uppercase tracking-[0.4em]">CONSISTENCY_MATRIX // 70_DAY_INDEX</h4>
        </div>
        <div className="flex items-center gap-6 p-3 bg-secondary/50 rounded-lg border border-border">
          {[
            { label: '0%', color: 'bg-white/5' },
            { label: '50%', color: 'bg-emerald-500/20' },
            { label: '100%', color: 'bg-emerald-500' },
            { label: '150%+', color: 'bg-primary' }
          ].map(lvl => (
            <div key={lvl.label} className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-sm ${lvl.color}`} />
              <span className="text-xxs text-muted-foreground font-mono uppercase tracking-widest">{lvl.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-14 gap-3 p-8 bg-card border border-border rounded-xl">
        {recent.map((day, idx) => (
          <HeatmapBox key={idx} day={day} index={idx} logicalToday={logicalToday} />
        ))}
      </div>
    </div>
  );
}

/**
 * Represents a single day cell within the heatmap.
 */
function HeatmapBox({ day, index, logicalToday }: { day: TimelineDay; index: number, logicalToday?: string }) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Determine the color and glow effect based on performance relative to the target.
  let color = "bg-white/5 border-white/5"; 
  let glow = "";
  if (day.allocated_to_this_day > 0) {
    const ratio = day.allocated_to_this_day / (day.target || 1);
    if (ratio >= 1.5) { // Heroic effort
      color = "bg-blue-500 border-blue-400"; 
      glow = "shadow-[0_0_20px_rgba(37,99,235,0.6)]";
    }
    else if (ratio >= 1) { // Met target
      color = "bg-emerald-500 border-emerald-400"; 
      glow = "shadow-[0_0_20px_rgba(16,185,129,0.4)]";
    }
    else if (ratio >= 0.5) { // Partial effort
      color = "bg-emerald-500/40 border-emerald-500/20"; 
    }
    else { // Minimal effort
      color = "bg-emerald-500/10 border-emerald-500/10"; 
    }
  }

  const isToday = logicalToday ? day.date === logicalToday : day.date === new Date().toISOString().split('T')[0];

  return (
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: index * 0.01, ...SPRING_CONFIG }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`aspect-square rounded-xl border-2 ${color} ${glow} transition-colors duration-300 cursor-none relative group/box ${isToday ? 'ring-2 ring-primary ring-offset-4 ring-offset-background' : ''}`}
    >
      {isToday && (
        <div className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full z-10 shadow-lg border border-background animate-pulse" />
      )}
      <AnimatePresence>
        {isHovered && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 5, scale: 0.95, filter: "blur(10px)" }}
            transition={SPRING_CONFIG}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-6 w-max px-6 py-5 bg-card text-white rounded-xl border border-primary/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] pointer-events-none backdrop-blur-xl"
          >
            <div className="text-xxs font-bold mb-4 tracking-[0.2em] text-primary uppercase font-mono">{format(parseISO(day.date), "yyyy-MM-dd // EEEE")}</div>
            <div className="flex items-center gap-8">
              <div className="flex flex-col">
                <span className="text-3xl font-bold font-heading tracking-tighter">{day.allocated_to_this_day.toFixed(1)}</span>
                <span className="text-xxs font-bold uppercase tracking-widest text-muted-foreground mt-1 font-mono">EFFECTIVE_VAL</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold font-heading tracking-tighter opacity-70">({day.physically_logged_today.toFixed(1)})</span>
                <span className="text-xxs font-bold uppercase tracking-widest text-muted-foreground mt-1 font-mono">PHYSICAL</span>
              </div>
              <div className="h-10 w-px bg-border" />
              <div className="flex flex-col">
                <span className="text-3xl font-bold font-heading tracking-tighter opacity-30">{day.target}</span>
                <span className="text-xxs font-bold uppercase tracking-widest text-muted-foreground mt-1 font-mono">TARGET_QUOTA</span>
              </div>
            </div>
            <div className="mt-5 pt-5 border-t border-border flex items-center justify-between gap-10">
              <span className="text-xxs font-bold uppercase tracking-[0.2em] text-muted-foreground font-mono">EFFICIENCY_RATING</span>
              <span className={`text-xs font-bold font-mono ${day.allocated_to_this_day >= day.target ? 'text-emerald-400' : 'text-rose-400'}`}>
                {Math.round((day.allocated_to_this_day / (day.target || 1)) * 100)}%
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
