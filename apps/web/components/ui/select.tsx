import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

// Dung <select> nguyen ban thay vi Radix Select - don gian, khong them phu
// thuoc moi, va da co san kha nang tiep can + hoat dong tot tren mobile.
// Cao 46px, dong bo voi Input theo docs/QUY_TAC_GIAO_DIEN.md.
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, children, ...props }, ref) => {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "flex h-[46px] w-full appearance-none rounded-md border border-input bg-background px-3 pr-9 py-2 text-sm text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
});
Select.displayName = "Select";

export { Select };
