"use client";

import { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { useNguoiDungHienTai } from "@/hooks/use-nguoi-dung-hien-tai";
import { useDanhSachNguoiKy } from "@/hooks/use-danh-sach-nguoi-ky";
import { xayQueryTanSuatPhuongTien, type BoLocTanSuatPhuongTien, type BoLocTanSuatTaiXe } from "@/hooks/use-bao-cao-phuong-tien";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { XemTruocPdfDialog } from "@/components/xem-truoc-pdf-dialog";

function dinhDangNgayHienThi(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN");
}

interface InBaoCaoPhuongTienDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Bo loc CUA PHAN "Thong ke tan suat" (phuong tien) dang ap dung tren man
   * hinh - ban in dung LUON bo loc nay cho phan II (giong quy uoc "dung luon
   * bo loc dang ap dung tren man hinh" da chon o Sổ theo dõi công lệnh). Phan
   * I "Trang thai hien tai" trong ban in KHONG co bo loc rieng - luon lay
   * TOAN BO xe dang hoat dong tai thoi diem in. */
  boLoc: BoLocTanSuatPhuongTien;
  /** Bo loc sap xep RIENG cua phan III (tai xe) dang ap dung tren man hinh -
   * chi lay sapXepTheo/huongSapXep, KHONG lay tuNgay/denNgay (2 truong nay
   * dung CHUNG voi `boLoc` o tren - xem page.tsx). */
  boLocTaiXe: BoLocTanSuatTaiXe;
}

/**
 * Hop thoai chon tuy chon truoc khi in mau "Bao cao phuong tien" (A4 ngang) -
 * chi can nhap "Nguoi lap bao cao", roi chuyen sang XemTruocPdfDialog de xem/
 * in. "Nguoi ky duyet" KHONG chon o day - luon la Nguoi ky dang "chinh thuc"
 * cua he thong, chi hien PREVIEW read-only. Xem NHAT_KY_QUYET_DINH.md muc
 * "Bao cao phuong tien".
 */
export function InBaoCaoPhuongTienDialog({ open, onOpenChange, boLoc, boLocTaiXe }: InBaoCaoPhuongTienDialogProps) {
  const { data: nguoiDungHienTai } = useNguoiDungHienTai();
  const { data: dsNguoiKyChinhThuc } = useDanhSachNguoiKy({
    trang: 1,
    kichThuoc: 1,
    tuKhoa: "",
    trangThai: "DANG_KY_CHINH_THUC",
  });
  const nguoiKyChinhThuc = dsNguoiKyChinhThuc?.duLieu[0] ?? null;

  const [nguoiLapSo, setNguoiLapSo] = useState("");
  const [urlXemTruoc, setUrlXemTruoc] = useState<string | null>(null);

  useEffect(() => {
    if (nguoiDungHienTai && !nguoiLapSo) setNguoiLapSo(nguoiDungHienTai.hoTen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nguoiDungHienTai]);

  const nguoiLapSoHopLe = nguoiLapSo.trim().length > 0;

  function moXemTruoc() {
    const query = xayQueryTanSuatPhuongTien(boLoc);
    query.set("nguoiLapSo", nguoiLapSo.trim());
    // sapXepTheoTaiXe/huongSapXepTaiXe RIENG cho phan III - tuNgay/denNgay
    // da co san trong `query` o tren (dung chung voi boLoc), khong ghi de.
    query.set("sapXepTheoTaiXe", boLocTaiXe.sapXepTheo);
    query.set("huongSapXepTaiXe", boLocTaiXe.huongSapXep);
    setUrlXemTruoc(`${API_BASE_URL}/bao-cao-phuong-tien/in?${query.toString()}`);
    onOpenChange(false);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>In báo cáo phương tiện</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
              Phần I (Trạng thái hiện tại) luôn in đầy đủ toàn bộ xe đang hoạt động. Phần II (Thống kê tần
              suất phương tiện) và Phần III (Thống kê tần suất tài xế) dùng đúng bộ lọc ngày và cách sắp xếp
              đang áp dụng trên màn hình:{" "}
              {boLoc.tuNgay || boLoc.denNgay ? (
                <>
                  {boLoc.tuNgay ? `từ ${dinhDangNgayHienThi(boLoc.tuNgay)}` : "từ đầu"}
                  {" đến "}
                  {boLoc.denNgay ? dinhDangNgayHienThi(boLoc.denNgay) : "hiện tại"}
                </>
              ) : (
                "toàn bộ, không giới hạn ngày đi"
              )}
              .
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nguoiLapSoBaoCao">Người lập báo cáo</Label>
              <Input
                id="nguoiLapSoBaoCao"
                value={nguoiLapSo}
                onChange={(e) => setNguoiLapSo(e.target.value)}
                placeholder="Họ tên người lập báo cáo"
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
            <Button onClick={moXemTruoc} disabled={!nguoiLapSoHopLe || !nguoiKyChinhThuc}>
              <Printer /> Xem trước / In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <XemTruocPdfDialog
        open={urlXemTruoc !== null}
        onOpenChange={(o) => !o && setUrlXemTruoc(null)}
        url={urlXemTruoc}
        tieuDe="Báo cáo phương tiện"
      />
    </>
  );
}
