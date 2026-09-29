"use client";

import { useInView } from "@/hooks/useInView";

export default function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, isInView } = useInView({ threshold: 0.1, rootMargin: "0px 0px -60px 0px" });

  return (
    <div
      ref={ref as any}
      className={`transition-all duration-700 ease-out ${
        isInView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
