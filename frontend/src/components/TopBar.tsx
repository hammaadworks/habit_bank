"use client";

import { 
  Search, 
  Bell, 
  ChevronDown,
  Calendar as CalendarIcon
} from "lucide-react";
import { format } from "date-fns";
import { User } from "@/types";
import { motion } from "motion/react";

export function TopBar({ user }: { user: User }) {
  const today = new Date();

  return (
    <header className="h-24 px-8 md:px-12 flex items-center justify-between sticky top-0 bg-background/50 backdrop-blur-md z-40">
      <div className="flex items-center gap-12 flex-1">
        <div className="hidden lg:flex items-center gap-3 text-muted-foreground group cursor-pointer">
          <CalendarIcon className="w-5 h-5 group-hover:text-primary transition-colors" />
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-widest leading-none mb-1">Current Date</span>
            <span className="text-sm font-bold text-foreground leading-none">{format(today, "EEEE, MMMM do")}</span>
          </div>
        </div>

        <div className="relative flex-1 max-w-md hidden md:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            placeholder="Search habits, logs, analytics..." 
            className="w-full bg-white/50 border border-border rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-3 bg-white/50 border border-border rounded-2xl hover:bg-white transition-all group">
          <Bell className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="absolute top-3 right-3 w-2 h-2 bg-accent rounded-full border-2 border-white" />
        </button>

        <div className="flex items-center gap-4 pl-6 border-l border-border group cursor-pointer">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-xs font-bold uppercase tracking-widest text-primary leading-none mb-1">Active Profile</span>
            <span className="text-sm font-bold text-foreground leading-none">{user.username}</span>
          </div>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent p-0.5"
          >
            <div className="w-full h-full rounded-[0.875rem] bg-white flex items-center justify-center overflow-hidden">
              {/* Placeholder Avatar - in a real app we'd use user.avatar_url */}
              <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-black text-lg font-heading">
                {user.username.substring(0, 2).toUpperCase()}
              </div>
            </div>
          </motion.div>
          <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
    </header>
  );
}
