"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface ComboboxProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function Combobox({ options, value, onChange, placeholder, className }: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const filteredOptions = useMemo(() => {
    if (!inputValue) return options;
    return options.filter(opt => opt.toLowerCase().includes(inputValue.toLowerCase()));
  }, [options, inputValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full bg-white/50 border border-border rounded-2xl px-6 py-4 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground"
        >
          <ChevronsUpDown className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence>
        {open && (filteredOptions.length > 0 || (inputValue && !options.includes(inputValue))) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-[110] w-full mt-2 bg-white border border-border rounded-2xl shadow-2xl max-h-60 overflow-y-auto"
          >
            <div className="p-2">
              {filteredOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setInputValue(opt);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 text-sm font-bold uppercase tracking-widest rounded-xl transition-all",
                    value === opt ? "bg-primary text-white" : "hover:bg-primary/10 text-foreground"
                  )}
                >
                  {opt}
                  {value === opt && <Check className="w-4 h-4" />}
                </button>
              ))}
              {inputValue && !options.includes(inputValue) && (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-3 text-xs font-black uppercase tracking-widest text-primary italic bg-primary/5 rounded-xl"
                >
                  Use "{inputValue}"
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
