"use client";

import { useState, useEffect } from "react";
import { 
  Zap, 
  Target, 
  TrendingUp, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  BarChart3,
  Layers,
  ChevronRight,
  Star,
  Users,
  LineChart,
  Wallet
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { cn } from "@/lib/utils";

// --- Components ---

function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 md:px-12 backdrop-blur-md bg-background/60 border-b border-border">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
          <Layers className="w-6 h-6 text-background" />
        </div>
        <span className="text-xl font-black font-heading tracking-tighter uppercase">Habit_Bank</span>
      </div>
      <div className="hidden md:flex items-center gap-8 text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">
        <a href="#features" className="hover:text-primary transition-colors">Protocol</a>
        <a href="#calculator" className="hover:text-primary transition-colors">ROI_Calc</a>
        <a href="#pricing" className="hover:text-primary transition-colors">Nodes</a>
      </div>
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard" 
          className="px-6 py-3 bg-foreground text-background rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-foreground/10"
        >
          Access_Terminal
        </Link>
      </div>
    </nav>
  );
}

function Hero() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [waitlistCount, setWaitlistCount] = useState(1240);

  useEffect(() => {
    fetchApi("/waitlist/count")
      .then(data => setWaitlistCount(1240 + (data.count || 0)))
      .catch(() => {});
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      await fetchApi("/waitlist/signup", {
        method: "POST",
        body: JSON.stringify({ email })
      });
      setStatus("success");
      setEmail("");
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <section className="relative pt-40 pb-20 px-6 md:px-12 flex flex-col items-center text-center overflow-hidden min-h-screen justify-center">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10 animate-pulse" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 max-w-4xl"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-xs font-black text-primary uppercase tracking-[0.2em] mb-4">
          <Zap className="w-3 h-3 animate-pulse" />
          Protocol_V2.0_Live
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black font-heading tracking-tight leading-[0.9] uppercase text-foreground">
          Bankrupt your <span className="text-primary">habits.</span> <br /> Master your <span className="opacity-50">time.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed border-l-4 border-primary pl-8 text-left italic">
          Stop tracking streaks. Start managing your temporal debt. Habit Bank is the world&apos;s first financial ledger for your identity.
        </p>

        <form onSubmit={handleSignup} className="flex flex-col md:flex-row items-center gap-4 pt-8 max-w-xl mx-auto">
          <div className="relative w-full">
            <input 
              type="email" 
              placeholder="ENTER_IDENTITY_EMAIL"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-8 py-5 bg-card border-2 border-border/40 rounded-2xl font-mono text-sm focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60 text-foreground font-black"
              required
            />
            <AnimatePresence>
              {status === "success" && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-black text-xs uppercase tracking-widest z-10"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  IDENTITY_SECURED
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button 
            type="submit"
            disabled={status === "loading"}
            className="w-full md:w-auto px-10 py-5 bg-primary text-background rounded-2xl font-black text-sm uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 shrink-0"
          >
            {status === "loading" ? "SYNCHRONIZING..." : (
              <>
                JOIN_WAITLIST
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
        
        <div className="inline-flex flex-col md:flex-row items-center gap-4 pt-12">
          <Link 
            href="/dashboard" 
            className="w-full md:w-auto px-10 py-5 bg-foreground text-background rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3"
          >
            ENTER_THE_BANK
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a 
            href="https://www.youtube.com/watch?v=dTBmzfqOz_U&list=PLakFdD-pYBdzU5o4QDx40LGmP4a78YzXb&index=1"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto px-10 py-5 bg-red-600/10 text-red-600 border border-red-600/20 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-3"
          >
            WATCH_LIVE_BUILD
            <Zap className="w-4 h-4 fill-current" />
          </a>
        </div>
      </motion.div>
    </section>
  );
}

function TimeLossCalculator() {
  const [dailyGoal, setDailyGoal] = useState(60); // minutes
  const [missRate, setMissRate] = useState(2); // days per week
  
  const weeklyLoss = dailyGoal * missRate;
  const yearlyLoss = weeklyLoss * 52;
  const decadeLoss = yearlyLoss * 10;
  
  // Convert minutes to hours
  const hoursLost = (decadeLoss / 60).toFixed(0);
  const daysLost = (decadeLoss / (60 * 24)).toFixed(0);

  return (
    <section id="calculator" className="py-24 px-6 md:px-12 bg-card/50 border-y border-border">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-black font-heading uppercase tracking-tight">The Cost of <span className="text-destructive">Insolvency</span></h2>
            <p className="text-muted-foreground font-medium border-l-2 border-border pl-6">
              Streak trackers lie to you. Every missed day is a withdrawal from your future identity. See exactly how much time you&apos;re losing to the void.
            </p>
          </div>

          <div className="space-y-12 bg-background p-10 rounded-[3rem] border border-border shadow-inner">
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Daily_Habit_Goal (Mins)</label>
                <span className="text-2xl font-black font-heading text-primary">{dailyGoal}m</span>
              </div>
              <input 
                type="range" min="5" max="300" step="5" value={dailyGoal} 
                onChange={(e) => setDailyGoal(parseInt(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Miss_Rate (Days/Week)</label>
                <span className="text-2xl font-black font-heading text-destructive">{missRate}d</span>
              </div>
              <input 
                type="range" min="1" max="7" value={missRate} 
                onChange={(e) => setMissRate(parseInt(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-destructive"
              />
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-destructive/20 rounded-[4rem] blur-2xl group-hover:opacity-100 opacity-50 transition-opacity" />
          <div className="relative p-12 bg-card border border-border rounded-[3.5rem] shadow-2xl space-y-10 text-center">
            <div className="space-y-2">
              <p className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground">10_Year_Projection</p>
              <h3 className="text-7xl font-black font-heading tracking-tighter text-destructive">-{hoursLost}h</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-8 py-8 border-y border-border/50">
              <div>
                <p className="text-xxs font-black uppercase tracking-widest text-muted-foreground mb-1">Total_Days_Lost</p>
                <p className="text-3xl font-black font-heading">{daysLost} Days</p>
              </div>
              <div>
                <p className="text-xxs font-black uppercase tracking-widest text-muted-foreground mb-1">Temporal_Deficit</p>
                <p className="text-3xl font-black font-heading text-orange-500">Critical</p>
              </div>
            </div>

            <button className="w-full py-6 bg-foreground text-background rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
              STOP_THE_BLEEDING
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Comparison() {
  const points = [
    { label: "Missing a Day", old: "Resets Streak to Zero", new: "Accrues Time Debt (Payable)" },
    { label: "Doing Extra", old: "No reward", new: "Banks Future Buffer" },
    { label: "Prioritization", old: "Random / Alphabetical", new: "Dynamic Debt Sorting" },
    { label: "Metrics", old: "Binary Yes/No", new: "Universal Time Ledger" },
    { label: "Psychology", old: "Fear of failure", new: "Financial Discipline" },
  ];

  return (
    <section className="py-32 px-6 md:px-12 max-w-6xl mx-auto space-y-20">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black font-heading uppercase tracking-tight">The New <span className="text-primary">Standard.</span></h2>
        <p className="text-xs font-black uppercase tracking-[0.5em] text-muted-foreground">SOLVENT vs. BANKRUPT</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="hidden md:block" /> {/* Spacer */}
        <div className="p-6 text-center text-xs font-black uppercase tracking-[0.3em] text-muted-foreground opacity-50">Legacy_Trackers</div>
        <div className="p-6 text-center text-xs font-black uppercase tracking-[0.3em] text-primary">Habit_Bank_Pro</div>
        
        {points.map((p, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="contents group"
          >
            <div className="p-8 border-b border-border font-black text-sm uppercase tracking-widest flex items-center">{p.label}</div>
            <div className="p-8 border-b border-border bg-muted/20 text-muted-foreground text-sm font-medium flex items-center justify-center text-center">{p.old}</div>
            <div className="p-8 border-b border-border bg-primary/5 text-foreground font-bold text-sm flex items-center justify-center text-center border-x border-primary/20">{p.new}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  const [testimonials, setTestimonials] = useState<any[]>([]);

  useEffect(() => {
    fetchApi("/testimonials")
      .then(setTestimonials)
      .catch(() => {});
  }, []);

  const display = testimonials.length > 0 ? testimonials : [
    { author_name: "Sarah Chen", author_title: "System Architect", content: "Habit Bank fixed my relationship with productivity. I no longer fear missing a day because I can pay it back.", rating: 5 },
    { author_name: "Marcus Thorne", author_title: "Founder @ PeakFlow", content: "The only tracker that respects the laws of physics. Time is currency, and this is the best wallet for it.", rating: 5 },
    { author_name: "Elena Rodriguez", author_title: "Product Designer", content: "The level of detail in the temporal ledger is insane. It's like having a financial auditor for your daily routine.", rating: 5 }
  ];

  return (
    <section className="py-40 bg-[#020617] text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-24">
        <div className="flex flex-col md:flex-row items-end justify-between gap-12 border-b border-white/10 pb-16">
          <div className="space-y-6">
            <p className="text-sm font-black uppercase tracking-[0.5em] text-primary">Identity_Verification</p>
            <h2 className="text-6xl md:text-7xl font-black font-heading uppercase tracking-tight leading-[0.8]">The Wall of <br /> <span className="text-white/40">Solvency.</span></h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex -space-x-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-12 h-12 rounded-full border-4 border-[#020617] bg-primary/20 flex items-center justify-center font-black text-xs">HB</div>
              ))}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-primary">
                <Star className="w-5 h-5 fill-current" />
                <span className="text-3xl font-black font-heading">4.9/5</span>
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-white/40">Trusted by 2,000+ Identities</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {display.map((t, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="p-12 bg-white/5 border border-white/10 rounded-[3rem] space-y-10 flex flex-col h-full hover:bg-white/[0.08] transition-all group"
            >
              <div className="flex gap-1.5 text-primary">
                {Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="w-5 h-5 fill-current" />)}
              </div>
              <p className="text-2xl font-medium leading-relaxed italic grow text-white/90">&quot;{t.content}&quot;</p>
              <div className="flex items-center gap-6 pt-10 border-t border-white/10">
                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center font-black text-background uppercase text-xs shadow-lg shadow-primary/20">
                  {t.author_name[0]}{t.author_name.split(' ')[1]?.[0]}
                </div>
                <div>
                  <p className="font-black uppercase tracking-widest text-[13px]">{t.author_name}</p>
                  <p className="text-xs font-black opacity-40 uppercase tracking-tighter mt-1">{t.author_title}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const tiers = [
    {
      name: "FREE_NODE",
      price: "$0",
      features: ["3 Active Habits", "Standard Ledger", "Basic Analytics"],
      cta: "INITIALIZE",
      popular: false
    },
    {
      name: "IDENTITY_PRO",
      price: "$12",
      features: ["Unlimited Habits", "Time Travel Engine", "Deep Logging Access", "Priority Queue"],
      cta: "ASCEND_NOW",
      popular: true
    },
    {
      name: "ENTERPRISE",
      price: "CUSTOM",
      features: ["API Access", "Biometric Sync", "Dedicated Auditor", "Team Analytics"],
      cta: "CONTACT_SYSTEM",
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-32 px-6 md:px-12 max-w-7xl mx-auto space-y-20">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black font-heading uppercase tracking-tight">Access <span className="text-primary">Tiers.</span></h2>
        <p className="text-xs font-black uppercase tracking-[0.5em] text-muted-foreground">SELECT_YOUR_CAPACITY</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-7xl mx-auto">
        {tiers.map((t, i) => (
          <div 
            key={i}
            className={cn(
              "p-12 md:p-14 rounded-[3.5rem] border-2 flex flex-col gap-12 transition-all hover:scale-[1.03] group",
              t.popular 
                ? "bg-primary/5 border-primary shadow-2xl shadow-primary/20 relative" 
                : "bg-card border-border/40 shadow-xl shadow-black/5"
            )}
          >
            {t.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-background px-8 py-3 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/30">
                MOST_SOLVENT_NODE
              </div>
            )}
            <div className="space-y-6">
              <p className={cn(
                "text-sm font-black uppercase tracking-[0.4em]",
                t.popular ? "text-primary" : "text-muted-foreground/60"
              )}>{t.name}</p>
              <div className="flex items-baseline gap-3">
                <span className="text-7xl font-black font-heading tracking-tighter text-foreground">{t.price}</span>
                {t.price !== "CUSTOM" && <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">/ NODE_CYCLE</span>}
              </div>
            </div>
            <ul className="space-y-6 grow border-t-2 border-border/10 pt-10">
              {t.features.map((f, j) => (
                <li key={j} className="flex items-start gap-4 text-sm font-black uppercase tracking-tight text-foreground/80">
                  <div className="mt-0.5 p-1 bg-primary/10 rounded-lg text-primary">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>
            <button className={cn(
              "w-full py-6 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl",
              t.popular 
                ? "bg-primary text-background hover:brightness-110 shadow-primary/20" 
                : "bg-foreground text-background hover:bg-primary transition-colors"
            )}>
              {t.cta}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-20 px-6 md:px-12 border-t border-border bg-card/30">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/20 rounded-xl flex items-center justify-center">
              <Layers className="w-5 h-5 text-primary" />
            </div>
            <span className="text-lg font-black font-heading tracking-tighter uppercase">Habit_Bank</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs font-medium">
            Building the next generation of temporal asset management. Your time is your most valuable capital.
          </p>
        </div>
        <div className="space-y-6">
          <h4 className="text-xs font-black uppercase tracking-widest">Protocol</h4>
          <ul className="space-y-4 text-sm font-bold text-muted-foreground">
            <li><a href="#" className="hover:text-primary transition-colors">Ledger_Engine</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Waterfall_Allocation</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">API_Docs</a></li>
          </ul>
        </div>
        <div className="space-y-6">
          <h4 className="text-xs font-black uppercase tracking-widest">Social</h4>
          <ul className="space-y-4 text-sm font-bold text-muted-foreground">
            <li><a href="#" className="hover:text-primary transition-colors">X / Twitter</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">GitHub</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">YouTube_Live</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto pt-20 flex flex-col md:flex-row justify-between gap-8 text-xxs font-black text-muted-foreground uppercase tracking-widest">
        <p>© 2026 HABIT_BANK_OPERATIONS // ALL_RIGHTS_RESERVED</p>
        <div className="flex gap-8">
          <a href="#">Privacy_Policy</a>
          <a href="#">Terms_of_Service</a>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground selection:bg-primary/30">
      <Nav />
      <Hero />
      <TimeLossCalculator />
      <Comparison />
      <Testimonials />
      <Pricing />
      <Footer />
    </div>
  );
}
