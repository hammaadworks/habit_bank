"use client";

import { Clock, Zap, Flame, CheckCircle2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { formatDuration, convertFromSeconds, isTimeUnit } from "@/lib/utils";
import { AgendaItem } from "@/types";

interface HabitStatsProps {
  item: AgendaItem;
  totalDays: number;
  currentViewUnit: string;
}

export function HabitStats({ item, totalDays, currentViewUnit }: HabitStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="p-5 bg-white/50 border border-white/20 rounded-2xl flex flex-col gap-1">
        <span className="text-xxs font-bold text-muted-foreground tracking-widest uppercase">Usual Time</span>
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3 text-primary" />
          <span className="text-xl font-bold font-heading">
            {item.modal_completion_hour !== null && item.modal_completion_hour !== undefined 
              ? (item.modal_completion_hour === 0 ? "12 AM" : item.modal_completion_hour < 12 ? `${item.modal_completion_hour} AM` : item.modal_completion_hour === 12 ? "12 PM" : `${item.modal_completion_hour - 12} PM`)
              : "N/A"}
          </span>
        </div>
      </div>
      <div className="p-5 bg-white/50 border border-white/20 rounded-2xl flex flex-col gap-1">
        <span className="text-xxs font-bold text-muted-foreground tracking-widest uppercase">Lifetime Effort</span>
        <div className="flex items-center gap-2">
          <Zap className="w-3 h-3 text-primary" />
          <span className="text-xl font-bold font-heading">
            {isTimeUnit(currentViewUnit) ? formatDuration(item.totalLifetimeSeconds || 0) : `${convertFromSeconds(item.totalLifetimeSeconds || 0, currentViewUnit, item.unit_hierarchy).toFixed(1)} ${currentViewUnit}`}
          </span>
        </div>
      </div>
      <div className="p-5 bg-white/50 border border-white/20 rounded-2xl flex flex-col gap-1">
        <span className="text-xxs font-bold text-muted-foreground tracking-widest uppercase">Tracked Days</span>
        <div className="flex items-center gap-2">
          <Flame className="w-3 h-3 text-emerald-500" />
          <span className="text-xl font-bold font-heading text-emerald-500">{totalDays}</span>
        </div>
      </div>
      <div className="p-5 bg-white/50 border border-white/20 rounded-2xl flex flex-col gap-1">
        <span className="text-xxs font-bold text-muted-foreground tracking-widest uppercase">Clearance Est.</span>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3 h-3 text-primary" />
          <span className="text-xl font-bold font-heading">{item.projectedClearanceDate ? format(parseISO(item.projectedClearanceDate), "MMM d") : "N/A"}</span>
        </div>
      </div>
    </div>
  );
}
