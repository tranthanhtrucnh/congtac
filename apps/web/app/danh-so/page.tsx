"use client";

import { useState } from "react";
import { AlertTriangle, ChevronLeft, ChevronRight, Hash, Lock, Save } from "lucide-react";
import { MA_QUYEN, dinhDangSoChungTu } from "@congtac/shared";
import { thietLapDanhSoSchema, type ThietLapDanhSoInput } from "@congtac/validation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNguoiDungHienTai, coQuyen } from "@/hooks/use-nguoi-dung-hien-tai";
import { useDanhSachDanhSo, useLamMoiDanhSo, type DanhSoTheoLoai, type LoaiChungTu } from "@/hooks/use-danh-so";
import { goiApi, LoiApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

// Ten day du chi phuc vu hien thi trong bang nay. Ky hieu in tren chung tu
// (LDCT/GDD/LDX) nguoc lai LA du lieu sua duoc qua giao dien (xem cot "Ky
// hieu" - gia tri mac dinh lay tu KY_HIEU_LOAI_CHUNG_TU dung chung o backend,
// nguoi dung co the ghi de rieng cho tung nam ma khong can sua code).
const TEN_DAY_DU_LOAI_CHUNG_TU: Record<LoaiChungTu, string> = {
  LDCT: "Lệnh điều công tác",
  GDD: "Công lệnh kiêm Giấy đi đường",
  LDX: "Lệnh điều xe",
};

function HangDanhSo({
  nam,
  thongTin,
  coQuyenSua,
}: {
  nam: number;
  thongTin: DanhSoTheoLoai;
  coQuyenSua: boolean;
}) {
  const lamMoiDanhSo = useLamMoiDanhSo();
  const [loiChung, setLoiChung] = useState<string | null>(null);
  const [thanhCong, setThanhCong] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ThietLapDanhSoInput>({
    resolver: zodResolver(thietLapDanhSoSchema),
    values: {
      loaiChungTu: thongTin.loaiChungTu,
      nam,
      soBatDau: thongTin.soBatDau,
      kyHieu: thongTin.kyHieu,
    },
  });

  const soBatDauDangNhap = watch("soBatDau");

  // So bat dau khoa lai sau khi da cap so (tranh trung/nhay so tren chung tu
  // da phat hanh) - nhung Ky hieu (chi anh huong hien thi/in) van sua duoc
  // binh thuong, chi phu thuoc quyen.
  const khoaSoBatDau = thongTin.daCapSo || !coQuyenSua;
  const khoaKyHieu = !coQuyenSua;

  async function xuLySubmit(duLieu: ThietLapDanhSoInput) {
    setLoiChung(null);
    setThanhCong(false);
    try {
      await goiApi("/danh-so/thiet-lap", { method: "POST", body: JSON.stringify(duLieu) });
      await lamMoiDanhSo();
      setThanhCong(true);
      reset(duLieu);
    } catch (loi) {
      setLoiChung(loi instanceof LoiApi ? loi.message : "Không thể lưu, vui lòng thử lại");
    }
  }

  const idForm = `form-danh-so-${thongTin.loaiChungTu}`;

  return (
    <TableRow>
      <TableCell>
        <div className="font-medium text-foreground">{TEN_DAY_DU_LOAI_CHUNG_TU[thongTin.loaiChungTu]}</div>
        {loiChung && <p className="mt-1 text-xs text-destructive">{loiChung}</p>}
        {thanhCong && !isDirty && <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">Đã lưu.</p>}
      </TableCell>
      <TableCell>
        {/* Form chi bao quanh o So bat dau de giu markup gon - nut Luu dat o
            cuoi hang va tham chieu ve form nay qua thuoc tinh `form`, o Ky
            hieu cung dang ky vao cung useForm nen van duoc gui kem khi luu. */}
        <form id={idForm} onSubmit={handleSubmit(xuLySubmit)} className="flex items-center gap-2">
          <Input
            type="number"
            min={1}
            className="w-24"
            disabled={khoaSoBatDau}
            aria-invalid={!!errors.soBatDau}
            {...register("soBatDau", { valueAsNumber: true })}
          />
          {thongTin.daCapSo && (
            <span
              className="inline-flex items-center gap-1 text-xs text-muted-foreground"
              title="Đã có chứng từ sử dụng, không thể đổi số bắt đầu"
            >
              <Lock className="size-3" />
              Đã khóa
            </span>
          )}
        </form>
        {errors.soBatDau ? (
          <p className="mt-1 text-xs text-destructive">{errors.soBatDau.message}</p>
        ) : (
          Number.isFinite(soBatDauDangNhap) && (
            <p className="mt-1 text-xs text-muted-foreground">
              Hiển thị: <span className="font-mono">{dinhDangSoChungTu(soBatDauDangNhap)}</span>
            </p>
          )
        )}
      </TableCell>
      <TableCell>
        <Input
          form={idForm}
          placeholder="LĐCT"
          className="w-24"
          disabled={khoaKyHieu}
          aria-invalid={!!errors.kyHieu}
          {...register("kyHieu")}
        />
        {errors.kyHieu && <p className="mt-1 text-xs text-destructive">{errors.kyHieu.message}</p>}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {thongTin.soHienTai > 0
          ? `${dinhDangSoChungTu(thongTin.soHienTai)}/${thongTin.kyHieu}`
          : "—"}
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-between gap-2">
          {thongTin.daCapSo ? (
            <Badge>Đã cấp số</Badge>
          ) : thongTin.daThietLap ? (
            <Badge variant="outline">Đã thiết lập</Badge>
          ) : (
            <Badge variant="muted">Chưa thiết lập</Badge>
          )}
          {coQuyenSua && (
            <Button
              form={idForm}
              type="submit"
              size="icon"
              variant="ghost"
              disabled={isSubmitting || !isDirty}
              aria-label="Lưu thay đổi"
            >
              <Save className="size-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function TrangDanhSo() {
  const { data: nguoiDungHienTai } = useNguoiDungHienTai();
  const [nam, setNam] = useState(() => new Date().getFullYear());

  const { data, isLoading, isError, error } = useDanhSachDanhSo(nam);
  const coQuyenSua = coQuyen(nguoiDungHienTai, MA_QUYEN.DANH_SO_THIET_LAP);

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Đánh số chứng từ</h1>
          <p className="text-sm text-muted-foreground">
            Thiết lập số bắt đầu cho từng loại chứng từ theo năm. Số hiện tại được cấp tự động, không sửa được.
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-md border border-input">
          <Button variant="ghost" size="icon" aria-label="Năm trước" onClick={() => setNam((n) => n - 1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-[4.5rem] text-center text-sm font-medium text-foreground">Năm {nam}</span>
          <Button variant="ghost" size="icon" aria-label="Năm sau" onClick={() => setNam((n) => n + 1)}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {!coQuyenSua && (
        <div className="mb-4 rounded-md border border-border bg-muted/40 px-4 py-2.5 text-sm text-muted-foreground">
          Bạn chỉ có quyền xem — chỉ Quản trị hệ thống mới thiết lập được số bắt đầu.
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Loại chứng từ</TableHead>
              <TableHead>Số bắt đầu</TableHead>
              <TableHead>Ký hiệu</TableHead>
              <TableHead>Số đã cấp gần nhất</TableHead>
              <TableHead>Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  <Hash className="mx-auto mb-2 size-6 animate-pulse text-muted-foreground/50" />
                  Đang tải...
                </TableCell>
              </TableRow>
            )}
            {isError && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center">
                  <AlertTriangle className="mx-auto mb-2 size-6 text-destructive/70" />
                  <p className="text-sm text-destructive">
                    {error instanceof LoiApi ? error.message : "Không tải được dữ liệu, vui lòng thử lại"}
                  </p>
                  {error instanceof LoiApi && error.status === 403 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Có thể bạn chưa có quyền "Thiết lập dãy số chứng từ", hoặc vừa được cấp quyền nhưng chưa đăng
                      xuất/đăng nhập lại để cập nhật phiên đăng nhập.
                    </p>
                  )}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !isError && data?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  Chưa có dữ liệu cho năm {nam}.
                </TableCell>
              </TableRow>
            )}
            {data?.map((thongTin) => (
              <HangDanhSo key={thongTin.loaiChungTu} nam={nam} thongTin={thongTin} coQuyenSua={coQuyenSua} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
