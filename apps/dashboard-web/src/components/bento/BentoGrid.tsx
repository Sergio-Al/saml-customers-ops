import type { ReactNode } from "react";

interface BentoGridProps {
  children: ReactNode;
}

export function BentoGrid({ children }: BentoGridProps) {
  return (
    <div className="grid auto-rows-[80px] grid-cols-12 gap-2 lg:grid-cols-12 [@media(max-width:1024px)]:grid-cols-8 [@media(max-width:768px)]:grid-cols-4 [@media(max-width:640px)]:grid-cols-1">
      {children}
    </div>
  );
}
