"use client";

import React from "react";
import { Check, Loader2 } from "lucide-react";
import { motion } from "motion/react";

interface WizardStep {
  title: string;
  description?: string;
  content: React.ReactNode;
  isValid?: boolean;
}

interface WizardProps {
  steps: WizardStep[];
  onComplete: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
}

export function Wizard({ 
  steps, 
  onComplete, 
  onCancel, 
  isSubmitting = false,
  submitLabel = "Finish",
  cancelLabel = "Cancel"
}: WizardProps) {
  const allValid = steps.every(s => s.isValid !== false);

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* All Steps Vertically Rendered */}
      <div className="flex flex-col gap-10">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight font-heading leading-tight text-foreground">{step.title}</h3>
              {step.description && (
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-[0.2em] border-l-2 border-primary pl-4">{step.description}</p>
              )}
            </div>
            <div className="py-2">
              {step.content}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-8 border-t border-border/50 sticky bottom-0 bg-card/90 backdrop-blur-xl p-4 -mx-4 sm:mx-0 sm:p-0 rounded-t-3xl sm:rounded-none">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 px-8 py-5 rounded-[1.25rem] text-sm font-black uppercase tracking-widest text-muted-foreground hover:bg-white/5 transition-all flex items-center justify-center disabled:opacity-50 active:scale-95"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onComplete}
          disabled={!allValid || isSubmitting}
          className="flex-[2] px-8 py-5 bg-primary text-primary-foreground rounded-[1.25rem] text-sm font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 font-heading"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{submitLabel} <Check className="w-5 h-5" /></>}
        </button>
      </div>
    </div>
  );
}
