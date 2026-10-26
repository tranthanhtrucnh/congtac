"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Route } from "lucide-react";
import { goiApi } from "@/lib/api";
import type { ChangCongTacInput } from "@congtac/validation";
import { useDanhSachDiaDiem } from "@/hooks/use-danh-sach-dia-diem";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoTrinhDaChangInput } from "@/components/lo-trinh-da-chang-input";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  giayDiDuongId: string | null;
}

interface ChiTietGddResponse {
  id: string;
  soHieu: string;
  cacChangRieng?: ChangCongTacInput[] | null;
  thanhVien: {
    id: string;
    hoTen: string;
    chucVu: string;
  };
  lenhDieuCongTac: {
    id: string;
    soHieu: string;
    diaDiemCongTac: string;
    noiDi?: string | null;
    ngayDi: string;
    ngayVe: string;
    cacChang?: ChangCongTacInput[] | null;
  };
  chiTiet: {
    noiDi: string;
    noiDen: string;
    ngayDi: string;
    ngayVe: string;
    cacChang: ChangCongTacInput[] | null;
  };
}

export function SuaLoTrinhGiayDiDuongDialog({ open, onOpenChange, giayDiDuongId }: Props) {
  const queryClient = useQueryClient();
  const [cacChang, setCacChang] = useState<ChangCongTacInput[] | null>(null);

  const { data: diaDiemDs } = useDanhSachDiaDiem({ trang: 1, kichThuoc: 100, tuKhoa: "" });
  const goiYDiaDiem =
    diaDiemDs?.duLieu.map((dd) => ({
      value: dd.tenDayDu,
      phu: dd.cacTenTat.length > 0 ? dd.cacTenTat.join(", ") : undefined,
    })) ?? [];

  const { data: gdd, isLoading } = useQuery({
    queryKey: ["giay-di-duong-chi-tiet", giayDiDuongId],
    queryFn: () => goiApi<ChiTietGddResponse>(`/giay-di-duong/${giayDiDuongId}`),
    enabled: open && !!giayDiDuongId,
  });

  useEffect(() => {
    if (gdd) {
      // Neu co cacChangRieng thi dung, neu khong lay tu lenhDieuCongTac.cacChang
      setCacChang(gdd.cacChangRieng ?? gdd.lenhDieuCongTac.cacChang ?? null);
    }
  }, [gdd]);

  const mutation = useMutation({
    mutationFn: (duLieu: { cacChang: ChangCongTacInput[] | null }) =>
      goiApi(`/giay-di-duong/${giayDiDuongId}/lo-trinh`, {
        method: "PATCH",
        body: JSON.stringify(duLieu),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["giay-di-duong"] });
      queryClient.invalidateQueries({ queryKey: ["lenh-dieu-cong-tac"] });
      queryClient.invalidateQueries({ queryKey: ["giay-di-duong-chi-tiet", giayDiDuongId] });
      onOpenChange(false);
    },
  });

  function luu() {
    mutation.mutate({ cacChang });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Route className="size-5 text-primary" />
            Chỉnh sửa lộ trình Công lệnh {gdd?.soHieu ? `— ${gdd.soHieu}` : ""}
          </DialogTitle>
          <DialogDescription>
            {gdd ? (
              <span>
                Cán bộ: <strong>{gdd.thanhVien.hoTen}</strong> ({gdd.thanhVien.chucVu}) — Thuộc đoàn{" "}
                <strong>{gdd.lenhDieuCongTac.soHieu}</strong>
              </span>
            ) : (
              "Đang tải thông tin..."
            )}
          </DialogDescription>
        </DialogHeader>

        {isLoading || !gdd ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <LoTrinhDaChangInput
              cacChang={cacChang}
              onChange={setCacChang}
              noiDiMacDinh={gdd.chiTiet.noiDi}
              noiDenMacDinh={gdd.chiTiet.noiDen}
              ngayDiMacDinh={gdd.chiTiet.ngayDi?.slice(0, 10)}
              ngayVeMacDinh={gdd.chiTiet.ngayVe?.slice(0, 10)}
              goiYDiaDiem={goiYDiaDiem}
            />

            {mutation.isError && (
              <p className="text-sm text-destructive">
                {mutation.error instanceof Error ? mutation.error.message : "Có lỗi khi lưu lộ trình"}
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            Hủy
          </Button>
          <Button type="button" onClick={luu} disabled={isLoading || mutation.isPending}>
            {mutation.isPending ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : null}
            Lưu lộ trình
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
