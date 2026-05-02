import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "min-h-[120px] w-full rounded-2xl border border-[#d3e2fb] bg-[var(--white)] px-4 py-3 text-sm text-[#132f4a] ring-offset-background placeholder:text-[#6e8eb6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pink)]",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
