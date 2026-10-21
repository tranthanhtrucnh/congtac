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
  /** true = xu ly gia tri nhu 1 CHUOI NHIEU doan cach nhau boi dau phay - dung
   * cho truong hop can ghi nhieu dia diem trong 1 cau (vd "Nơi đến" cua LDCT
   * khi doan di nhieu tinh cung luc). Mac dinh false (luon THAY THE toan bo
   * khi chon goi y - dung cho moi noi chi can 1 gia tri duy nhat, vd Noi
   * di/Noi den cua LDX) - CHI bat rieng o noi thuc su can ghep nhieu.
   *
   * Khi bat: goi y CHI loc theo DOAN CUOI CUNG dang go (phan sau dau phay
   * gan nhat, hoac ca chuoi neu chua co dau phay nao) - va bam chon 1 goi y
   * se THAY THE DUNG doan cuoi cung do (giu nguyen cac doan truoc), roi noi
   * lai bang ", ". Nguoi dung go tiep 1 dia diem moi bang cach tu go dau
   * phay truoc, roi go/chon nhu doan dau tien.
   *
   * Ly do thiet ke lai (2026-09-04, sua bug nguoi dung bao "go Ha, chon Hà
   * Tiên ra 'Ha, Hà Tiên'"): ban dau (2026-08-10) code LUON noi gia tri chon
   * vao CUOI CA CHUOI hien co bat ke phan dang go co phai 1 phan cua goi y do
   * hay khong - dung cho truong hop "da go xong 1 dia diem, bam chon tiep 1
   * goi y KHAC de them dia diem thu 2" nhung SAI cho truong hop dang go DANG
   * DO (vd "Ha") va bam chon dung goi y khop voi no ("Hà Tiên") - le ra phai
   * HOAN TAT/thay the phan dang go, khong phai noi them. Thiet ke lai: luon
   * thay the DOAN CUOI CUNG (phan dang go do dang la 1 phan cua goi y duoc
   * loc ra) - vua sua dung bug tren, vua giup goi y loc dung cho DOAN THU 2
   * TRO DI (truoc day loc theo CA CHUOI da go nen voi doan thu 2 gan nhu
   * khong bao gio khop, danh sach goi y luon rong). Xem NHAT_KY_QUYET_DINH.md. */
  choPhepNhieu?: boolean;
}) {
  const [mo, setMo] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Khi choPhepNhieu: chi loc/hien goi y theo DOAN CUOI CUNG dang go (sau dau
  // phay gan nhat), khong phai ca chuoi - xem doc comment o choPhepNhieu.
  const doanDangGo = choPhepNhieu ? (value.split(",").pop() ?? "").trim() : value;
  const tuKhoaKhongDau = boDauTiengViet(doanDangGo);
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
                    if (choPhepNhieu) {
                      // Giu nguyen cac doan TRUOC doan cuoi cung (da go xong,
                      // cach nhau boi dau phay), CHI thay the doan cuoi cung
                      // (dang go do) bang gia tri goi y duoc chon - xem doc
                      // comment day du o khai bao choPhepNhieu ben tren.
                      const cacDoanTruoc = value
                        .split(",")
                        .slice(0, -1)
                        .map((phan) => phan.trim())
                        .filter(Boolean);
                      onChange(
                        cacDoanTruoc.includes(g.value) ? cacDoanTruoc.join(", ") : [...cacDoanTruoc, g.value].join(", "),
                      );
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
