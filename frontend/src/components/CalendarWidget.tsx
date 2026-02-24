"use client";

import { useState } from "react";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  eachDayOfInterval,
  parseISO
} from "date-fns";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function CalendarWidget({ 
  onDateSelect, 
  logicalToday,
  weekStartDay = 0 
}: { 
  onDateSelect?: (date: Date) => void, 
  logicalToday?: string,
  weekStartDay?: number
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const mobileDays = ["S", "M", "T", "W", "T", "F", "S"];
  const rotatedDays = [...days.slice(weekStartDay), ...days.slice(0, weekStartDay)];
  const rotatedMobileDays = [...mobileDays.slice(weekStartDay), ...mobileDays.slice(0, weekStartDay)];

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: weekStartDay as any });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: weekStartDay as any });

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-black font-heading text-foreground uppercase tracking-tight">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <div className="flex gap-2 sm:gap-4">
          <button 
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 sm:p-2.5 hover:bg-muted rounded-xl transition-all border border-border/10 shadow-sm active:scale-90"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button 
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 sm:p-2.5 hover:bg-muted rounded-xl transition-all border border-border/10 shadow-sm active:scale-90"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center">
        {rotatedDays.map((day, idx) => (
          <div key={day} className="text-[10px] sm:text-xs font-black text-muted-foreground/40 uppercase tracking-widest py-1 sm:py-2">
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{rotatedMobileDays[idx]}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {calendarDays.map((day, idx) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const isToday = logicalToday ? dateStr === logicalToday : isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isSelected = isSameDay(day, selectedDate);
          
          return (
            <motion.div
              key={idx}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setSelectedDate(day);
                onDateSelect?.(day);
              }}
              className={cn(
                "aspect-square flex flex-col items-center justify-center rounded-lg sm:rounded-xl cursor-pointer transition-all border text-xs sm:text-sm lg:text-base font-bold relative",
                !isCurrentMonth ? "opacity-20 border-transparent" : 
                isSelected ? "bg-primary text-white border-primary shadow-lg shadow-primary/30 z-10 scale-105" : 
                isToday ? "bg-primary/10 border-primary/30 text-primary" :
                "hover:bg-muted/50 border-border/5 text-foreground/70"
              )}
            >
              {format(day, "d")}
              {isToday && !isSelected && (
                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="pt-4 sm:pt-6 border-t border-border/5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-[11px] sm:text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/60 font-mono">Log Matrix</h4>
            <div className="flex items-center gap-2 text-primary">
              <span className="text-[11px] font-black uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded">Time_Travel</span>
            </div>
          </div>
          <div className="w-full sm:w-auto p-3 sm:p-4 bg-background/50 rounded-2xl border border-border/10 shadow-inner flex items-center gap-4 group cursor-pointer hover:border-primary/20 transition-all">
            <div className="p-2 sm:p-2.5 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="space-y-1 overflow-hidden">
              <p className="text-[11px] sm:text-xs font-black text-muted-foreground uppercase tracking-widest mb-0.5 font-mono">Target_Date</p>
              <p className="text-sm sm:text-base font-black font-heading text-foreground truncate">{format(selectedDate, "MMM do, yyyy")}</p>
              <p className="text-[11px] font-black uppercase tracking-widest text-primary/50">Click any cell to travel</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
