"use client";

import { cn } from "@/lib/utils";

export function StatMini({ label, value, color = "text-foreground" }: { label: string, value: any, color?: string }) {
  return (
    <div className="p-3 md:p-4 bg-muted/30 border border-border/50 rounded-2xl flex flex-col justify-center overflow-hidden">
      <h5 className="text-xxs md:text-xxs font-black uppercase tracking-widest text-muted-foreground mb-1 truncate">{label}</h5>
      <p className={cn("text-lg md:text-xl font-black font-heading leading-tight truncate", color)}>{value}</p>
    </div>
  );
}
