"use client";

import { History, Trash2 } from "lucide-react";
import { convertFromSeconds } from "@/lib/utils";
import { AgendaItem, HabitLog } from "@/types";

interface TodayLogsProps {
  item: AgendaItem;
  todayLogs: HabitLog[];
  handleDeleteLog: (logId: string) => void;
}

export function TodayLogs({ item, todayLogs, handleDeleteLog }: TodayLogsProps) {
  if (todayLogs.length === 0) return null;

  return (
    <div className="space-y-3 mt-8">
      <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
        <History className="w-3 h-3" /> Done today
      </h4>
      <div className="grid gap-2 max-h-40 overflow-y-auto pr-2">
        {todayLogs.map(log => (
          <div key={log.id} className="flex items-center justify-between p-3 bg-background border border-border rounded-xl">
            <span className="text-sm font-bold italic">{convertFromSeconds(log.value, item.mark_off_unit, item.unit_hierarchy).toFixed(1)} {item.mark_off_unit}</span>
            <button onClick={() => handleDeleteLog(log.id)} className="text-destructive hover:bg-destructive/10 p-1 rounded-lg transition-colors">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
