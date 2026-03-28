"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Sidebar } from "@/components/Sidebar";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { UserSelector } from "@/components/UserSelector";
import { CreateHabitModal } from "@/components/CreateHabitModal";
import { EditHabitModal } from "@/components/EditHabitModal";
import { DailyBreakdownModal } from "@/components/DailyBreakdownModal";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { HabitsView } from "@/components/dashboard/HabitsView";
import { SettingsView } from "@/components/dashboard/SettingsView";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useUser } from "@/hooks/useUser";
import { useAgenda } from "@/hooks/useAgenda";
import { getLogicalDate } from "@/lib/utils";
import { Zap } from "lucide-react";
import { AgendaItem } from "@/types";
import { Logo } from "@/components/Logo";

export default function DashboardPage() {
  const { 
    activeUser, 
    loading: userLoading, 
    fetchUserProfile, 
    handleUserSelect, 
    updateBuffers 
  } = useUser();

  const { 
    agenda, 
    loading: agendaLoading, 
    fetchAgenda, 
    allHabits, 
    recommendations 
  } = useAgenda(activeUser?.id);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<AgendaItem | null>(null);
  const [timeTravelDate, setTimeTravelDate] = useState<Date | null>(null);
  const [selectedAnalyticsHabitId, setSelectedAnalyticsHabitId] = useState<string>("global");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const logicalToday = useMemo(() => {
    if (!activeUser) return new Date().toISOString().split('T')[0];
    return getLogicalDate(activeUser.timezone_offset || 0, activeUser.day_start_hour);
  }, [activeUser]);

  if (!activeUser && !userLoading) {
    return <UserSelector onUserSelect={handleUserSelect} activeUser={null} />;
  }

  if (userLoading || (agendaLoading && !agenda)) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-8 bg-background text-foreground">
        <Logo iconOnly className="w-16 h-16 animate-pulse" />
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-primary font-black uppercase tracking-[0.5em]"
        >
          Initializing Ledger
        </motion.span>
      </div>
    );
  }

  const quotaSeconds = agenda?.daily_quota_remaining_seconds || 0;
  const quotaPercent = Math.max(0, Math.min(100, (agenda?.daily_quota_remaining_seconds || 0) / 86400 * 100));

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-x-hidden">
      <Header 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        activeUser={activeUser}
        handleUserSelect={handleUserSelect}
        onOpenSidebar={() => setIsMobileSidebarOpen(true)}
        onAddHabit={() => setIsCreateModalOpen(true)}
      />

      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onLogout={() => handleUserSelect(null)}
        user={activeUser}
        agenda={agenda}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        onDateSelect={(d) => {
          setTimeTravelDate(d);
          setActiveTab("dashboard");
        }}
        onSelectAnalytics={(id) => {
          setSelectedAnalyticsHabitId(id);
          setActiveTab("analytics");
        }}
        logicalToday={logicalToday}
      />

      <main className="flex-1 min-w-0 px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24 space-y-12 md:space-y-20 lg:space-y-24 pt-28 sm:pt-32 transition-all duration-500 pb-20">
        <div className="min-h-[60vh]">
          {activeTab === "dashboard" && agenda && activeUser && (
            <DashboardView 
              agenda={agenda}
              activeUser={activeUser}
              timeTravelDate={timeTravelDate}
              setTimeTravelDate={setTimeTravelDate}
              recommendations={recommendations}
              fetchAgenda={fetchAgenda}
              setEditingHabit={setEditingHabit}
              logicalToday={logicalToday}
              setActiveTab={setActiveTab}
              onViewAnalytics={(id) => {
                setSelectedAnalyticsHabitId(id);
                setActiveTab("analytics");
              }}
            />
          )}

          {activeTab === "habits" && agenda && (
            <HabitsView 
              agenda={agenda}
              allHabits={allHabits}
              setIsCreateModalOpen={setIsCreateModalOpen}
              setEditingHabit={setEditingHabit}
              quotaSeconds={quotaSeconds}
              quotaPercent={quotaPercent}
            />
          )}

          {activeTab === "analytics" && (
            <AnalyticsDashboard 
              allHabits={allHabits} 
              selectedId={selectedAnalyticsHabitId} 
              onSelectId={setSelectedAnalyticsHabitId} 
              logicalToday={logicalToday}
            />
          )}

          {activeTab === "settings" && activeUser && (
            <SettingsView 
              activeUser={activeUser}
              fetchUserProfile={fetchUserProfile}
              fetchAgenda={fetchAgenda}
              handleUserSelect={handleUserSelect}
              updateBuffers={updateBuffers}
            />
          )}
        </div>

        <Footer />
      </main>

      <AnimatePresence>
        {isCreateModalOpen && activeUser && (
          <CreateHabitModal 
            userId={activeUser.id}
            onClose={() => setIsCreateModalOpen(false)} 
            onCreated={() => {
              setIsCreateModalOpen(false);
              fetchAgenda();
            }} 
          />
        )}
        {isBreakdownModalOpen && activeUser && agenda && (
          <DailyBreakdownModal
            user={activeUser}
            agenda={agenda}
            onClose={() => setIsBreakdownModalOpen(false)}
          />
        )}
        {editingHabit && (
          <EditHabitModal 
            habit={editingHabit}
            onClose={() => setEditingHabit(null)}
            onUpdated={() => {
              setEditingHabit(null);
              fetchAgenda();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
