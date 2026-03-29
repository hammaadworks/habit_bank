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
      type: "spring" as const,
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
  onViewAnalytics = () => {}
}: DashboardViewProps) {
  const allHabits = [...agenda.tier1, ...agenda.tier2, ...agenda.completed];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full flex-1 min-w-0 grid grid-cols-1 gap-6 lg:gap-12"
    >
      <div className="flex flex-col min-h-0 space-y-12 md:space-y-20 max-w-5xl mx-auto w-full">
        {/* 1. Temporal Navigator */}
        <motion.section variants={itemVariants} className="glass-card rounded-[2rem] sm:rounded-[3rem] shadow-2xl border border-border/50 overflow-hidden">
          <div className="flex flex-col xl:flex-row divide-y xl:divide-y-0 xl:divide-x divide-border/50">
            <div className="p-6 sm:p-8 xl:w-1/3 bg-primary/5 flex flex-col justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-[1rem] shadow-inner shrink-0">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-1 overflow-hidden">
                  <h4 className="text-xs font-black uppercase tracking-[0.4em] font-heading text-foreground/40 leading-tight">Temporal_Navigator</h4>
                </div>
              </div>
              <div className="space-y-6">
                <div className="p-5 bg-background/50 rounded-[1.5rem] border border-border/50 shadow-sm">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 font-mono">Status_Report</p>
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-black font-heading text-foreground leading-none">{format(timeTravelDate || new Date(), "MMM dd")}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-lg">SYNC_OK</span>
                  </div>
                </div>
                {!timeTravelDate && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-primary/5 rounded-2xl border border-primary/20">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-primary/70">Real-Time Active</span>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 sm:p-8 xl:flex-1 bg-card">
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

        {/* 2. Historical Snapshot */}
        {timeTravelDate && (
          <motion.div variants={itemVariants} className="space-y-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-primary/5 p-8 rounded-[3rem] border border-primary/20 gap-8 shadow-inner">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-primary text-background rounded-2xl shadow-xl shrink-0">
                  <History className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-3xl font-black uppercase font-heading tracking-tight leading-none mb-2 text-primary">Historical Snapshot</h2>
                  <p className="text-sm font-black text-foreground/60 uppercase tracking-[0.3em] font-mono">{format(timeTravelDate, "MMMM do, yyyy")}</p>
                </div>
              </div>
              <button 
                onClick={() => setTimeTravelDate(null)}
                className="px-10 py-4 bg-background border-2 border-primary/20 text-primary rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
              >
                Return to Present
              </button>
            </div>
            <TimeTravelInline userId={activeUser.id} date={timeTravelDate} />
          </motion.div>
        )}

        {/* 3. Recommended Next */}
        {!timeTravelDate && recommendations.length > 0 && (
          <motion.section variants={itemVariants} className="space-y-8">
            <div className="flex items-center gap-6 border-b border-border/50 pb-8">
              <div className="p-3 bg-primary/20 rounded-2xl shrink-0">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-foreground uppercase tracking-tight font-heading leading-none">Recommended Next</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {recommendations.slice(0, 3).map((item) => (
                <motion.div key={item.habit_id} variants={itemVariants} className="relative group h-full">
                  <HabitCard item={item} type="tier1" onLog={fetchAgenda} onEdit={() => setEditingHabit(item)} logicalToday={logicalToday} isDashboard onViewAnalytics={onViewAnalytics} />
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
      </div>
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
      <div className="flex items-center justify-between border-b border-border/50 pb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-black text-foreground uppercase tracking-tight font-heading leading-none">{title}</h2>
          <span className="px-2.5 py-1 bg-muted rounded-lg text-[10px] font-black text-muted-foreground font-mono">{items.length}</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-primary/10 rounded-xl transition-all text-primary"
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
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 py-4"
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
