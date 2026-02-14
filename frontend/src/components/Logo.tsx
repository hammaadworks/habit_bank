"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ className, iconOnly = false, onClick }: { className?: string, iconOnly?: boolean, onClick?: () => void }) {
  return (
    <div 
      className={cn("flex items-center gap-3 select-none", onClick && "cursor-pointer", className)}
      onClick={onClick}
    >
      <div className="relative w-10 h-10 shrink-0 shadow-lg shadow-primary/20 rounded-2xl overflow-hidden border border-white/10">
        <Image 
          src="/logo.svg" 
          alt="Habit Bank Logo" 
          fill 
          priority
          className="object-cover"
        />
      </div>
      {!iconOnly && (
        <span className="text-2xl font-black font-heading tracking-tighter uppercase leading-none">
          Habit<span className="text-primary">Bank</span>
        </span>
      )}
    </div>
  );
}
