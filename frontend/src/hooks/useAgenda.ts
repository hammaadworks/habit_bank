"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchApi } from "@/lib/api";
import { DashboardAgenda, AgendaItem } from "@/types";

export function useAgenda(userId: string | undefined) {
  const [agenda, setAgenda] = useState<DashboardAgenda | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAgenda = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await fetchApi(`/dashboard/agenda?user_id=${userId}`);
      setAgenda(data);
    } catch (err) {
      console.error("Failed to fetch agenda", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchAgenda();
    }
  }, [userId, fetchAgenda]);

  const allHabits = useMemo(() => {
    if (!agenda) return [];
    return [...agenda.tier1, ...agenda.tier2, ...agenda.completed];
  }, [agenda]);

  const recommendations = useMemo(() => {
    if (!agenda || agenda.tier1.length === 0) return [];
    
    const currentHour = new Date().getHours();
    
    return agenda.tier1
      .map(habit => {
        let score = 0;
        
        // Time Proximity Score (0 to 10)
        if (habit.modal_completion_hour !== null && habit.modal_completion_hour !== undefined) {
          const diff = Math.min(
            Math.abs(currentHour - habit.modal_completion_hour),
            24 - Math.abs(currentHour - habit.modal_completion_hour)
          );
          score += Math.max(0, 10 - diff * 2);
        }
        
        // Priority Score (0 to 5)
        score += Math.max(0, 5 - (habit.priority / 10));
        
        // Debt/Deficit Weight
        score += Math.min(5, (Number(habit.todayDeficit || 0) / 3600));

        return { ...habit, rec_score: score };
      })
      .sort((a, b) => b.rec_score - a.rec_score)
      .slice(0, 3);
  }, [agenda]);

  return {
    agenda,
    loading,
    fetchAgenda,
    allHabits,
    recommendations
  };
}
