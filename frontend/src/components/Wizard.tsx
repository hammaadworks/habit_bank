"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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
  nextLabel?: string;
  backLabel?: string;
  cancelLabel?: string;
  minHeight?: string;
}

export function Wizard({ 
  steps, 
  onComplete, 
  onCancel, 
  isSubmitting = false,
  submitLabel = "Finish",
  nextLabel = "Next",
  backLabel = "Back",
  cancelLabel = "Cancel",
  minHeight = "350px"
}: WizardProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (isFirstStep) {
      onCancel();
    } else {
      setCurrentStep(prev => prev - 1);
    }
  };

  const step = steps[currentStep];

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Progress Bar */}
      {steps.length > 1 && (
        <div className="flex justify-between items-center mb-6 sm:mb-10">
          <div className="flex gap-1.5 sm:gap-3">
            {steps.map((_, index) => (
              <div 
                key={index} 
                className={`h-1 sm:h-1.5 w-8 sm:w-16 rounded-full transition-all duration-500 ${index <= currentStep ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-black/5'}`}
              />
            ))}
          </div>
          <span className="text-[10px] sm:text-sm font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-primary font-heading">
            {currentStep + 1}/{steps.length}
          </span>
        </div>
      )}

      {/* Step Content */}
      <div className="flex flex-col" style={{ minHeight: window?.innerWidth < 640 ? "auto" : minHeight }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 sm:space-y-8 flex-1"
          >
            <div className="space-y-1 sm:space-y-2">
              <h3 className="text-2xl sm:text-4xl font-black uppercase tracking-tight font-heading leading-tight text-foreground">{step.title}</h3>
              {step.description && (
                <p className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-[0.2em] sm:tracking-[0.4em] border-l-2 border-primary pl-3 sm:pl-4">{step.description}</p>
              )}
            </div>
            
            <div className="py-1 sm:py-2">
              {step.content}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 sm:gap-4 pt-4 sm:pt-8 border-t border-black/5">
        <button
          type="button"
          onClick={handleBack}
          disabled={isSubmitting}
          className="flex-1 px-4 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-[1.25rem] text-xs sm:text-sm font-bold uppercase tracking-widest text-muted-foreground hover:bg-black/5 transition-all flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-50 active:scale-95"
        >
          <ChevronLeft className="w-3.5 h-3.5 sm:w-4 h-4" /> {isFirstStep ? cancelLabel : "Back"}
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={step.isValid === false || isSubmitting}
          className="flex-[2] px-4 sm:px-8 py-3 sm:py-4 bg-primary text-white rounded-xl sm:rounded-[1.25rem] text-xs sm:text-sm font-bold uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2 sm:gap-3 shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 font-heading"
        >
          {isLastStep ? (
            <>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{submitLabel} <Check className="w-3.5 h-3.5 sm:w-4 h-4" /></>}
            </>
          ) : (
            <>
              Next <ChevronRight className="w-3.5 h-3.5 sm:w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
