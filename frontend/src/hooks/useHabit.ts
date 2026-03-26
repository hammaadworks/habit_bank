"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { parseISO, differenceInCalendarDays } from "date-fns";
import { fetchApi } from "@/lib/api";
import { convertFromSeconds, getMultiplier } from "@/lib/utils";
import { AgendaItem, HabitLog } from "@/types";
import { TimelineDay } from "@/components/Heatmap";

export function useHabit(item: AgendaItem, logicalToday: string, onLog: () => void, isDashboard: boolean) {
  const [expanded, setExpanded] = useState(false);
  const [timeline, setTimeline] = useState<TimelineDay[]>([]);
  const [logValue, setLogValue] = useState("");
  const [logUnit, setLogUnit] = useState(item.mark_off_unit);
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [todayLogs, setTodayLogs] = useState<HabitLog[]>([]);

  const availableUnits = useMemo(() => {
    const units = new Set<string>();
    if (item.mark_off_unit) units.add(item.mark_off_unit);
    if (item.display_unit) units.add(item.display_unit);
    Object.keys(item.unit_hierarchy).forEach(u => units.add(u));
    return Array.from(units);
  }, [item.mark_off_unit, item.display_unit, item.unit_hierarchy]);

  const [currentViewUnit, setCurrentViewUnit] = useState(item.display_unit || item.mark_off_unit);

  const cycleUnit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const idx = availableUnits.indexOf(currentViewUnit);
    const nextIdx = (idx + 1) % availableUnits.length;
    setCurrentViewUnit(availableUnits[nextIdx]);
  }, [availableUnits, currentViewUnit]);

  const totalDays = useMemo(() => {
    const start = parseISO(item.start_date);
    const today = new Date();
    return Math.max(0, differenceInCalendarDays(today, start)) + 1;
  }, [item.start_date]);

  const fetchDetailedState = useCallback(async () => {
    try {
      const [state, logs] = await Promise.all([
        fetchApi(`/habits/${item.habit_id}/state`),
        fetchApi(`/habits/${item.habit_id}/logs/today`)
      ]);
      setTimeline(state.timeline);
      setTodayLogs(logs);
    } catch(err) {
      console.error(err);
    }
  }, [item.habit_id]);

  useEffect(() => {
    if (expanded) fetchDetailedState();
  }, [expanded, fetchDetailedState]);

  const handleLog = async () => {
    if (!logValue || status === "submitting") return;
    setStatus("submitting");
    
    try {
      await fetchApi(`/habits/${item.habit_id}/logs/`, {
        method: "POST",
        body: JSON.stringify({
          logged_date: logicalToday,
          value: parseFloat(logValue),
          unit: logUnit
        })
      });
      setStatus("success");
      setTimeout(() => {
        setLogValue("");
        setStatus("idle");
        if (!isDashboard) setExpanded(false);
        fetchDetailedState();
        onLog();
      }, 800);
    } catch (err: any) {
      alert(err.message || "Failed to log session");
      setStatus("idle");
    }
  };

  const handleDeleteLog = async (logId: string) => {
    try {
      await fetchApi(`/habits/${item.habit_id}/logs/${logId}`, { method: "DELETE" });
      fetchDetailedState();
      onLog();
    } catch(err) {
      console.error(err);
    }
  };

  const displayValue = useMemo(() => {
    let val = 0;
    // We need to know the 'type' to decide which value to show, 
    // but the hook can return a helper function or the values directly.
    // For simplicity, let's return a function.
    return (type: "tier1" | "tier2" | "completed") => {
      let rawSeconds = 0;
      if (type === "tier1") rawSeconds = item.todayDeficit || 0;
      else if (type === "tier2") rawSeconds = item.historicalDebt || 0;
      else rawSeconds = item.futureBuffer || 0;
      
      return convertFromSeconds(rawSeconds, currentViewUnit, item.unit_hierarchy);
    };
  }, [item, currentViewUnit]);

  return {
    expanded,
    setExpanded,
    timeline,
    logValue,
    setLogValue,
    logUnit,
    setLogUnit,
    status,
    todayLogs,
    availableUnits,
    currentViewUnit,
    cycleUnit,
    totalDays,
    handleLog,
    handleDeleteLog,
    displayValue
  };
}
