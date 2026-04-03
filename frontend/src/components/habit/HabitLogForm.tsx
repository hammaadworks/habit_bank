"use client";

import { Wizard } from "../Wizard";
import { AgendaItem } from "../../types";

interface HabitLogFormProps {
  item: AgendaItem;
  logValue: string;
  setLogValue: (v: string) => void;
  logUnit: string;
  setLogUnit: (v: string) => void;
  availableUnits: string[];
  handleLog: () => void;
  onCancel: () => void;
  status: "idle" | "submitting" | "success" | "error";
}

export function HabitLogForm({
  item,
  logValue,
  setLogValue,
  logUnit,
  setLogUnit,
  availableUnits,
  handleLog,
  onCancel,
  status
}: HabitLogFormProps) {
  const logSteps = [
    {
      title: "Log Progress",
      description: `Recording session for ${item.name}`,
      isValid: logValue.trim().length > 0 && !isNaN(parseFloat(logValue)),
      content: (
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                Quantity
              </label>
              <input
                type="number"
                step="any"
                autoFocus
                value={logValue}
                onChange={e => setLogValue(e.target.value)}
                placeholder="0.00"
                className="w-full bg-background border border-border rounded-xl px-3 sm:px-4 py-3 sm:py-4 text-xl sm:text-2xl font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                Unit
              </label>
              <select
                value={logUnit}
                onChange={e => setLogUnit(e.target.value)}
                className="w-full bg-background border border-border rounded-2xl px-6 py-5 text-xl font-black font-heading text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-inner [color-scheme:dark] appearance-none cursor-pointer"
              >
                {availableUnits.map(u => (
                  <option key={u} value={u}>{u.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <Wizard
      steps={logSteps}
      onComplete={handleLog}
      onCancel={onCancel}
      isSubmitting={status === "submitting"}
      submitLabel="Log Session"
      cancelLabel="Close"
    />
  );
}
