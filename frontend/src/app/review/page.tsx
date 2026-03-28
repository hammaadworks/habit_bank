"use client";

import { useState } from "react";
import { 
  Star, 
  Send, 
  CheckCircle2, 
  ExternalLink,
  Layers, 
  ArrowLeft 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function ReviewPage() {
  const [form, setForm] = useState({
    author_name: "",
    author_title: "",
    content: "",
    rating: 5
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await fetchApi("/testimonials/", {
        method: "POST",
        body: JSON.stringify(form)
      });
      setStatus("success");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  const socials = [
    { name: "Twitter", icon: ExternalLink, url: "https://twitter.com/hammaadworks", color: "text-sky-500" },
    { name: "GitHub", icon: ExternalLink, url: "https://github.com/hammaadworks", color: "text-foreground" },
    { name: "YouTube", icon: ExternalLink, url: "https://youtube.com/@hammaadworks", color: "text-red-500" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 py-20 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6 text-background" />
            </div>
            <span className="text-xl font-black font-heading tracking-tighter uppercase">Habit_Bank</span>
          </Link>

          <div className="flex items-center gap-6">
            {socials.map((s) => (
              <a 
                key={s.name} 
                href={s.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className={cn("flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:opacity-70 transition-opacity", s.color)}
              >
                <s.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{s.name}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center pt-12">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-black font-heading uppercase tracking-tight leading-none">
                Leave your <br /> <span className="text-primary">Mark on the Ledger.</span>
              </h1>
              <p className="text-lg text-muted-foreground font-medium border-l-4 border-primary pl-8 italic">
                Your feedback helps us refine the protocol and inspire other identity-driven nodes.
              </p>
            </div>

            <div className="space-y-6 pt-8">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Dev_Socials</h3>
              <div className="flex flex-col gap-4">
                {socials.map((s) => (
                  <a 
                    key={s.name} 
                    href={s.url}
                    className="flex items-center justify-between p-6 bg-muted/30 border border-border rounded-3xl hover:bg-muted/50 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn("p-3 rounded-xl bg-background border border-border group-hover:scale-110 transition-transform", s.color)}>
                        <s.icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-black uppercase tracking-widest">{s.name}</span>
                    </div>
                    <ArrowLeft className="w-4 h-4 rotate-180 opacity-0 group-hover:opacity-100 transition-all" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-primary/10 rounded-[4rem] blur-3xl -z-10" />
            
            <AnimatePresence mode="wait">
              {status === "success" ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-card border border-border p-12 rounded-[3.5rem] shadow-2xl text-center space-y-8"
                >
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black uppercase font-heading tracking-tight">Review Secured</h2>
                    <p className="text-muted-foreground text-sm">Thank you for contributing to the wall of solvency. Your review will be visible after verification.</p>
                  </div>
                  <Link 
                    href="/"
                    className="block w-full py-5 bg-foreground text-background rounded-2xl text-xs font-black uppercase tracking-widest"
                  >
                    Return_to_Protocol
                  </Link>
                </motion.div>
              ) : (
                <motion.form 
                  key="form"
                  onSubmit={handleSubmit}
                  className="bg-card border border-border p-10 rounded-[3.5rem] shadow-2xl space-y-6"
                >
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Identity_Name</label>
                      <input 
                        type="text" placeholder="e.g. Satoshi Nakamoto" required
                        value={form.author_name}
                        onChange={e => setForm({...form, author_name: e.target.value})}
                        className="w-full p-4 bg-muted border border-border rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Identity_Role</label>
                      <input 
                        type="text" placeholder="e.g. Temporal Engineer @ FutureCorp" required
                        value={form.author_title}
                        onChange={e => setForm({...form, author_title: e.target.value})}
                        className="w-full p-4 bg-muted border border-border rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all"
                      />
                    </div>

                    <div className="grid gap-2">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Testimonial_Payload</label>
                      <textarea 
                        placeholder="How has Habit Bank changed your relationship with time?" required rows={4}
                        value={form.content}
                        onChange={e => setForm({...form, content: e.target.value})}
                        className="w-full p-4 bg-muted border border-border rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-6 pt-2">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Solvency_Rating</label>
                      <div className="flex gap-2">
                        {[1,2,3,4,5].map((v) => (
                          <button 
                            key={v}
                            type="button"
                            onClick={() => setForm({...form, rating: v})}
                            className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                              form.rating >= v ? "bg-primary text-background" : "bg-muted text-muted-foreground hover:bg-muted/80"
                            )}
                          >
                            <Star className={cn("w-4 h-4", form.rating >= v ? "fill-current" : "")} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full py-6 bg-primary text-background rounded-2xl text-sm font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
                  >
                    {status === "loading" ? "SYNCHRONIZING..." : (
                      <>
                        SUBMIT_TO_LEDGER
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
