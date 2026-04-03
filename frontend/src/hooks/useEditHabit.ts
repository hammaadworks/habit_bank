"use client";

import { useState, useCallback, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { AgendaItem } from "@/types";

const PRESET_COLORS = [
  "#6366f1", // indigo
  "#ec4899", // pink
  "#f59e0b", // amber
  "#10b981", // emerald
  "#3b82f6", // blue
  "#ef4444", // red
  "#8b5cf6", // violet
];

export function useEditHabit(habit: AgendaItem, onUpdated: () => void) {
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phases, setPhases] = useState<any[]>([]);
  const [loadingPhases, setLoadingPhases] = useState(false);
  
  const [formData, setFormData] = useState({
    name: habit.name,
    priority: habit.priority.toString(),
    start_date: habit.start_date,
    is_stacked: habit.is_stacked || false,
    base_unit_name: habit.base_unit_name,
    mark_off_unit: habit.mark_off_unit,
    color: habit.color || PRESET_COLORS[0],
    frequency_type: habit.frequency_type || "daily",
    frequency_count: habit.frequency_count || 1
  });

  const [hierarchy, setHierarchy] = useState(habit.unit_hierarchy);

  const [editingPhaseId, setEditingPhaseId] = useState<string | null>(null);
  const [showPhaseForm, setShowAddPhase] = useState(false);
  const [phaseFormData, setPhaseFormData] = useState({
    target_value: "30",
    target_unit: habit.base_unit_name,
    start_date: new Date().toISOString().split('T')[0]
  });

  const fetchPhases = useCallback(async () => {
    setLoadingPhases(true);
    try {
      const data = await fetchApi(`/habits/${habit.habit_id}/phases/`);
      setPhases(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPhases(false);
    }
  }, [habit.habit_id]);

  useEffect(() => {
    fetchPhases();
  }, [fetchPhases]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const priority = parseInt(formData.priority);
      
      const payload: any = {
        name: formData.name,
        color: formData.color,
        is_stacked: formData.is_stacked,
        unit_hierarchy: hierarchy,
        frequency_type: formData.frequency_type,
        frequency_count: formData.frequency_count
      };

      if (!isNaN(priority)) payload.priority = priority;
      if (formData.start_date) payload.start_date = formData.start_date;
      if (formData.base_unit_name) payload.base_unit_name = formData.base_unit_name;
      if (formData.mark_off_unit) payload.mark_off_unit = formData.mark_off_unit;
      
      await fetchApi(`/habits/${habit.habit_id}`, {
        method: "PATCH",
        body: JSON.stringify(payload)
      });
      onUpdated();
    } catch (err: any) {
      setError(err.message || "Failed to update habit parameters.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePhaseSubmit = async () => {
    try {
      const url = editingPhaseId 
        ? `/habits/${habit.habit_id}/phases/${editingPhaseId}`
        : `/habits/${habit.habit_id}/phases/`;
      
      await fetchApi(url, {
        method: editingPhaseId ? "PUT" : "POST",
        body: JSON.stringify({
          habit_id: habit.habit_id,
          target_value: parseFloat(phaseFormData.target_value),
          unit: phaseFormData.target_unit,
          start_date: phaseFormData.start_date
        })
      });
      setShowAddPhase(false);
      setEditingPhaseId(null);
      await fetchPhases();
      onUpdated();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeletePhase = async (phaseId: string) => {
    if (phases.length <= 1) {
      alert("At least one target phase is required.");
      return;
    }
    try {
      await fetchApi(`/habits/${habit.habit_id}/phases/${phaseId}`, {
        method: "DELETE"
      });
      await fetchPhases();
      onUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure? This will permanently delete the habit and all its history.")) return;
    setDeleting(true);
    try {
      await fetchApi(`/habits/${habit.habit_id}`, {
        method: "DELETE"
      });
      onUpdated();
    } catch (err) {
      console.error("Failed to delete habit:", err);
    } finally {
      setDeleting(false);
    }
  };

  return {
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
  };
}
