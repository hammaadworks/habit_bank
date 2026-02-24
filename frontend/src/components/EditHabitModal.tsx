"use client";

import { useMemo } from "react";
import { 
  Loader2, 
  Trash2,
  AlertTriangle,
  Calendar,
  Plus,
  Target,
  Settings as SettingsIcon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UnitHierarchyEditor } from "./UnitHierarchyEditor";
import { Wizard } from "./Wizard";
import { AgendaItem } from "../types";
import { formatDuration, isTimeUnit, convertFromSeconds } from "@/lib/utils";
import { useEditHabit } from "@/hooks/useEditHabit";

const PRESET_COLORS = [
  "#6366f1", // indigo
  "#ec4899", // pink
  "#f59e0b", // amber
  "#10b981", // emerald
  "#3b82f6", // blue
  "#ef4444", // red
  "#8b5cf6", // violet
];

const TIME_UNITS = ["seconds", "minutes", "hours", "days", "weeks", "months", "years"];

export function EditHabitModal({ 
  habit, 
  onClose, 
  onUpdated 
}: { 
  habit: AgendaItem; 
  onClose: () => void; 
  onUpdated: () => void;
}) {
  const {
    submitting,
    deleting,
    error,
    phases,
    loadingPhases,
    formData,
    setFormData,
    hierarchy,
    setHierarchy,
    editingPhaseId,
    setEditingPhaseId,
    showPhaseForm,
    setShowAddPhase,
    phaseFormData,
    setPhaseFormData,
    handleSubmit,
    handlePhaseSubmit,
    handleDeletePhase,
    handleDelete
  } = useEditHabit(habit, onUpdated);

  const availableUnits = useMemo(() => {
    const units = new Set([formData.base_unit_name, ...TIME_UNITS]);
    Object.entries(hierarchy || {}).forEach(([u, targets]) => {
      units.add(u);
      Object.keys(targets as Record<string, number>).forEach(t => units.add(t));
    });
    return Array.from(units);
  }, [formData.base_unit_name, hierarchy]);

  const editSteps = [
    {
      title: "Core Config",
      description: "Basics and importance",
      isValid: formData.name.trim().length > 0,
      content: (
        <div className="space-y-4 sm:space-y-6">
          <div className="grid gap-1.5 sm:gap-2">
            <label className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-primary ml-1">Habit Name</label>
            <input 
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-white/50 border border-border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-lg sm:text-xl font-bold font-heading focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-1.5 sm:gap-2">
              <label className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Priority</label>
              <input 
                type="number"
                value={formData.priority}
                onChange={e => setFormData({...formData, priority: e.target.value})}
                className="w-full bg-white/50 border border-border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg font-bold focus:outline-none"
              />
            </div>
            <div className="grid gap-1.5 sm:gap-2">
              <label className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Genesis Date</label>
              <input 
                type="date"
                value={formData.start_date}
                onChange={e => setFormData({...formData, start_date: e.target.value})}
                className="w-full bg-white/50 border border-border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg font-bold focus:outline-none [color-scheme:light]"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 sm:p-4 bg-white/50 border border-border rounded-xl sm:rounded-2xl cursor-pointer hover:bg-white transition-all" onClick={() => setFormData({...formData, is_stacked: !formData.is_stacked})}>
            <input 
              type="checkbox"
              checked={formData.is_stacked}
              onChange={() => {}}
              className="w-4 h-4 sm:w-5 sm:h-5 accent-primary cursor-pointer"
            />
            <div>
              <p className="text-xs sm:text-sm font-bold">Stackable Module</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest">Exempt from daily quota</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Identity & Logic",
      description: "Visuals and conversions",
      content: (
        <div className="space-y-6 sm:space-y-8">
          <div className="space-y-2 sm:space-y-3">
            <label className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Identity Tint</label>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFormData({...formData, color: c})}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 transition-transform ${formData.color === c ? 'border-primary scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input 
                type="color" 
                value={formData.color}
                onChange={e => setFormData({...formData, color: e.target.value})}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-transparent border-none cursor-pointer"
              />
            </div>
          </div>
          <div className="border-t border-border pt-4 sm:pt-6">
            <UnitHierarchyEditor hierarchy={hierarchy} onChange={setHierarchy} />
          </div>
        </div>
      )
    }
  ];

  const phaseSteps = [
    {
      title: editingPhaseId ? "Update Phase" : "Establish Phase",
      description: editingPhaseId ? "Modify existing goal" : "Set new parameters",
      isValid: phaseFormData.target_value.trim().length > 0 && !isNaN(parseFloat(phaseFormData.target_value)),
      content: (
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="grid gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Value</label>
              <input 
                type="number"
                step="any"
                autoFocus
                value={phaseFormData.target_value}
                onChange={e => setPhaseFormData({...phaseFormData, target_value: e.target.value})}
                className="w-full bg-white/50 border border-border rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg font-bold focus:outline-none"
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Unit</label>
              <select 
                value={phaseFormData.target_unit}
                onChange={e => setPhaseFormData({...phaseFormData, target_unit: e.target.value})}
                className="w-full bg-white/50 border border-border rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg font-bold focus:outline-none [color-scheme:light]"
              >
                {availableUnits.map(u => <option key={u} value={u}>{u.toUpperCase()}</option>)}
              </select>
            </div>
          </div>
          <div className="grid gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Effective Date</label>
            <input 
              type="date"
              value={phaseFormData.start_date}
              onChange={e => setPhaseFormData({...phaseFormData, start_date: e.target.value})}
              className="w-full bg-white/50 border border-border rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg font-bold focus:outline-none [color-scheme:light]"
            />
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl glass-card rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-2xl overflow-y-auto max-h-[95vh] sm:max-h-[90vh]"
      >
        <div className="space-y-6 sm:space-y-10">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase font-heading leading-tight">Parameters</h2>
              <p className="text-primary text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] sm:tracking-[0.5em] border-l-2 border-primary pl-3 sm:pl-4 inline-block">Update_Record_Sequence</p>
            </div>
            <button 
              onClick={handleDelete}
              disabled={deleting}
              className="p-3 sm:p-4 bg-destructive/5 text-destructive border border-destructive/10 rounded-xl sm:rounded-2xl hover:bg-destructive hover:text-white transition-all active:scale-95 shadow-sm shrink-0"
            >
              {deleting ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
            <div className="space-y-6">
              <Wizard 
                steps={editSteps}
                onComplete={handleSubmit}
                onCancel={onClose}
                isSubmitting={submitting}
                submitLabel="COMMIT_CHANGES"
                backLabel="PREV"
                cancelLabel="ABORT"
              />
              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-[10px] sm:text-xs font-bold uppercase tracking-widest flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>

            <div className="space-y-6 sm:space-y-8">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg sm:text-xl font-bold uppercase tracking-tight font-heading">Goals_History</h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-widest">Chronological_Targets</p>
                </div>
                <button 
                  onClick={() => {
                    if (showPhaseForm && editingPhaseId) {
                      setEditingPhaseId(null);
                      setPhaseFormData({
                        target_value: "30",
                        target_unit: habit.base_unit_name,
                        start_date: new Date().toISOString().split('T')[0]
                      });
                    } else {
                      setShowAddPhase(!showPhaseForm);
                    }
                  }}
                  className="p-2.5 sm:p-3 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-lg sm:rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <AnimatePresence>
                  {showPhaseForm && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 sm:p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl sm:rounded-3xl overflow-hidden"
                    >
                      <Wizard 
                        steps={phaseSteps}
                        onComplete={handlePhaseSubmit}
                        onCancel={() => {
                          setShowAddPhase(false);
                          setEditingPhaseId(null);
                        }}
                        submitLabel={editingPhaseId ? "Update_Phase" : "Deploy_Phase"}
                        cancelLabel="Cancel"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-3 max-h-60 sm:max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {loadingPhases ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground/30" />
                    </div>
                  ) : phases.length === 0 ? (
                    <p className="text-center py-8 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground font-mono">NO_GOALS_DEFINED</p>
                  ) : (
                    phases.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()).map(phase => (
                      <div key={phase.id} className="flex items-center justify-between p-4 sm:p-5 bg-white/50 border border-border rounded-xl sm:rounded-2xl group/phase hover:border-primary/30 transition-all">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="p-2.5 sm:p-3 bg-white rounded-lg sm:rounded-xl shadow-sm">
                            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-base sm:text-lg font-bold font-heading">
                                {isTimeUnit(habit.mark_off_unit) 
                                  ? formatDuration(phase.target_value) 
                                  : convertFromSeconds(phase.target_value, habit.mark_off_unit, habit.unit_hierarchy).toFixed(1)}
                              </span>
                              {!isTimeUnit(habit.mark_off_unit) && <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{habit.mark_off_unit}</span>}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5 text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              <span className="text-[9px] sm:text-xxs font-bold uppercase tracking-tight">Active since {phase.start_date}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover/phase:opacity-100 transition-all">
                          <button 
                            onClick={() => {
                              setEditingPhaseId(phase.id);
                              setPhaseFormData({
                                target_value: convertFromSeconds(phase.target_value, habit.mark_off_unit, habit.unit_hierarchy).toString(),
                                target_unit: habit.mark_off_unit,
                                start_date: phase.start_date
                              });
                              setShowAddPhase(true);
                            }}
                            className="p-2 text-muted-foreground hover:text-primary transition-colors"
                          >
                            <SettingsIcon className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeletePhase(phase.id)}
                            className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 sm:pt-8 border-t border-black/5 flex justify-end">
            <button 
              onClick={onClose}
              className="w-full sm:w-auto px-10 py-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-widest text-muted-foreground hover:bg-black/5 transition-all"
            >
              Done
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
