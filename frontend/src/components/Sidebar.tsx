"use client";

import { useState } from "react";
import { 
  Home, 
  Settings, 
  LogOut,
  Star,
  MessageSquare,
  Menu,
  X,
  LineChart,
  Bot
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { FeedbackModal } from "./FeedbackModal";
import { User, DashboardAgenda } from "../types";
import { Logo } from "./Logo";
import { DailySpectrumWidget } from "./DailySpectrumWidget";

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
    { id: "analytics", icon: LineChart, label: "Analytics" },
    { id: "assistant", icon: Bot, label: "AI Assistant" },
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
        className="fixed top-6 left-6 z-[60] md:hidden p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl text-primary"
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
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside 
        initial={false}
        animate={{ width: isMobileOpen ? "100%" : (isCollapsed ? 100 : 320) }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "fixed inset-y-0 left-0 h-screen sidebar-glass flex flex-col py-4 sm:py-8 px-3 sm:px-4 z-50 overflow-hidden transition-colors duration-300 border-r border-border",
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
        <nav className="space-y-2 mb-4 sm:mb-6 flex-1 overflow-y-auto overflow-x-hidden pr-1 custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={cn(
                "w-full flex items-center rounded-xl sm:rounded-2xl transition-all group relative py-3 sm:py-4",
                activeTab === item.id 
                  ? "nav-item-active shadow-lg shadow-primary/10" 
                  : "hover:bg-primary/5 text-muted-foreground hover:text-foreground",
                isCollapsed && !isMobileOpen ? "justify-center px-0" : "px-3 sm:px-5 gap-3 sm:gap-4"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 sm:w-6 sm:h-6 shrink-0 transition-all", 
                activeTab === item.id ? "text-background" : "group-hover:scale-110 group-hover:text-primary",
                (isCollapsed && !isMobileOpen) && "w-7 h-7"
              )} />
              
              {(!isCollapsed || isMobileOpen) && (
                <span className="font-black text-xs sm:text-sm uppercase tracking-widest">
                  {item.label}
                </span>
              )}
            </button>
          ))}
          
          {(!isCollapsed || isMobileOpen) && user && agenda && (
            <div className="mt-8 mb-4 px-2">
              <DailySpectrumWidget user={user} agenda={agenda} size="sm" />
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="mt-auto border-t border-border/50 pt-4 sm:pt-6 space-y-2 shrink-0">
          <a 
            href="https://github.com/hammaadworks/habit_bank" 
            target="_blank" 
            rel="noopener noreferrer"
            className={cn(
              "w-full flex items-center rounded-xl sm:rounded-2xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all group py-3 sm:py-4",
              isCollapsed && !isMobileOpen ? "justify-center px-0" : "px-3 sm:px-5 gap-3 sm:gap-4"
            )}
          >
            <Star className={cn("w-5 h-5 sm:w-6 sm:h-6 shrink-0 transition-transform group-hover:rotate-12", (isCollapsed && !isMobileOpen) && "w-7 h-7")} />
            {(!isCollapsed || isMobileOpen) && <span className="font-black text-xs sm:text-sm uppercase tracking-widest">GitHub</span>}
          </a>

          <button 
            onClick={() => {
              setIsFeedbackOpen(true);
              setIsMobileOpen(false);
            }}
            className={cn(
              "w-full flex items-center rounded-xl sm:rounded-2xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all group py-3 sm:py-4",
              isCollapsed && !isMobileOpen ? "justify-center px-0" : "px-3 sm:px-5 gap-3 sm:gap-4"
            )}
          >
            <MessageSquare className={cn("w-5 h-5 sm:w-6 sm:h-6 shrink-0 transition-transform group-hover:scale-110", (isCollapsed && !isMobileOpen) && "w-7 h-7")} />
            {(!isCollapsed || isMobileOpen) && <span className="font-black text-xs sm:text-sm uppercase tracking-widest">Feedback</span>}
          </button>

          <button 
            onClick={() => {
              onLogout();
              setIsMobileOpen(false);
            }}
            className={cn(
              "w-full flex items-center rounded-xl sm:rounded-2xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all group py-3 sm:py-4",
              isCollapsed && !isMobileOpen ? "justify-center px-0" : "px-3 sm:px-5 gap-3 sm:gap-4"
            )}
          >
            <LogOut className={cn("w-5 h-5 sm:w-6 sm:h-6 shrink-0 transition-transform group-hover:-translate-x-1", (isCollapsed && !isMobileOpen) && "w-7 h-7")} />
            {(!isCollapsed || isMobileOpen) && <span className="font-black text-xs sm:text-sm uppercase tracking-widest">Logout</span>}
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
