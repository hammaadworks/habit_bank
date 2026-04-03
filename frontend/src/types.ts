export type UnitHierarchy = {
  [unit: string]: { [nextUnit: string]: number };
};

export type AgendaItem = {
  habit_id: string;
  name: string;
  priority: number;
  start_date: string;
  base_unit_name: string;
  unit_hierarchy: UnitHierarchy;
  todayDeficit?: number;
  todayTarget?: number;
  historicalDebt?: number;
  futureBuffer?: number;
  totalLifetimeSeconds?: number;
  avgWorkPerDay?: number;
  debtVelocity?: number;
  projectedClearanceDate?: string | null;
  progress_pct?: number;
  modal_completion_hour?: number | null;
  color?: string;
  user_id?: string;
  display_unit?: string;
  mark_off_unit: string;
  is_stacked?: boolean;
  frequency_type?: string;
  frequency_count?: number;
};

export type DashboardAgenda = {
  tier1: AgendaItem[];
  tier2: AgendaItem[];
  completed: AgendaItem[];
  daily_quota_remaining_seconds: number;
};

export type User = {
  id: string;
  username: string;
  daily_buffers: { [name: string]: number };
  day_start_hour: number;
  week_start_day: number;
  fill_direction: string;
  timezone_offset?: number;
};

export type TargetPhase = {
  id: string;
  habit_id: string;
  start_date: string;
  end_date: string | null;
  target_value: number;
};

export type HabitLog = {
  id: string;
  value: number;
  created_at: string;
};

export type HistoricalHabitState = {
  habit_id: string;
  name: string;
  target: number;
  physically_logged: number;
  received_from_surplus: number;
  total_allocated: number;
  is_full: boolean;
  unit: string;
  unit_hierarchy: UnitHierarchy;
};

export type TemporalSnapshot = {
  date: string;
  habits: HistoricalHabitState[];
};
