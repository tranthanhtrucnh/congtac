"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input, type InputProps } from "./input";

const PasswordInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    const [hienThi, setHienThi] = React.useState(false);

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={hienThi ? "text" : "password"}
          className={cn("pr-10", className)}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setHienThi((truoc) => !truoc)}
          aria-label={hienThi ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          className="absolute right-0 top-0 flex h-[46px] w-[46px] items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
        >
          {hienThi ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
