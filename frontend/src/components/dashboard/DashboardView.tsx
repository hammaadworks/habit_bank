"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { format, parseISO } from "date-fns";
import { Zap, History, Clock, ChevronDown } from "lucide-react";
import { HabitCard } from "@/components/HabitCard";
import { CalendarWidget } from "@/components/CalendarWidget";
import { TimeTravelInline } from "./TimeTravelInline";
import { AgendaItem, DashboardAgenda } from "../../types";
import { cn } from "@/lib/utils";

interface DashboardViewProps {
  agenda: DashboardAgenda;
  activeUser: any;
  timeTravelDate: Date | null;
  setTimeTravelDate: (d: Date | null) => void;
  recommendations: AgendaItem[];
  fetchAgenda: () => void;
  setEditingHabit: (h: AgendaItem) => void;
  logicalToday: string;
  setActiveTab: (t: string) => void;
  onViewAnalytics?: (id: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20
    }
  }
};

export function DashboardView({ 
  agenda, 
  activeUser, 
  timeTravelDate, 
  setTimeTravelDate,
  recommendations,
  fetchAgenda,
  setEditingHabit,
  logicalToday,
  setActiveTab,
  onViewAnalytics
}: DashboardViewProps) {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full space-y-12 md:space-y-20 lg:space-y-24"
    >
      {/* 1. Temporal Navigator - Redesigned for Vertical Space Efficiency */}
      <motion.section variants={itemVariants} className="glass-card rounded-[2rem] sm:rounded-[3rem] shadow-2xl shadow-primary/5 border-2 border-border/10 overflow-hidden">
        <div className="flex flex-col xl:flex-row divide-y xl:divide-y-0 xl:divide-x divide-border/10">
          {/* Header Info - Side Panel on Large */}
          <div className="p-6 sm:p-8 lg:p-10 xl:p-12 xl:w-1/3 bg-primary/[0.02] flex flex-col justify-between gap-6 sm:gap-10">
            <div className="flex items-center gap-3 sm:gap-5">
              <div className="p-2.5 sm:p-3.5 bg-primary/10 rounded-xl sm:rounded-[1.25rem] shadow-inner shrink-0">
                <Clock className="w-5 h-5 sm:w-7 h-7 text-primary" />
              </div>
              <div className="space-y-1 overflow-hidden">
                <h4 className="text-[11px] sm:text-xs md:text-sm font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] font-heading text-foreground/40 leading-tight truncate">Temporal_Navigator</h4>
                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-primary/60 font-mono truncate">Current Coordinates</p>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div className="p-4 sm:p-6 bg-background/50 rounded-[1.5rem] sm:rounded-[2rem] border border-border/10 shadow-sm">
                <p className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 sm:mb-2 font-mono">Status_Report</p>
                <div className="flex items-end justify-between">
                  <span className="text-2xl sm:text-3xl font-black font-heading text-foreground leading-none">{format(timeTravelDate || new Date(), "MMM dd")}</span>
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 px-2 sm:px-3 py-1 rounded-lg">SYNC_OK</span>
                </div>
              </div>
              
              {!timeTravelDate && (
                <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 bg-primary/5 rounded-xl sm:rounded-2xl border border-primary/10">
                  <div className="w-1.5 h-1.5 sm:w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] text-primary/70 truncate">Real-Time Ledger Active</span>
                </div>
              )}
            </div>
          </div>

          {/* Calendar Zone */}
          <div className="p-4 sm:p-8 lg:p-10 xl:p-12 xl:flex-1 bg-card/40">
            <div className="w-full max-w-2xl mx-auto">
              <CalendarWidget 
                onDateSelect={(d) => {
                  setTimeTravelDate(d);
                  setActiveTab("dashboard");
                }} 
                logicalToday={logicalToday} 
                weekStartDay={activeUser.week_start_day}
              />
            </div>
          </div>
        </div>
      </motion.section>

      {/* 2. Historical Snapshot if time traveling */}
      {timeTravelDate && (
        <motion.div variants={itemVariants} className="space-y-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-primary/5 p-8 md:p-10 rounded-[3rem] border border-primary/20 gap-8 shadow-inner shadow-primary/5">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-primary text-background rounded-2xl shadow-xl shadow-primary/30 shrink-0">
                <History className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-black uppercase font-heading tracking-tight leading-none mb-2 text-primary">Historical Snapshot</h2>
                <p className="text-xs md:text-sm font-black text-foreground/60 uppercase tracking-[0.3em] font-mono">{format(timeTravelDate, "MMMM do, yyyy")}</p>
              </div>
            </div>
            <button 
              onClick={() => setTimeTravelDate(null)}
              className="w-full sm:w-auto px-10 py-4 bg-background border-2 border-primary/20 text-primary rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/5"
            >
              Return to Present
            </button>
          </div>
          <TimeTravelInline userId={activeUser.id} date={timeTravelDate} />
        </motion.div>
      )}

      {/* 3. Recommended Next */}
      {!timeTravelDate && recommendations.length > 0 && (
        <motion.section variants={itemVariants} className="space-y-8 md:space-y-12">
          <div className="flex items-center gap-6 border-b-2 border-border/10 pb-8 md:pb-12">
            <div className="p-3 bg-primary/20 rounded-2xl shrink-0">
              <Zap className="w-5 h-5 text-primary fill-primary/30" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl md:text-4xl font-black text-foreground uppercase tracking-tight font-heading leading-none">Recommended Next</h2>
              <p className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground/40 font-mono">NEURAL_SCHEDULER_QUEUE</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 md:gap-12">
            {recommendations.slice(0, 5).map((item) => (
              <motion.div key={item.habit_id} variants={itemVariants} className="relative group h-full">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-[3rem] blur-xl opacity-0 group-hover:opacity-20 transition-opacity" />
                <HabitCard item={item} type="tier1" onLog={fetchAgenda} onEdit={() => setEditingHabit(item)} logicalToday={logicalToday} isDashboard onViewAnalytics={onViewAnalytics} />
                {item.modal_completion_hour !== null && item.modal_completion_hour !== undefined && (
                  <div className="absolute top-6 right-8 px-3 py-1.5 bg-primary text-background rounded-xl text-[10px] font-black uppercase tracking-widest pointer-events-none shadow-2xl z-10 hidden sm:block">
                    Usually @ {item.modal_completion_hour === 0 ? "12 AM" : item.modal_completion_hour < 12 ? `${item.modal_completion_hour} AM` : item.modal_completion_hour === 12 ? "12 PM" : `${item.modal_completion_hour - 12} PM`}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* 4. Active Deliverables & Others */}
      {!timeTravelDate && (
        <div className="space-y-16 md:space-y-24">
          <CollapsibleHabitGroup title="Active Deliverables" items={agenda.tier1} type="tier1" onLog={fetchAgenda} onEdit={setEditingHabit} logicalToday={logicalToday} onViewAnalytics={onViewAnalytics} />
          <CollapsibleHabitGroup title="Debt Amortization" items={agenda.tier2} type="tier2" onLog={fetchAgenda} onEdit={setEditingHabit} logicalToday={logicalToday} onViewAnalytics={onViewAnalytics} />
          <CollapsibleHabitGroup title="Cleared Sessions" items={agenda.completed} type="completed" onLog={fetchAgenda} onEdit={setEditingHabit} logicalToday={logicalToday} onViewAnalytics={onViewAnalytics} defaultOpen={false} />
        </div>
      )}
    </motion.div>
  );
}

function CollapsibleHabitGroup({ 
  title, 
  items, 
  type, 
  onLog, 
  onEdit, 
  logicalToday, 
  onViewAnalytics,
  defaultOpen = true 
}: { 
  title: string; 
  items: AgendaItem[]; 
  type: "tier1" | "tier2" | "completed";
  onLog: () => void;
  onEdit: (h: AgendaItem) => void;
  logicalToday: string;
  onViewAnalytics: (id: string) => void;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  if (items.length === 0) return null;

  return (
    <motion.section variants={itemVariants} className="space-y-8">
      <div className="flex items-center justify-between border-b-2 border-border/10 pb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl md:text-3xl font-black text-foreground uppercase tracking-tight font-heading leading-none">{title}</h2>
          <span className="px-2.5 py-1 bg-muted rounded-lg text-[10px] font-black text-muted-foreground/60 font-mono">{items.length}</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-primary/5 rounded-xl transition-all text-primary"
        >
          <ChevronDown className={cn("w-6 h-6 transition-transform duration-500", !isOpen && "-rotate-90")} />
        </button>
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 md:gap-12"
            >
              {items.map((item) => (
                <motion.div key={item.habit_id} variants={itemVariants}>
                  <HabitCard 
                    item={item} 
                    type={type} 
                    onLog={onLog} 
                    onEdit={() => onEdit(item)} 
                    logicalToday={logicalToday}
                    isDashboard
                    onViewAnalytics={onViewAnalytics}
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
