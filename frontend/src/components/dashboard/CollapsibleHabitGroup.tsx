"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { HabitCard } from "@/components/HabitCard";
import { cn } from "@/lib/utils";
import { AgendaItem } from "@/types";

export function CollapsibleHabitGroup({ 
  title, 
  items, 
  type, 
  onLog, 
  onEdit, 
  logicalToday,
  defaultOpen = true 
}: { 
  title: string, 
  items: AgendaItem[], 
  type: any, 
  onLog: any, 
  onEdit: any, 
  logicalToday: string,
  defaultOpen?: boolean 
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (items.length === 0) return null;

  return (
    <section className="space-y-8">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between border-b border-border pb-6 group/btn"
      >
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-black text-foreground uppercase tracking-tight font-heading group-hover/btn:text-primary transition-colors">{title}</h2>
          <span className="text-xs font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded">{items.length}</span>
        </div>
        <ChevronDown className={cn("w-6 h-6 text-muted-foreground/40 transition-transform duration-300", isOpen ? "" : "-rotate-90")} />
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 pb-2">
              {items.map((item) => (
                <HabitCard key={item.habit_id} item={item} type={type} onLog={onLog} onEdit={() => onEdit(item)} logicalToday={logicalToday} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
