"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { fetchApi } from "@/lib/api";

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

interface UnitDefinition {
  unit: string;
  multiplier: number;
  to_unit: string;
}

export function useCreateHabit(userId: string, onCreated: () => void) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    priority: "10",
    color: PRESET_COLORS[0],
    target_value: "1",
    target_unit: "",
    start_date: new Date().toISOString().split('T')[0],
    is_stacked: false,
    frequency_type: "daily",
    frequency_count: 1
  });

  const [unitDefinitions, setUnitDefinitions] = useState<UnitDefinition[]>([]);

  const isTimeUnit = (unit: string) => TIME_UNITS.includes(unit.toLowerCase());

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const hierarchy: Record<string, Record<string, number>> = {};
      hierarchy["hours"] = { "minutes": 60 };
      hierarchy["days"] = { "minutes": 1440 };
      hierarchy["minutes"] = { "seconds": 60 };

      unitDefinitions.forEach(def => {
        hierarchy[def.unit] = { [def.to_unit]: def.multiplier };
      });

      const habitData = await fetchApi("/habits/", {
        method: "POST",
        body: JSON.stringify({
          user_id: userId,
          name: formData.name,
          priority: parseInt(formData.priority),
          is_stacked: formData.is_stacked,
          base_unit_name: "seconds",
          mark_off_unit: formData.target_unit,
          color: formData.color,
          unit_hierarchy: hierarchy,
          start_date: formData.start_date,
          frequency_type: formData.frequency_type,
          frequency_count: formData.frequency_count
        })
      });

      await fetchApi(`/habits/${habitData.id}/phases/`, {
        method: "POST",
        body: JSON.stringify({
          habit_id: habitData.id,
          start_date: formData.start_date,
          target_value: parseFloat(formData.target_value),
          unit: formData.target_unit
        })
      });

      onCreated();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const lastUnit = unitDefinitions.length === 0 ? formData.target_unit : unitDefinitions[unitDefinitions.length - 1].to_unit;
    
    if (lastUnit && !isTimeUnit(lastUnit) && !unitDefinitions.some(d => d.unit === lastUnit)) {
      setUnitDefinitions([...unitDefinitions, { unit: lastUnit, multiplier: 1, to_unit: "" }]);
    }
    
    if (isTimeUnit(formData.target_unit) && unitDefinitions.length > 0) {
      setUnitDefinitions([]);
    }

    let reachable = [formData.target_unit];
    let filtered = [];
    for (const def of unitDefinitions) {
      if (reachable.includes(def.unit)) {
        filtered.push(def);
        reachable.push(def.to_unit);
      }
    }
    if (filtered.length !== unitDefinitions.length) {
      setUnitDefinitions(filtered);
    }
  }, [formData.target_unit, unitDefinitions]);

  return {
    submitting,
    error,
    formData,
    setFormData,
    unitDefinitions,
    setUnitDefinitions,
    handleFinalSubmit,
    isTimeUnit
  };
}
