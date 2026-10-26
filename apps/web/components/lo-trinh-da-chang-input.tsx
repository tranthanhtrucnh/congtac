"use client";

import { Plus, Trash2, RotateCcw, Info, MapPin } from "lucide-react";
import type { ChangCongTacInput } from "@congtac/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ComboboxVanBan } from "@/components/ui/combobox-van-ban";

interface Props {
  cacChang: ChangCongTacInput[] | null | undefined;
  onChange: (val: ChangCongTacInput[] | null) => void;
  noiDiMacDinh?: string;
  noiDenMacDinh?: string;
  ngayDiMacDinh?: string; // YYYY-MM-DD
  ngayVeMacDinh?: string; // YYYY-MM-DD
  goiYDiaDiem?: { value: string; phu?: string }[];
}

export function LoTrinhDaChangInput({
  cacChang,
  onChange,
  noiDiMacDinh = "",
  noiDenMacDinh = "",
  ngayDiMacDinh = "",
  ngayVeMacDinh = "",
  goiYDiaDiem = [],
}: Props) {
  const coTuyChinh = Array.isArray(cacChang) && cacChang.length >= 3;

  function batTuyChinh() {
    const diemDi = noiDiMacDinh || "P. Long Xuyên, An Giang";
    const diemDen = noiDenMacDinh || "";
    const ngayDi = ngayDiMacDinh || new Date().toISOString().slice(0, 10);
    const ngayVe = ngayVeMacDinh || ngayDi;

    const changKhoiTao: ChangCongTacInput[] = [
      { noiDi: diemDi, noiDen: diemDen, ngay: ngayDi },
      { noiDi: diemDen, noiDen: "", ngay: ngayDi },
      { noiDi: "", noiDen: diemDi, ngay: ngayVe },
    ];
    onChange(changKhoiTao);
  }

  function tatTuyChinh() {
    onChange(null);
  }

  function capNhatChang(index: number, truong: keyof ChangCongTacInput, giaTri: string) {
    if (!cacChang) return;
    const moi = [...cacChang];
    moi[index] = {
      ...moi[index],
      [truong]: giaTri,
    };
    onChange(moi);
  }

  function themChang4() {
    if (!cacChang || cacChang.length >= 4) return;
    const diemCuoi = cacChang[cacChang.length - 1]?.noiDen || noiDiMacDinh;
    const ngayVe = ngayVeMacDinh || cacChang[cacChang.length - 1]?.ngay || "";
    const moi: ChangCongTacInput[] = [
      ...cacChang.slice(0, 2),
      { ...cacChang[2], noiDen: "" },
      { noiDi: "", noiDen: diemCuoi, ngay: ngayVe },
    ];
    onChange(moi);
  }

  function xoaChang(index: number) {
    if (!cacChang) return;
    if (cacChang.length <= 3) {
      // Xoa ve mac dinh khong tuy chinh
      onChange(null);
      return;
    }
    const moi = cacChang.filter((_, i) => i !== index);
    onChange(moi);
  }

  if (!coTuyChinh) {
    return (
      <div className="flex items-center justify-between rounded-md border border-dashed border-border/80 bg-muted/20 px-3 py-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="size-4 shrink-0 text-primary" />
          <span>Lộ trình công lệnh mặc định: 2 chặng khứ hồi (Hàng 3 & 4 để trống).</span>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={batTuyChinh} className="h-8 gap-1 text-xs">
          <Plus className="size-3.5" /> Thêm chặng 3 (đa tuyến)
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-border/80 bg-muted/20 p-3 text-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-medium text-foreground">
          <MapPin className="size-4 text-primary" />
          <span>Lộ trình chi tiết Công lệnh ({cacChang.length} chặng)</span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={tatTuyChinh}
          className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="size-3" /> Quay về mặc định (2 chặng)
        </Button>
      </div>

      <div className="space-y-2.5">
        {cacChang.map((chang, idx) => (
          <div
            key={idx}
            className="grid grid-cols-12 items-center gap-2 rounded-md border border-border/60 bg-background p-2"
          >
            <div className="col-span-12 sm:col-span-1 text-xs font-semibold text-muted-foreground">
              Chặng {idx + 1}
            </div>

            <div className="col-span-12 sm:col-span-4 space-y-1">
              <Label className="text-[11px] text-muted-foreground">Nơi đi</Label>
              <ComboboxVanBan
                value={chang.noiDi}
                onChange={(v) => capNhatChang(idx, "noiDi", v)}
                goiY={goiYDiaDiem}
                choPhepNhieu
                placeholder="Nơi đi..."
              />
            </div>

            <div className="col-span-12 sm:col-span-4 space-y-1">
              <Label className="text-[11px] text-muted-foreground">Nơi đến</Label>
              <ComboboxVanBan
                value={chang.noiDen}
                onChange={(v) => capNhatChang(idx, "noiDen", v)}
                goiY={goiYDiaDiem}
                choPhepNhieu
                placeholder="Nơi đến..."
              />
            </div>

            <div className="col-span-10 sm:col-span-2 space-y-1">
              <Label className="text-[11px] text-muted-foreground">Ngày</Label>
              <Input
                type="date"
                value={chang.ngay ? new Date(chang.ngay).toISOString().slice(0, 10) : ""}
                onChange={(e) => capNhatChang(idx, "ngay", e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div className="col-span-2 sm:col-span-1 flex justify-end">
              {idx >= 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => xoaChang(idx)}
                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  title={`Xóa chặng ${idx + 1}`}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        {cacChang.length === 3 && (
          <>
            <p className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400">
              <Info className="size-3.5 shrink-0" />
              Đang có 3 chặng: Mẫu in Công lệnh gồm 3 chặng và 1 hàng trống.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={themChang4}
              className="h-7 gap-1 text-xs"
            >
              <Plus className="size-3" /> Thêm chặng 4
            </Button>
          </>
        )}

        {cacChang.length === 4 && (
          <p className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
            <Info className="size-3.5 shrink-0" />
            Đang có 4 chặng: Mẫu in sẽ hiển thị đủ 4 hàng và tự động co gọn để vừa vặn khổ giấy A5.
          </p>
        )}
      </div>
    </div>
  );
}
