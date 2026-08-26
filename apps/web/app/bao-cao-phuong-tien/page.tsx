"use client";

import { useEffect, useState } from "react";
import { ArrowDownWideNarrow, ArrowUpWideNarrow, Download, Gauge, Printer, Search, X } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import {
  useTrangThaiPhuongTien,
  useTanSuatPhuongTien,
  xayQueryTanSuatPhuongTien,
  type BoLocTanSuatPhuongTien,
} from "@/hooks/use-bao-cao-phuong-tien";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { InBaoCaoPhuongTienDialog } from "./in-bao-cao-phuong-tien-dialog";

function ngayThanhChuoiInput(ngay: Date): string {
  const y = ngay.getFullYear();
  const m = String(ngay.getMonth() + 1).padStart(2, "0");
  const d = String(ngay.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

type PresetKhoangNgay = "homNay" | "tuanNay" | "thangNay" | "quyNay" | "namNay";

// Giong het tinhKhoangPreset() o trang /so-cong-lenh - copy lai thay vi tach
// thanh util dung chung vi chi 2 noi dung va logic don gian, khong dang de
// them 1 file moi (xem NHAT_KY_QUYET_DINH.md muc "Bao cao phuong tien").
function tinhKhoangPreset(preset: PresetKhoangNgay): { tuNgay: string; denNgay: string } {
  const homNay = new Date();
  if (preset === "homNay") {
    const s = ngayThanhChuoiInput(homNay);
    return { tuNgay: s, denNgay: s };
  }
  if (preset === "tuanNay") {
    const thu = homNay.getDay();
    const lechDauTuan = thu === 0 ? 6 : thu - 1;
    const dauTuan = new Date(homNay);
    dauTuan.setDate(homNay.getDate() - lechDauTuan);
    const cuoiTuan = new Date(dauTuan);
    cuoiTuan.setDate(dauTuan.getDate() + 6);
    return { tuNgay: ngayThanhChuoiInput(dauTuan), denNgay: ngayThanhChuoiInput(cuoiTuan) };
  }
  if (preset === "thangNay") {
    const dau = new Date(homNay.getFullYear(), homNay.getMonth(), 1);
    const cuoi = new Date(homNay.getFullYear(), homNay.getMonth() + 1, 0);
    return { tuNgay: ngayThanhChuoiInput(dau), denNgay: ngayThanhChuoiInput(cuoi) };
  }
  if (preset === "quyNay") {
    const quy = Math.floor(homNay.getMonth() / 3);
    const dau = new Date(homNay.getFullYear(), quy * 3, 1);
    const cuoi = new Date(homNay.getFullYear(), quy * 3 + 3, 0);
    return { tuNgay: ngayThanhChuoiInput(dau), denNgay: ngayThanhChuoiInput(cuoi) };
  }
  const dau = new Date(homNay.getFullYear(), 0, 1);
  const cuoi = new Date(homNay.getFullYear(), 11, 31);
  return { tuNgay: ngayThanhChuoiInput(dau), denNgay: ngayThanhChuoiInput(cuoi) };
}

const NUT_PRESET: { ma: PresetKhoangNgay; nhan: string }[] = [
  { ma: "homNay", nhan: "Hôm nay" },
  { ma: "tuanNay", nhan: "Tuần này" },
  { ma: "thangNay", nhan: "Tháng này" },
  { ma: "quyNay", nhan: "Quý này" },
  { ma: "namNay", nhan: "Năm này" },
];

function dinhDangNgay(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN");
}

/** Bieu do cot ngang RAT DON GIAN dung CSS/Tailwind thuan (khong them thu
 * vien chart - app chua co san thu vien nao, chi can 1 bieu do xep hang don
 * gian nen tu dung de de bao tri, xem NHAT_KY_QUYET_DINH.md muc "Bao cao
 * phuong tien"). LUON tu sap xep GIAM DAN theo tieuChi va lay 8 xe dau (KHONG
 * dua vao thu tu duLieu truyen vao - bang so lieu ben canh co the dang hien
 * theo chieu TANG dan neu nguoi dung doi huongSapXep, nhung "Top 8" cua bieu
 * do phai luon la 8 xe CAO NHAT du bang dang sap xep chieu nao). */
function BieuDoTanSuat({
  duLieu,
  tieuChi,
}: {
  duLieu: { bienSo: string; luotDi: number; tongNgaySuDung: number }[];
  tieuChi: "luotDi" | "tongNgaySuDung";
}) {
  const top = [...duLieu]
    .sort((a, b) => b[tieuChi] - a[tieuChi])
    .slice(0, 8)
    .filter((d) => d[tieuChi] > 0);
  if (top.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">Chưa có dữ liệu để vẽ biểu đồ.</p>;
  }
  const giaTriLon = Math.max(...top.map((d) => d[tieuChi]));

  return (
    <div className="space-y-2 py-1">
      {top.map((d) => (
        <div key={d.bienSo} className="flex items-center gap-3 text-sm">
          <span className="w-20 shrink-0 truncate font-medium text-foreground">{d.bienSo}</span>
          <div className="h-4 flex-1 overflow-hidden rounded bg-muted">
            <div
              className="h-full rounded bg-primary"
              style={{ width: `${Math.max(4, (d[tieuChi] / giaTriLon) * 100)}%` }}
            />
          </div>
          <span className="w-10 shrink-0 text-right text-muted-foreground">{d[tieuChi]}</span>
        </div>
      ))}
    </div>
  );
}

// Bao cao TU SINH tu Lenh dieu xe - KHONG CRUD rieng, chi xem + in + xuat
// Excel. Xem NHAT_KY_QUYET_DINH.md muc "Bao cao phuong tien".
export default function TrangBaoCaoPhuongTien() {
  const [oTimKiemTrangThai, setOTimKiemTrangThai] = useState("");
  const [tuKhoaTrangThai, setTuKhoaTrangThai] = useState("");
  const [tuNgay, setTuNgay] = useState("");
  const [denNgay, setDenNgay] = useState("");
  const [sapXepTheo, setSapXepTheo] = useState<BoLocTanSuatPhuongTien["sapXepTheo"]>("luotDi");
  const [huongSapXep, setHuongSapXep] = useState<BoLocTanSuatPhuongTien["huongSapXep"]>("desc");
  const [moHopThoaiIn, setMoHopThoaiIn] = useState(false);

  useEffect(() => {
    const hen = setTimeout(() => setTuKhoaTrangThai(oTimKiemTrangThai.trim()), 250);
    return () => clearTimeout(hen);
  }, [oTimKiemTrangThai]);

  const { data: trangThai, isLoading: dangTaiTrangThai } = useTrangThaiPhuongTien(tuKhoaTrangThai);
  const boLocTanSuat: BoLocTanSuatPhuongTien = {
    tuNgay: tuNgay || undefined,
    denNgay: denNgay || undefined,
    sapXepTheo,
    huongSapXep,
  };
  const { data: tanSuat, isLoading: dangTaiTanSuat, isFetching: dangLamMoiTanSuat } = useTanSuatPhuongTien(boLocTanSuat);

  const soXeDangDi = trangThai?.filter((x) => x.dangDi).length ?? 0;

  function xuatExcel() {
    const query = xayQueryTanSuatPhuongTien(boLocTanSuat);
    window.open(`${API_BASE_URL}/bao-cao-phuong-tien/xuat-excel?${query.toString()}`, "_blank");
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Báo cáo phương tiện</h1>
          <p className="text-sm text-muted-foreground">
            Xe nào/tài xế nào đang đi, đi đâu, từ ngày nào — và thống kê tần suất sử dụng theo khoảng thời
            gian tự chọn. Báo cáo tự sinh từ Lệnh điều xe, không có Tạo/Sửa/Xóa riêng.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" onClick={() => setMoHopThoaiIn(true)}>
            <Printer /> In báo cáo
          </Button>
          <Button variant="outline" onClick={xuatExcel}>
            <Download /> Xuất Excel
          </Button>
        </div>
      </div>

      {/* Phan I - Trang thai su dung hien tai */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-foreground">I. Trạng thái sử dụng hiện tại</h2>
          <Badge variant={soXeDangDi > 0 ? "warning" : "default"}>
            {soXeDangDi > 0 ? `${soXeDangDi} xe đang đi` : "Tất cả xe đang rảnh"}
          </Badge>
        </div>

        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm theo biển số, nhãn hiệu..."
            value={oTimKiemTrangThai}
            onChange={(e) => setOTimKiemTrangThai(e.target.value)}
            className="pl-9 pr-9"
          />
          {oTimKiemTrangThai && (
            <button
              type="button"
              aria-label="Xóa tìm kiếm"
              onClick={() => setOTimKiemTrangThai("")}
              className="absolute right-0 top-0 flex h-[46px] w-[42px] items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Biển số</TableHead>
                <TableHead>Nhãn hiệu</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Tài xế</TableHead>
                <TableHead>Nơi đến</TableHead>
                <TableHead>Ngày đi/về</TableHead>
                <TableHead>Số hiệu LĐX</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dangTaiTrangThai && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <div className="flex animate-pulse items-center gap-3 py-1">
                      <div className="h-3.5 w-20 rounded bg-muted" />
                      <div className="h-3.5 w-32 rounded bg-muted" />
                      <div className="h-3.5 w-24 rounded bg-muted" />
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {!dangTaiTrangThai && trangThai?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10">
                    <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
                      <Gauge className="size-8 text-muted-foreground/50" />
                      <p className="text-sm">
                        {tuKhoaTrangThai ? "Không có xe nào khớp tìm kiếm." : "Chưa có phương tiện nào đang hoạt động."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {trangThai?.map((xe) => (
                <TableRow key={xe.id}>
                  <TableCell className="whitespace-nowrap font-medium">{xe.bienSo}</TableCell>
                  <TableCell>{xe.nhanHieu}</TableCell>
                  <TableCell>
                    <Badge variant={xe.dangDi ? "warning" : "default"}>{xe.dangDi ? "Đang đi" : "Rảnh"}</Badge>
                  </TableCell>
                  <TableCell>{xe.lenhDieuXeDangDi?.laiXeHoTen ?? "-"}</TableCell>
                  <TableCell>{xe.lenhDieuXeDangDi?.noiDen ?? "-"}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {xe.lenhDieuXeDangDi
                      ? `${dinhDangNgay(xe.lenhDieuXeDangDi.ngayDi)} – ${dinhDangNgay(xe.lenhDieuXeDangDi.ngayVe)}`
                      : "-"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {xe.lenhDieuXeDangDi?.soHieu ?? "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Phan II - Thong ke tan suat su dung */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">II. Thống kê tần suất sử dụng</h2>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs text-muted-foreground">Chọn nhanh:</span>
          {NUT_PRESET.map((p) => (
            <Button
              key={p.ma}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const { tuNgay: t, denNgay: d } = tinhKhoangPreset(p.ma);
                setTuNgay(t);
                setDenNgay(d);
              }}
            >
              {p.nhan}
            </Button>
          ))}
          {(tuNgay || denNgay) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setTuNgay("");
                setDenNgay("");
              }}
            >
              <X /> Bỏ lọc ngày
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="tuNgayTanSuat" className="text-xs text-muted-foreground">
              Từ ngày đi
            </Label>
            <Input
              id="tuNgayTanSuat"
              type="date"
              className="w-auto"
              value={tuNgay}
              onChange={(e) => setTuNgay(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="denNgayTanSuat" className="text-xs text-muted-foreground">
              Đến ngày đi
            </Label>
            <Input
              id="denNgayTanSuat"
              type="date"
              className="w-auto"
              value={denNgay}
              onChange={(e) => setDenNgay(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sapXepTanSuat" className="text-xs text-muted-foreground">
              Sắp xếp theo
            </Label>
            <Select
              id="sapXepTanSuat"
              className="w-auto"
              value={sapXepTheo}
              onChange={(e) => setSapXepTheo(e.target.value as BoLocTanSuatPhuongTien["sapXepTheo"])}
            >
              <option value="luotDi">Số lượt đi</option>
              <option value="tongNgaySuDung">Tổng số ngày sử dụng</option>
            </Select>
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={huongSapXep === "desc" ? "Đang giảm dần - bấm để đổi sang tăng dần" : "Đang tăng dần - bấm để đổi sang giảm dần"}
            title={huongSapXep === "desc" ? "Giảm dần" : "Tăng dần"}
            onClick={() => setHuongSapXep((t) => (t === "desc" ? "asc" : "desc"))}
          >
            {huongSapXep === "desc" ? <ArrowDownWideNarrow /> : <ArrowUpWideNarrow />}
          </Button>

          {dangLamMoiTanSuat && <span className="text-xs text-muted-foreground">Đang cập nhật...</span>}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="overflow-hidden rounded-lg border border-border bg-background">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Biển số</TableHead>
                  <TableHead>Nhãn hiệu</TableHead>
                  <TableHead className="text-right">Lượt đi</TableHead>
                  <TableHead className="text-right">Tổng ngày sử dụng</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dangTaiTanSuat && (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <div className="flex animate-pulse items-center gap-3 py-1">
                        <div className="h-3.5 w-20 rounded bg-muted" />
                        <div className="h-3.5 w-32 rounded bg-muted" />
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {!dangTaiTanSuat && tanSuat?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                      Chưa có phương tiện nào trong danh mục.
                    </TableCell>
                  </TableRow>
                )}
                {tanSuat?.map((xe) => (
                  <TableRow key={xe.id}>
                    <TableCell className="whitespace-nowrap font-medium">{xe.bienSo}</TableCell>
                    <TableCell>{xe.nhanHieu}</TableCell>
                    <TableCell className="text-right">{xe.luotDi}</TableCell>
                    <TableCell className="text-right">{xe.tongNgaySuDung}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="rounded-lg border border-border bg-background p-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Top {Math.min(8, tanSuat?.length ?? 0)} xe theo {sapXepTheo === "luotDi" ? "số lượt đi" : "tổng số ngày sử dụng"}
            </p>
            <BieuDoTanSuat duLieu={tanSuat ?? []} tieuChi={sapXepTheo} />
          </div>
        </div>
      </section>

      <InBaoCaoPhuongTienDialog open={moHopThoaiIn} onOpenChange={setMoHopThoaiIn} boLoc={boLocTanSuat} />
    </div>
  );
}
