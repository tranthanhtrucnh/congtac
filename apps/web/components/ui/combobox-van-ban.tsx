"use client";

import { useEffect, useRef, useState } from "react";
import { cn, boDauTiengViet } from "@/lib/utils";

export interface GoiYVanBan {
  /** Gia tri se dien vao o nhap khi chon goi y nay. */
  value: string;
  /** Dong phu nho hien canh goi y (vd cac ten tat) - chi de tim/hien thi. */
  phu?: string;
}

/**
 * O nhap van ban tu do co goi y - khac Combobox (khong bat buoc chon tu
 * danh sach, ai cung go duoc gia tri chua co trong goi y). Dung cho
 * Noi di/Noi den cua LDX: tham chieu Danh muc Dia diem de goi y nhanh,
 * nhung cho go tu do neu dia diem chua co trong danh muc.
 */
export function ComboboxVanBan({
  id,
  value,
  onChange,
  goiY,
  placeholder,
  disabled,
  ariaInvalid,
  choPhepNhieu,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  goiY: GoiYVanBan[];
  placeholder?: string;
  disabled?: boolean;
  ariaInvalid?: boolean;
  /** true = bam chon 1 goi y se NOI THEM vao cuoi gia tri dang co (cach nhau
   * ", "), thay vi THAY THE toan bo nhu mac dinh - dung cho truong hop can
   * ghi nhieu dia diem trong 1 cau (vd "Nơi đến" cua LDCT khi doan di nhieu
   * tinh cung luc). Mac dinh false (giu nguyen hanh vi thay the, dung cho
   * moi noi da dung ComboboxVanBan tu truoc - vd Noi di/Noi den cua LDX,
   * thuong chi 1 diem duy nhat) - CHI bat rieng o noi thuc su can ghep nhieu.
   * Ly do them (2026-08-10): nguoi dung phat hien du lieu "Nơi đến" cua LDCT
   * khong nhat quan qua tung lan lap (khi go tay, luc day du luc viet tat) -
   * vi bam chon goi y truoc day XOA SACH text dang go de thay the toan bo,
   * nen voi cau co NHIEU dia diem nguoi dung buoc phai go tay HOAN TOAN
   * (khong dung duoc goi y cho tu dia diem thu 2 tro di), day chinh la
   * nguyen nhan khien dinh dang troi day theo tung lan. Che do noi them nay
   * giup goi y dung duoc CHO CA CHUOI NHIEU dia diem, moi lan chon deu chen
   * dung 1 dinh dang co dinh (nguyen ten day du trong Danh muc, khong tu
   * them phan viet tat). Xem NHAT_KY_QUYET_DINH.md. */
  choPhepNhieu?: boolean;
}) {
  const [mo, setMo] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const tuKhoaKhongDau = boDauTiengViet(value);
  const ketQuaLoc = tuKhoaKhongDau
    ? goiY.filter((g) => boDauTiengViet(`${g.value} ${g.phu ?? ""}`).includes(tuKhoaKhongDau))
    : goiY;

  useEffect(() => {
    if (!mo) return;
    function xuLyClickNgoai(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setMo(false);
      }
    }
    document.addEventListener("mousedown", xuLyClickNgoai);
    return () => document.removeEventListener("mousedown", xuLyClickNgoai);
  }, [mo]);

  return (
    <div ref={containerRef} className="relative">
      <input
        id={id}
        type="text"
        disabled={disabled}
        aria-invalid={ariaInvalid}
        autoComplete="off"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setMo(true);
        }}
        onFocus={() => setMo(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setMo(false);
        }}
        placeholder={placeholder}
        className={cn(
          "flex h-[46px] w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground",
          "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          ariaInvalid && "border-destructive",
        )}
      />

      {mo && ketQuaLoc.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-background shadow-lg">
          <ul className="max-h-60 overflow-auto p-1" role="listbox">
            {ketQuaLoc.map((g) => (
              <li key={g.value}>
                <button
                  type="button"
                  role="option"
                  onClick={() => {
                    if (choPhepNhieu && value.trim()) {
                      const dsHienCo = value
                        .split(",")
                        .map((phan) => phan.trim())
                        .filter(Boolean);
                      onChange(dsHienCo.includes(g.value) ? value : `${value.trim()}, ${g.value}`);
                    } else {
                      onChange(g.value);
                    }
                    setMo(false);
                  }}
                  className="flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
                >
                  <span>
                    {g.value}
                    {g.phu && <span className="ml-1.5 text-xs text-muted-foreground">{g.phu}</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
