"use client";

import { useState } from "react";
import { Plus, ArrowRight, Trash2, Clock, X, Edit2, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Wizard } from "./Wizard";
import { UnitHierarchy } from "../types";
import { isTimeUnit } from "../lib/utils";
import { Combobox } from "./Combobox";

const TIME_UNITS = [
  "seconds", "minutes", "hours", "days", "weeks", "months", "years"
];

/**
 * A component for viewing and managing a unit conversion hierarchy.
 */
export function UnitHierarchyEditor({ 
  hierarchy = {}, 
  onChange 
}: { 
  hierarchy?: UnitHierarchy; 
  onChange: (h: UnitHierarchy) => void 
}) {
  const [newUnit, setNewUnit] = useState("");
  const [newValue, setNewValue] = useState("");
  const [nextUnit, setNextUnit] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  /**
   * Adds a new conversion rule to the hierarchy.
   */
  const addRule = () => {
    if (!newUnit || !newValue || !nextUnit) return;
    const valueNum = parseFloat(newValue);
    if (isNaN(valueNum)) return;

    // Create a deep copy to avoid direct state mutation.
    const newHierarchy = JSON.parse(JSON.stringify(hierarchy || {}));
    if (!newHierarchy[newUnit]) {
      newHierarchy[newUnit] = {};
    }
    newHierarchy[newUnit][nextUnit] = valueNum;
    
    onChange(newHierarchy);
    // Reset input fields
    setNewUnit("");
    setNewValue("");
    setNextUnit("");
    setShowAdd(false);
  };

  /**
   * Updates an existing conversion rule value.
   */
  const updateRule = (unit: string, target: string) => {
    const val = parseFloat(editValue);
    if (isNaN(val)) return;

    const newHierarchy = JSON.parse(JSON.stringify(hierarchy || {}));
    if (newHierarchy[unit]) {
      newHierarchy[unit][target] = val;
      onChange(newHierarchy);
    }
    setEditingKey(null);
  };

  /**
   * Removes a specific conversion rule from the hierarchy.
   */
  const removeRule = (unit: string, target: string) => {
    const newHierarchy = JSON.parse(JSON.stringify(hierarchy || {}));
    if (newHierarchy[unit]) {
      delete newHierarchy[unit][target];
      // If the parent unit no longer has any rules, remove it.
      if (Object.keys(newHierarchy[unit]).length === 0) {
        delete newHierarchy[unit];
      }
      onChange(newHierarchy);
    }
  };

  const steps = [
    {
      title: "New Conversion",
      description: "Define unit relationships",
      isValid: newUnit.trim().length > 0 && newValue.trim().length > 0 && !isNaN(parseFloat(newValue)) && nextUnit.trim().length > 0,
      content: (
        <div className="space-y-6">
          <div className="grid gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Bigger Unit</label>
              <Combobox 
                options={TIME_UNITS}
                value={newUnit}
                onChange={setNewUnit}
                placeholder="E.G. HOUR, KM..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Multiplier</label>
                <input 
                  type="number"
                  value={newValue}
                  onChange={e => setNewValue(e.target.value)}
                  placeholder="60"
                  className="w-full bg-muted/50 border border-border rounded-xl px-4 py-4 text-lg font-bold focus:outline-none transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Smaller Unit</label>
                <Combobox 
                  options={TIME_UNITS}
                  value={nextUnit}
                  onChange={setNextUnit}
                  placeholder="MIN"
                />
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 text-blue-500" />
          <h4 className="text-xs text-blue-500 font-black uppercase tracking-[0.4em]">Conversions</h4>
        </div>
        <button 
          type="button"
          onClick={() => setShowAdd(!showAdd)}
          className="p-2 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-lg hover:bg-blue-500 hover:text-white transition-colors"
        >
          {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {showAdd && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-6 bg-muted/30 border border-border rounded-2xl overflow-hidden"
          >
            <Wizard 
              steps={steps}
              onComplete={addRule}
              onCancel={() => setShowAdd(false)}
              submitLabel="Establish Rule"
              cancelLabel="Cancel"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Display existing rules */}
      <div className="space-y-3">
        {Object.entries(hierarchy || {}).map(([unit, targets]) => (
          Object.entries(targets).map(([target, val]) => {
            // Filter out universal time-to-time truths
            if (isTimeUnit(unit) && isTimeUnit(target)) return null;
            
            const isEditing = editingKey === `${unit}-${target}`;

            return (
              <motion.div 
                layout
                key={`${unit}-${target}`}
                className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-xl group/rule"
              >
                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
                  <span className="text-foreground">1 {unit}</span>
                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                  
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input 
                        autoFocus
                        type="number"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        className="w-20 bg-white border border-border rounded px-2 py-1 text-blue-500 focus:outline-none"
                        onKeyDown={e => e.key === "Enter" && updateRule(unit, target)}
                      />
                      <span className="text-blue-500">{target}</span>
                    </div>
                  ) : (
                    <span className="text-blue-500">{val} {target}</span>
                  )}
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover/rule:opacity-100 transition-all">
                  {isEditing ? (
                    <button 
                      type="button"
                      onClick={() => updateRule(unit, target)}
                      className="p-2 hover:bg-emerald-500/10 text-emerald-600 rounded-lg"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => {
                        setEditingKey(`${unit}-${target}`);
                        setEditValue(val.toString());
                      }}
                      className="p-2 hover:bg-blue-500/10 text-blue-500 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    type="button"
                    onClick={() => removeRule(unit, target)}
                    className="p-2 hover:bg-destructive/10 hover:text-destructive text-muted-foreground rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })
        ))}
      </div>
    </div>
  );
}
