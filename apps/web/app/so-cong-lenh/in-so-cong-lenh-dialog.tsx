"use client";

import { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import { COT_SO_THEO_DOI, type CotSoTheoDoi } from "@congtac/validation";
import { API_BASE_URL } from "@/lib/api";
import { useNguoiDungHienTai } from "@/hooks/use-nguoi-dung-hien-tai";
import { useDanhSachNguoiKy } from "@/hooks/use-danh-sach-nguoi-ky";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { XemTruocPdfDialog } from "@/components/xem-truoc-pdf-dialog";

const NHAN_COT: Record<CotSoTheoDoi, string> = {
  ngayLap: "Ngày lập",
  soLdct: "Số LĐCT",
  soCongLenh: "Số Công lệnh/GĐĐ",
  hoTen: "Họ tên",
  diaDiem: "Địa điểm",
  mucDich: "Mục đích",
  ngayDiVe: "Ngày đi/về",
  ghiChu: "Ghi chú",
};

function dinhDangNgayHienThi(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("vi-VN");
}

interface InSoCongLenhDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Bo loc DANG AP DUNG tren trang /so-cong-lenh - ban in dung LUON bo loc
   * nay, khong co bo loc rieng (nguoi dung chon huong nay 2026-08-26, xem
   * NHAT_KY_QUYET_DINH.md). */
  boLoc: { tuKhoa: string; tuNgay?: string; denNgay?: string };
}

/**
 * Hop thoai chon tuy chon truoc khi in mau "So theo doi cong lenh" (A4 ngang) -
 * chon cot hien thi + nhap "Nguoi lap so", roi chuyen sang XemTruocPdfDialog
 * (dung chung component xem PDF cua ung dung, khong tu mo tab moi/window.open)
 * de xem/in. "Nguoi ky duyet" KHONG chon o day - luon la Nguoi ky dang "chinh
 * thuc" cua he thong (giong quy uoc LDCT/GDD/LDX), chi hien PREVIEW read-only
 * de Van thu biet truoc ai se duoc in ten, khong chon duoc nguoi khac tai day.
 */
export function InSoCongLenhDialog({ open, onOpenChange, boLoc }: InSoCongLenhDialogProps) {
  const { data: nguoiDungHienTai } = useNguoiDungHienTai();
  const { data: dsNguoiKyChinhThuc } = useDanhSachNguoiKy({
    trang: 1,
    kichThuoc: 1,
    tuKhoa: "",
    trangThai: "DANG_KY_CHINH_THUC",
  });
  const nguoiKyChinhThuc = dsNguoiKyChinhThuc?.duLieu[0] ?? null;

  const [cotDaChon, setCotDaChon] = useState<Record<CotSoTheoDoi, boolean>>(() =>
    Object.fromEntries(COT_SO_THEO_DOI.map((c) => [c, true])) as Record<CotSoTheoDoi, boolean>,
  );
  const [nguoiLapSo, setNguoiLapSo] = useState("");
  const [urlXemTruoc, setUrlXemTruoc] = useState<string | null>(null);

  // Dien san ten nguoi dang dang nhap lam "Nguoi lap so" mac dinh - chi 1 lan
  // khi vua co du lieu VA nguoi dung chua tu go gi (tranh ghi de luc dang go).
  useEffect(() => {
    if (nguoiDungHienTai && !nguoiLapSo) setNguoiLapSo(nguoiDungHienTai.hoTen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nguoiDungHienTai]);

  const soCotDaChon = COT_SO_THEO_DOI.filter((c) => cotDaChon[c]).length;
  const nguoiLapSoHopLe = nguoiLapSo.trim().length > 0;

  function moXemTruoc() {
    const cot = COT_SO_THEO_DOI.filter((c) => cotDaChon[c]);
    const query = new URLSearchParams();
    query.set("nguoiLapSo", nguoiLapSo.trim());
    query.set("cot", cot.join(","));
    if (boLoc.tuKhoa) query.set("tuKhoa", boLoc.tuKhoa);
    if (boLoc.tuNgay) query.set("tuNgay", boLoc.tuNgay);
    if (boLoc.denNgay) query.set("denNgay", boLoc.denNgay);
    setUrlXemTruoc(`${API_BASE_URL}/so-cong-lenh/in?${query.toString()}`);
    onOpenChange(false);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>In sổ theo dõi công lệnh</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
              Bản in dùng đúng bộ lọc đang áp dụng trên màn hình:{" "}
              {boLoc.tuNgay || boLoc.denNgay ? (
                <>
                  {boLoc.tuNgay ? `từ ${dinhDangNgayHienThi(boLoc.tuNgay)}` : "từ đầu"}
                  {" đến "}
                  {boLoc.denNgay ? dinhDangNgayHienThi(boLoc.denNgay) : "hiện tại"}
                </>
              ) : (
                "toàn bộ, không giới hạn ngày lập"
              )}
              {boLoc.tuKhoa && <> — từ khóa "{boLoc.tuKhoa}"</>}.
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Cột hiển thị trong bản in</p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-2 rounded-md border border-border p-3">
                {COT_SO_THEO_DOI.map((c) => (
                  <label key={c} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={cotDaChon[c]}
                      onCheckedChange={(checked) =>
                        setCotDaChon((truoc) => ({ ...truoc, [c]: checked === true }))
                      }
                    />
                    {NHAN_COT[c]}
                  </label>
                ))}
              </div>
              {soCotDaChon === 0 && <p className="text-sm text-destructive">Chọn ít nhất 1 cột để in.</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nguoiLapSo">Người lập sổ</Label>
              <Input
                id="nguoiLapSo"
                value={nguoiLapSo}
                onChange={(e) => setNguoiLapSo(e.target.value)}
                placeholder="Họ tên người lập sổ"
              />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Người ký duyệt</p>
              <p className="text-sm">
                {nguoiKyChinhThuc
                  ? `${nguoiKyChinhThuc.nhanVien.hoTen} (${nguoiKyChinhThuc.theThucKy})`
                  : "Chưa thiết lập người ký chính thức — vào Danh mục Người ký trước khi in."}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button
              onClick={moXemTruoc}
              disabled={soCotDaChon === 0 || !nguoiLapSoHopLe || !nguoiKyChinhThuc}
            >
              <Printer /> Xem trước / In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <XemTruocPdfDialog
        open={urlXemTruoc !== null}
        onOpenChange={(o) => !o && setUrlXemTruoc(null)}
        url={urlXemTruoc}
        tieuDe="Sổ theo dõi công lệnh"
      />
    </>
  );
}
