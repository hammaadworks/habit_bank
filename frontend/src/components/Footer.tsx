"use client";

import { motion } from "motion/react";
import { ShieldCheck, Globe, Mail, MessageSquare, Quote } from "lucide-react";

const QUOTES = [
  { text: "Your identity is the sum of your consistent actions.", author: "System Protocol // V2.0" },
  { text: "Time is the only currency that cannot be printed.", author: "Temporal Ledger // Core" },
  { text: "Excellence is not an act, but a habit.", author: "Identity Throughput // V1.0" },
  { text: "Amortize your debt, master your future.", author: "Temporal Solvency // Active" },
  { text: "The system is the solution to the human condition.", author: "Architect // Node_01" }
];

export function Footer() {
  const currentYear = new Date().getFullYear();
  const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

  return (
    <div className="w-full space-y-16 sm:space-y-24 mt-20 sm:mt-32">
      {/* Inspirational / Technical Quote Section */}
      <section className="relative px-6 py-16 sm:py-28 text-center space-y-8 sm:space-y-12 overflow-hidden rounded-[3rem] sm:rounded-[5rem] border border-border/10">
        <div className="absolute inset-0 bg-primary/[0.01] backdrop-blur-3xl -z-10" />
        <div className="absolute top-10 left-10 opacity-[0.03] rotate-12">
          <Quote className="w-20 h-20 sm:w-32 sm:h-32 text-primary" />
        </div>
        
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-10 relative px-4">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            className="text-2xl sm:text-4xl md:text-5xl font-black font-heading tracking-tight text-foreground leading-[1.1] sm:leading-[1.1]"
          >
            "{quote.text}"
          </motion.p>
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-4 sm:gap-6 text-primary/60 text-[10px] sm:text-xs font-black uppercase tracking-[0.5em]"
          >
            <div className="h-px w-6 sm:w-12 bg-gradient-to-r from-transparent to-primary/20" />
            <span className="whitespace-nowrap">{quote.author}</span>
            <div className="h-px w-6 sm:w-12 bg-gradient-to-l from-transparent to-primary/20" />
          </motion.div>
        </div>
      </section>

      {/* Small, Professional Footer */}
      <footer className="pb-10 sm:pb-16 px-4 sm:px-8">
        <div className="pt-10 sm:pt-16 border-t border-border/10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex flex-col items-center md:items-start gap-3">
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/40 font-mono">
              &copy; {currentYear} Habit_Bank_Organization // All_Rights_Reserved
            </p>
            <div className="flex items-center gap-5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">
              <span className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5" /> Secure_Protocol_v2.0.4</span>
              <div className="w-1 h-1 rounded-full bg-border/20" />
              <span className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Operational_Node
              </span>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <a href="#" className="p-2.5 sm:p-3 bg-primary/[0.03] hover:bg-primary/10 rounded-xl text-muted-foreground hover:text-primary transition-all active:scale-90 border border-border/5">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
            <a href="#" className="p-2.5 sm:p-3 bg-primary/[0.03] hover:bg-primary/10 rounded-xl text-muted-foreground hover:text-primary transition-all active:scale-90 border border-border/5">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
            <a href="#" className="p-2.5 sm:p-3 bg-primary/[0.03] hover:bg-primary/10 rounded-xl text-muted-foreground hover:text-primary transition-all active:scale-90 border border-border/5">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
          </div>

          <div className="flex flex-col items-center md:items-end gap-1.5 text-right">
            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 font-mono">Build: 2026.04.11_STABLE</p>
            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/20">Temporal_Identity_Ledger</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
