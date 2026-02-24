"use client";

import { useMemo } from "react";
import { 
  AlertTriangle,
  History,
  Target,
  Zap
} from "lucide-react";
import { motion } from "motion/react";
import { Wizard } from "./Wizard";
import { Combobox } from "./Combobox";
import { useCreateHabit } from "@/hooks/useCreateHabit";

const TIME_UNITS = ["seconds", "minutes", "hours", "days", "weeks", "months", "years"];

export function CreateHabitModal({ 
  userId, 
  onClose, 
  onCreated 
}: { 
  userId: string; 
  onClose: () => void; 
  onCreated: () => void;
}) {
  const {
    submitting,
    error,
    formData,
    setFormData,
    unitDefinitions,
    setUnitDefinitions,
    handleFinalSubmit,
    isTimeUnit
  } = useCreateHabit(userId, onCreated);

  const steps = useMemo(() => {
    const baseSteps = [
      {
        title: "The Identity",
        description: "Name your protocol and set priority",
        isValid: formData.name.trim().length > 0 && formData.start_date.length > 0,
        content: (
          <div className="space-y-6">
            <div className="grid gap-2">
              <label className="text-xs font-black uppercase tracking-widest text-primary ml-1">Protocol Name</label>
              <input 
                required
                autoFocus
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Deep Work, Meditation, Exercise..."
                className="w-full bg-white/50 border border-border rounded-2xl px-6 py-4 text-xl font-bold font-heading focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder-muted-foreground/20"
              />
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid gap-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Start Date</label>
                <input 
                  type="date"
                  value={formData.start_date}
                  onChange={e => setFormData({...formData, start_date: e.target.value})}
                  className="w-full bg-white/50 border border-border rounded-2xl px-6 py-4 text-lg font-bold focus:outline-none [color-scheme:light]"
                />
              </div>
              <div className="flex items-center gap-3 mt-2 p-4 bg-white/50 border border-border rounded-2xl cursor-pointer hover:bg-white transition-all" onClick={() => setFormData({...formData, is_stacked: !formData.is_stacked})}>
                <input 
                  type="checkbox"
                  checked={formData.is_stacked}
                  onChange={() => {}}
                  className="w-5 h-5 accent-primary cursor-pointer"
                />
                <div>
                  <p className="text-sm font-bold">Stackable Module</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Exempt from daily time capacity quota</p>
                </div>
              </div>
            </div>
          </div>
        )
      },
      {
        title: "Daily Goal",
        description: "What's the target for this habit?",
        isValid: formData.target_value.trim().length > 0 && !isNaN(parseFloat(formData.target_value)) && formData.target_unit.trim().length > 0,
        content: (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-xs font-black uppercase tracking-widest text-primary ml-1">Value</label>
                <input 
                  type="number"
                  step="any"
                  autoFocus
                  value={formData.target_value}
                  onChange={e => setFormData({...formData, target_value: e.target.value})}
                  className="w-full bg-white/50 border border-border rounded-2xl px-6 py-4 text-3xl font-black font-heading focus:outline-none"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Unit</label>
                <Combobox 
                  options={TIME_UNITS}
                  value={formData.target_unit}
                  onChange={val => setFormData({...formData, target_unit: val})}
                  placeholder="e.g. pages, juz, pushups..."
                />
              </div>
            </div>
          </div>
        )
      }
    ];

    const discoverySteps = unitDefinitions.map((def, i) => ({
      title: `Define ${def.unit}`,
      description: `Map '${def.unit}' to a more granular unit`,
      isValid: def.multiplier > 0 && def.to_unit.trim().length > 0,
      content: (
        <div className="space-y-8">
          <div className="flex items-center gap-6 p-6 bg-primary/5 rounded-3xl border border-primary/10">
            <div className="p-4 bg-primary rounded-2xl">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">Conversion Logic</p>
              <p className="text-xl font-bold font-heading">1 {def.unit.toUpperCase()} = ?</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Quantity</label>
              <input 
                type="number"
                step="any"
                value={isNaN(def.multiplier) ? "" : def.multiplier}
                onChange={e => {
                  const val = e.target.value;
                  const newDefs = [...unitDefinitions];
                  newDefs[i].multiplier = val === "" ? 0 : parseFloat(val);
                  setUnitDefinitions(newDefs);
                }}
                className="w-full bg-white/50 border border-border rounded-2xl px-6 py-4 text-2xl font-black font-heading focus:outline-none"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Sub-Unit</label>
              <Combobox 
                options={TIME_UNITS}
                value={def.to_unit}
                onChange={val => {
                  const newDefs = [...unitDefinitions];
                  newDefs[i].to_unit = val;
                  setUnitDefinitions(newDefs);
                }}
                placeholder="e.g. pages, minutes..."
              />
            </div>
          </div>
          
          {!isTimeUnit(def.to_unit) && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3">
              <Zap className="w-4 h-4 text-amber-500" />
              <p className="text-xxs font-bold uppercase tracking-widest text-amber-500">
                Custom unit detected. Further granularity will be requested.
              </p>
            </div>
          )}
        </div>
      )
    }));

    return [...baseSteps, ...discoverySteps];
  }, [formData, unitDefinitions, setFormData, setUnitDefinitions, isTimeUnit]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl glass-card rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-2xl overflow-y-auto max-h-[95vh] sm:max-h-[90vh] border border-white/20"
      >
        <div className="space-y-6 sm:space-y-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 bg-primary/10 rounded-xl sm:rounded-2xl border border-primary/20 shrink-0">
                <History className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="overflow-hidden">
                <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase font-heading leading-tight truncate">Identity Setup</h2>
                <p className="text-primary text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] sm:tracking-[0.5em] mt-1 sm:mt-2 truncate">Initialize_Habit_Module_v2.0</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl sm:rounded-2xl text-destructive text-[10px] sm:text-xs font-bold uppercase tracking-widest flex items-center gap-3">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}

          <Wizard 
            steps={steps}
            onComplete={handleFinalSubmit}
            onCancel={onClose}
            isSubmitting={submitting}
            submitLabel="Initialize"
            cancelLabel="Nah"
          />
        </div>
      </motion.div>
    </div>
  );
}
