"use client";

import { motion } from "motion/react";
import { Logo } from "./Logo";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { UserSelector } from "./UserSelector";
import { Plus, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  activeUser: any;
  handleUserSelect: (user: any) => void;
  onOpenSidebar: () => void;
  onAddHabit: () => void;
}

export function Header({ 
  activeTab, 
  onTabChange, 
  activeUser, 
  handleUserSelect,
  onOpenSidebar,
  onAddHabit
}: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-[80] transition-all duration-500 pointer-events-none">
      <div className="mx-auto px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24 w-full">
        <div className="h-20 sm:h-24 bg-background/60 backdrop-blur-3xl rounded-b-[2.5rem] sm:rounded-b-[3.5rem] border-x border-b border-border/10 flex items-center justify-between px-4 sm:px-12 shadow-[0_8px_32px_rgba(0,0,0,0.04)] pointer-events-auto">
          <div className="flex items-center gap-3 sm:gap-10">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={onOpenSidebar}
              className="p-2.5 bg-primary/5 hover:bg-primary/10 rounded-2xl text-primary md:hidden transition-all border border-primary/10"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.button>
            
            <div className="hidden sm:flex flex-col space-y-1.5">
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-5"
              >
                <Logo className="scale-95 origin-left hover:opacity-80 transition-opacity cursor-pointer" onClick={() => onTabChange("dashboard")} />
                <div className="h-5 w-px bg-border/30" />
                <div className="px-3 py-1 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 rounded-full border border-emerald-500/20 text-[8px] font-black text-emerald-600 tracking-[0.2em] uppercase shrink-0 shadow-inner">STABLE_NODE</div>
              </motion.div>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-muted-foreground/60 text-[10px] tracking-[0.4em] font-black uppercase pl-1 leading-none font-heading flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" />
                SYSTEM_PRTCL: <span className="text-foreground">{activeTab.toUpperCase()}</span>
              </motion.p>
            </div>

            {/* Mobile simplified brand */}
            <div className="sm:hidden flex flex-col">
               <span className="text-sm font-black font-heading tracking-tighter uppercase leading-none">{activeTab}</span>
               <div className="flex items-center gap-1 mt-1">
                 <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[7px] font-black tracking-widest text-emerald-600 uppercase">Secure_Link</span>
               </div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-8">
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={onAddHabit}
              className="hidden sm:flex items-center gap-2.5 px-6 sm:px-8 py-2.5 sm:py-3 bg-foreground text-background rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-2xl shadow-foreground/10 hover:shadow-primary/20 hover:bg-primary transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
              Initialize_New
            </motion.button>
            
            <div className="flex items-center gap-2 sm:gap-6 border-l border-border/20 pl-3 sm:pl-8">
              <ThemeSwitcher />
              <div className="h-8 w-px bg-border/10 hidden sm:block" />
              <UserSelector onUserSelect={handleUserSelect} activeUser={activeUser} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
