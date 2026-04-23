"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sidebar } from "@/components/Sidebar";
import { UserSelector } from "@/components/UserSelector";
import { CreateHabitModal } from "@/components/CreateHabitModal";
import { EditHabitModal } from "@/components/EditHabitModal";
import { DailyBreakdownModal } from "@/components/DailyBreakdownModal";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { SettingsView } from "@/components/dashboard/SettingsView";
import { AssistantChat } from "@/components/AssistantChat";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useUser } from "@/hooks/useUser";
import { useAgenda } from "@/hooks/useAgenda";
import { getLogicalDate } from "@/lib/utils";
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
    recommendations 
  } = useAgenda(activeUser?.id);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [analyticsSelectedId, setAnalyticsSelectedId] = useState<string>("global");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<AgendaItem | null>(null);
  const [timeTravelDate, setTimeTravelDate] = useState<Date | null>(null);
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
          setAnalyticsSelectedId(id);
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
                setAnalyticsSelectedId(id);
                setActiveTab("analytics");
              }}
            />
          )}

          {activeTab === "analytics" && agenda && activeUser && (
            <AnalyticsDashboard 
              allHabits={[...agenda.tier1, ...agenda.tier2, ...agenda.completed]}
              selectedId={analyticsSelectedId}
              onSelectId={setAnalyticsSelectedId}
              logicalToday={logicalToday}
            />
          )}

          {activeTab === "assistant" && activeUser && agenda && (
            <AssistantChat 
              activeUser={activeUser}
              agenda={agenda}
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
