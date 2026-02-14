"use client";

import { useState } from "react";
import { 
  Home, 
  BarChart2, 
  Settings, 
  Target,
  LogOut,
  Star,
  MessageSquare,
  Menu,
  X,
  PieChart
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { FeedbackModal } from "./FeedbackModal";
import { DailySpectrumWidget } from "./DailySpectrumWidget";
import { User, DashboardAgenda } from "../types";
import { Logo } from "./Logo";

export function Sidebar({ 
  activeTab = "dashboard", 
  onTabChange,
  onLogout,
  user,
  agenda,
  isMobileOpen,
  setIsMobileOpen
}: { 
  activeTab?: string, 
  onTabChange: (tab: string) => void,
  onLogout: () => void,
  user?: User | null,
  agenda?: DashboardAgenda | null,
  onDateSelect?: (d: Date) => void,
  onSelectAnalytics?: (id: string) => void,
  logicalToday?: string,
  isMobileOpen: boolean,
  setIsMobileOpen: (open: boolean) => void
}) {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: "dashboard", icon: Home, label: "Dashboard" },
    { id: "habits", icon: Target, label: "Habits" },
    { id: "analytics", icon: BarChart2, label: "Analytics" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  const handleTabChange = (id: string) => {
    onTabChange(id);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-6 left-6 z-[60] md:hidden p-3 bg-white/80 backdrop-blur-xl border border-border rounded-2xl shadow-xl text-primary"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Backdrop for Mobile */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside 
        initial={false}
        animate={{ width: isMobileOpen ? "100%" : (isCollapsed ? 100 : 320) }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "fixed inset-y-0 left-0 h-screen sidebar-glass flex flex-col py-4 sm:py-8 px-3 sm:px-4 z-50 overflow-hidden transition-colors duration-300",
          isMobileOpen ? "translate-x-0 w-full" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-8 px-2 h-10 shrink-0">
          <div className="flex items-center gap-3">
            <Logo 
              className="cursor-pointer scale-90 sm:scale-100" 
              onClick={() => handleTabChange("dashboard")}
            />
            {isMobileOpen && <span className="font-black font-heading text-xl uppercase tracking-tight text-foreground">HabitBank</span>}
          </div>
          
          <button 
            onClick={() => isMobileOpen ? setIsMobileOpen(false) : setIsCollapsed(!isCollapsed)}
            className="p-2 sm:p-2.5 hover:bg-primary/10 rounded-xl text-muted-foreground hover:text-primary transition-all active:scale-90"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 mb-4 sm:mb-6 shrink-0 overflow-y-auto overflow-x-hidden pr-1 custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={cn(
                "w-full flex items-center rounded-xl sm:rounded-2xl transition-all group relative py-2.5 sm:py-3",
                activeTab === item.id 
                  ? "nav-item-active" 
                  : "hover:bg-primary/5 text-muted-foreground hover:text-foreground",
                isCollapsed && !isMobileOpen ? "justify-center px-0" : "px-3 sm:px-4 gap-3 sm:gap-4"
              )}
            >
              <item.icon className={cn(
                "w-4 h-4 sm:w-5 sm:h-5 shrink-0 transition-all", 
                activeTab === item.id ? "text-background" : "group-hover:scale-110",
                (isCollapsed && !isMobileOpen) && "w-6 h-6"
              )} />
              
              {(!isCollapsed || isMobileOpen) && (
                <span className="font-black text-[11px] sm:text-xs uppercase tracking-[0.2em]">
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Dynamic Spectrum Zone */}
        <div className={cn(
          "flex-1 min-h-0 flex flex-col border-t border-border/10 pt-4 sm:pt-6 mb-4 sm:mb-6 transition-all duration-500",
          isCollapsed && !isMobileOpen ? "opacity-0 invisible pointer-events-none" : "opacity-100 visible"
        )}>
          {user && agenda && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex items-center gap-2 px-2 mb-3 sm:mb-4 shrink-0">
                <PieChart className="w-3.5 h-3.5 text-primary" />
                <h4 className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-muted-foreground/60">Daily_Spectrum</h4>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden flex flex-col p-3 sm:p-5 bg-primary/5 rounded-[1.5rem] sm:rounded-[2.5rem] border border-primary/10 shadow-inner">
                <DailySpectrumWidget user={user} agenda={agenda} size="sm" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto border-t border-border/10 pt-4 sm:pt-6 space-y-0.5 sm:space-y-1 shrink-0">
          <a 
            href="https://github.com/hammaadworks/habit_bank" 
            target="_blank" 
            rel="noopener noreferrer"
            className={cn(
              "w-full flex items-center rounded-xl sm:rounded-2xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all group py-2.5 sm:py-3",
              isCollapsed && !isMobileOpen ? "justify-center px-0" : "px-3 sm:px-4 gap-3 sm:gap-4"
            )}
          >
            <Star className={cn("w-4 h-4 sm:w-5 sm:h-5 shrink-0 transition-transform group-hover:rotate-12", (isCollapsed && !isMobileOpen) && "w-6 h-6")} />
            {(!isCollapsed || isMobileOpen) && <span className="font-black text-[11px] uppercase tracking-widest">GitHub</span>}
          </a>

          <button 
            onClick={() => {
              setIsFeedbackOpen(true);
              setIsMobileOpen(false);
            }}
            className={cn(
              "w-full flex items-center rounded-xl sm:rounded-2xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all group py-2.5 sm:py-3",
              isCollapsed && !isMobileOpen ? "justify-center px-0" : "px-3 sm:px-4 gap-3 sm:gap-4"
            )}
          >
            <MessageSquare className={cn("w-4 h-4 sm:w-5 sm:h-5 shrink-0 transition-transform group-hover:scale-110", (isCollapsed && !isMobileOpen) && "w-6 h-6")} />
            {(!isCollapsed || isMobileOpen) && <span className="font-black text-[11px] uppercase tracking-widest">Feedback</span>}
          </button>

          <button 
            onClick={() => {
              onLogout();
              setIsMobileOpen(false);
            }}
            className={cn(
              "w-full flex items-center rounded-xl sm:rounded-2xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all group py-2.5 sm:py-3",
              isCollapsed && !isMobileOpen ? "justify-center px-0" : "px-3 sm:px-4 gap-3 sm:gap-4"
            )}
          >
            <LogOut className={cn("w-4 h-4 sm:w-5 sm:h-5 shrink-0 transition-transform group-hover:-translate-x-1", (isCollapsed && !isMobileOpen) && "w-6 h-6")} />
            {(!isCollapsed || isMobileOpen) && <span className="font-black text-[11px] uppercase tracking-widest">Logout</span>}
          </button>
        </div>

        <AnimatePresence>
          {isFeedbackOpen && (
            <FeedbackModal user={user || null} onClose={() => setIsFeedbackOpen(false)} />
          )}
        </AnimatePresence>
      </motion.aside>

      {/* Spacer for content when sidebar is fixed */}
      <div className="hidden md:block transition-all duration-500 shrink-0" style={{ width: isCollapsed ? 100 : 320 }} />
    </>
  );
}
