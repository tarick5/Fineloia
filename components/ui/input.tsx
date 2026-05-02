import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-full border border-[#d3e2fb] bg-[var(--white)] px-4 py-2 text-sm text-[#132f4a] ring-offset-background placeholder:text-[#6e8eb6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pink)]",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
