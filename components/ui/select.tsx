import * as React from "react";
import { cn } from "@/lib/utils";

type SelectProps = React.ComponentProps<"select">;

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-full border border-[#d3e2fb] bg-[var(--white)] px-3 py-2 text-sm text-[#132f4a] outline-none focus-visible:ring-2 focus-visible:ring-[var(--pink)]",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
