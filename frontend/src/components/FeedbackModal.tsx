"use client";

import { useState } from "react";
import { MessageSquare, X, Send, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { fetchApi } from "@/lib/api";
import { User } from "@/types";
import { cn } from "@/lib/utils";

export function FeedbackModal({ 
  user, 
  onClose 
}: { 
  user: User | null, 
  onClose: () => void 
}) {
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;
    
    setStatus("loading");
    try {
      await fetchApi("/feedback/", {
        method: "POST",
        body: JSON.stringify({
          user_id: user?.id,
          content
        })
      });
      setStatus("success");
      setTimeout(onClose, 2000);
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-lg bg-card border border-border p-8 rounded-[2.5rem] shadow-2xl relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase font-heading tracking-tight">Direct Feedback</h2>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Help us improve the protocol</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-12 flex flex-col items-center gap-4 text-center"
              >
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase font-heading">Transmission Received</h3>
                  <p className="text-sm text-muted-foreground">Your feedback has been logged in the system.</p>
                </div>
              </motion.div>
            ) : (
              <motion.form 
                key="form"
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Identity_Payload</label>
                  <textarea 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Describe your issue, feature request, or general feedback..."
                    className="w-full min-h-[150px] p-6 bg-muted/50 border border-border rounded-3xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-4 bg-muted text-muted-foreground rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-muted/80 transition-all"
                  >
                    ABORT
                  </button>
                  <button 
                    type="submit"
                    disabled={status === "loading"}
                    className="flex-[2] py-4 bg-primary text-background rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {status === "loading" ? "TRANSMITTING..." : (
                      <>
                        <Send className="w-4 h-4" />
                        SEND_FEEDBACK
                      </>
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
