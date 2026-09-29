"use client";

export default function Skeleton({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-[#fbf7f2] ${className}`}
      {...props}
    />
  );
}
