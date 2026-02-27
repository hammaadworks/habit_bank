"use client";

import { Plus } from "lucide-react";
import { motion } from "motion/react";
import { HabitRegistryCard } from "@/components/HabitRegistryCard";
import { formatDuration } from "@/lib/utils";
import { AgendaItem, DashboardAgenda } from "@/types";

interface HabitsViewProps {
  agenda: DashboardAgenda;
  allHabits: AgendaItem[];
  setIsCreateModalOpen: (open: boolean) => void;
  setEditingHabit: (habit: AgendaItem | null) => void;
  quotaSeconds: number;
  quotaPercent: number;
}
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1 }
};

export function HabitsView({ 
  agenda, 
  allHabits, 
  setIsCreateModalOpen, 
  setEditingHabit,
  quotaSeconds,
  quotaPercent
}: HabitsViewProps) {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full space-y-12 md:space-y-20 lg:space-y-24"
    >
      <motion.div variants={itemVariants} className="space-y-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight font-heading leading-none">Protocol <span className="text-primary">Registry</span></h2>
            <p className="text-xs md:text-sm font-black uppercase tracking-[0.4em] text-muted-foreground/40 font-mono">NODE_IDENTITY: VERIFIED // TOTAL_ACTIVE_PROTOCOLS: {allHabits.length}</p>
          </div>
          <div className="text-left lg:text-right space-y-3 w-full lg:w-auto">
            <p className="text-[11px] sm:text-xs md:text-sm font-black text-foreground uppercase tracking-[0.1em] sm:tracking-[0.2em] font-heading leading-tight">Daily_Capacity: <span className="text-primary whitespace-nowrap">{formatDuration(quotaSeconds)}</span> Remaining</p>
            <div className="w-full lg:w-64 h-2 bg-muted/40 rounded-full overflow-hidden border border-border/10">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${quotaPercent}%` }}
                className="h-full bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/20"
              />
            </div>
          </div>
        </div>

        <div className="space-y-16">
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-12"
          >
            {allHabits.map((habit) => (
              <motion.div key={habit.habit_id} variants={itemVariants}>
                <HabitRegistryCard habit={habit} onEdit={() => setEditingHabit(habit)} />
              </motion.div>
            ))}
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.02, borderColor: "var(--primary)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsCreateModalOpen(true)}
              className="p-10 md:p-14 border-4 border-dashed border-border/20 rounded-[3rem] bg-card/30 flex flex-col items-center justify-center gap-6 text-muted-foreground/40 hover:text-primary transition-all group min-h-[300px] md:min-h-[400px] hover:bg-primary/5 shadow-inner"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-muted/20 flex items-center justify-center group-hover:bg-primary/10 group-hover:scale-110 transition-all shadow-xl group-hover:shadow-primary/5">
                <Plus className="w-8 h-8 md:w-10 md:h-10 group-hover:rotate-90 transition-transform duration-500" />
              </div>
              <div className="text-center space-y-2">
                <span className="block text-xl md:text-2xl font-black uppercase tracking-[0.2em] font-heading text-foreground/20 group-hover:text-primary transition-colors">Initialize_New_Module</span>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 font-mono">Expand_Identity_Throughput</p>
              </div>
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
