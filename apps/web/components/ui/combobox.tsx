"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn, boDauTiengViet } from "@/lib/utils";

export interface TuyChonCombobox {
  value: string;
  label: string;
  /** Dong phu nho hon hien ben canh label, vd chuc vu cua can bo. */
  moTa?: string;
}

/**
 * O chon co go tim kiem - thay cho <select> thuong khi danh sach dai (vd
 * chon Can bo trong toan cong ty), keo chuot tim tung dong se lau. Loc gan
 * dung, bo dau tieng Viet, khong phu thuoc thu vien ngoai (khong co
 * @radix-ui/react-popover trong du an).
 */
export function Combobox({
  id,
  options,
  value,
  onChange,
  placeholder = "-- Chọn --",
  searchPlaceholder = "Gõ để tìm...",
  emptyText = "Không tìm thấy kết quả.",
  disabled,
  ariaInvalid,
}: {
  id?: string;
  options: TuyChonCombobox[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  ariaInvalid?: boolean;
}) {
  const [mo, setMo] = useState(false);
  const [tuKhoa, setTuKhoa] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const daChon = options.find((o) => o.value === value);
  const tuKhoaKhongDau = boDauTiengViet(tuKhoa);
  const ketQuaLoc = tuKhoaKhongDau
    ? options.filter((o) => boDauTiengViet(`${o.label} ${o.moTa ?? ""}`).includes(tuKhoaKhongDau))
    : options;

  useEffect(() => {
    if (!mo) return;
    function xuLyClickNgoai(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setMo(false);
        setTuKhoa("");
      }
    }
    document.addEventListener("mousedown", xuLyClickNgoai);
    return () => document.removeEventListener("mousedown", xuLyClickNgoai);
  }, [mo]);

  useEffect(() => {
    if (mo) inputRef.current?.focus();
  }, [mo]);

  return (
    <div ref={containerRef} className="relative">
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-invalid={ariaInvalid}
        aria-haspopup="listbox"
        aria-expanded={mo}
        onClick={() => setMo((m) => !m)}
        className={cn(
          "flex h-[46px] w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-left text-sm text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          ariaInvalid && "border-destructive",
        )}
      >
        <span className={cn("truncate", !daChon && "text-muted-foreground")}>
          {daChon ? (
            <>
              {daChon.label}
              {daChon.moTa && <span className="text-muted-foreground"> — {daChon.moTa}</span>}
            </>
          ) : (
            placeholder
          )}
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
      </button>

      {mo && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-background shadow-lg">
          <div className="border-b border-border p-2">
            <input
              ref={inputRef}
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setMo(false);
                  setTuKhoa("");
                }
              }}
              placeholder={searchPlaceholder}
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <ul className="max-h-60 overflow-auto p-1" role="listbox">
            {ketQuaLoc.length === 0 && (
              <li className="px-3 py-2 text-sm text-muted-foreground">{emptyText}</li>
            )}
            {ketQuaLoc.map((o) => (
              <li key={o.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={o.value === value}
                  onClick={() => {
                    onChange(o.value);
                    setMo(false);
                    setTuKhoa("");
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-muted",
                    o.value === value && "bg-muted",
                  )}
                >
                  <span>
                    {o.label}
                    {o.moTa && <span className="ml-1.5 text-xs text-muted-foreground">{o.moTa}</span>}
                  </span>
                  {o.value === value && <Check className="size-4 shrink-0 text-primary" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
