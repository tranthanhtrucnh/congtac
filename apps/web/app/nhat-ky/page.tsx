"use client";

import { useEffect, useState } from "react";
import { Download, Eye, History, Loader2, Search, X } from "lucide-react";
import {
  NHAN_NHOM_HANH_DONG,
  TAT_CA_NHOM_HANH_DONG,
  nhanHanhDong,
  type MaNhomHanhDong,
} from "@congtac/shared";
import { API_BASE_URL } from "@/lib/api";
import { useDanhSachNhatKy, xayQueryNhatKy, type DongNhatKy } from "@/hooks/use-danh-sach-nhat-ky";
import { useDanhSachNguoiDung } from "@/hooks/use-danh-sach-nguoi-dung";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { XemChiTietNhatKyDialog } from "./xem-chi-tiet-nhat-ky-dialog";

function dinhDangThoiGian(iso: string) {
  return new Date(iso).toLocaleString("vi-VN");
}

function HangDangTai() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell colSpan={6}>
            <div className="flex animate-pulse items-center gap-3 py-1">
              <div className="h-3.5 w-32 rounded bg-muted" />
              <div className="h-3.5 w-40 rounded bg-muted" />
              <div className="h-3.5 w-24 rounded bg-muted" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

// Nhat ky he thong - CHI XEM, khong Tao/Sua/Xoa (xem
// docs/QUY_TAC_NGHIEP_VU.md muc "Nhat ky he thong"). Chi Quan tri he thong
// thay muc menu nay (quyen nhat-ky.xem). Xem NHAT_KY_QUYET_DINH.md.
export default function TrangNhatKy() {
  const [trang, setTrang] = useState(1);
  const [kichThuoc, setKichThuoc] = useState(50);
  const [oTimKiem, setOTimKiem] = useState("");
  const [tuKhoa, setTuKhoa] = useState("");
  const [tuNgay, setTuNgay] = useState("");
  const [denNgay, setDenNgay] = useState("");
  const [nguoiDungId, setNguoiDungId] = useState("");
  const [nhomLoc, setNhomLoc] = useState<MaNhomHanhDong | "">("");
  const [dongDangXem, setDongDangXem] = useState<DongNhatKy | null>(null);

  // Danh sach nguoi dung cho o chon "Nguoi thuc hien" - tai dung hook da co
  // san o /nguoi-dung (trang 1, toi da 20 nguoi/trang - du dung voi quy mo
  // cong ty hien tai, xem NHAT_KY_QUYET_DINH.md).
  const { data: dsNguoiDung } = useDanhSachNguoiDung(1, "");

  const { data, isLoading, isFetching } = useDanhSachNhatKy({
    trang,
    kichThuoc,
    tuKhoa,
    tuNgay: tuNgay || undefined,
    denNgay: denNgay || undefined,
    nguoiDungId: nguoiDungId || undefined,
    nhom: nhomLoc || undefined,
  });

  const tongTrang = data ? Math.max(1, Math.ceil(data.tong / data.kichThuoc)) : 1;

  useEffect(() => {
    const hen = setTimeout(() => {
      setTrang(1);
      setTuKhoa(oTimKiem.trim());
    }, 250);
    return () => clearTimeout(hen);
  }, [oTimKiem]);

  function xuatExcel() {
    const query = xayQueryNhatKy({
      tuKhoa,
      tuNgay: tuNgay || undefined,
      denNgay: denNgay || undefined,
      nguoiDungId: nguoiDungId || undefined,
      nhom: nhomLoc || undefined,
    });
    window.open(`${API_BASE_URL}/nhat-ky/xuat-excel?${query.toString()}`, "_blank");
  }

  return (
    <div className="mx-auto w-full max-w-6xl p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Nhật ký hệ thống</h1>
          <p className="text-sm text-muted-foreground">
            Ghi nhận mọi thao tác quan trọng (tạo/sửa/hủy/in/cấp số/đăng nhập...) — chỉ xem, không sửa/xóa
            được qua giao diện.
          </p>
        </div>
        <Button variant="outline" onClick={xuatExcel} className="shrink-0">
          <Download /> Xuất Excel
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm theo số hiệu chứng từ (vd 15/LĐCT)..."
            value={oTimKiem}
            onChange={(e) => setOTimKiem(e.target.value)}
            className="pl-9 pr-9"
          />
          {isFetching ? (
            <Loader2
              aria-hidden
              className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
            />
          ) : (
            oTimKiem && (
              <button
                type="button"
                aria-label="Xóa tìm kiếm"
                onClick={() => setOTimKiem("")}
                className="absolute right-0 top-0 flex h-[46px] w-[42px] items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tuNgayNhatKy" className="text-xs text-muted-foreground">
            Từ ngày
          </Label>
          <Input
            id="tuNgayNhatKy"
            type="date"
            className="w-auto"
            value={tuNgay}
            onChange={(e) => {
              setTrang(1);
              setTuNgay(e.target.value);
            }}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="denNgayNhatKy" className="text-xs text-muted-foreground">
            Đến ngày
          </Label>
          <Input
            id="denNgayNhatKy"
            type="date"
            className="w-auto"
            value={denNgay}
            onChange={(e) => {
              setTrang(1);
              setDenNgay(e.target.value);
            }}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="nguoiThucHienNhatKy" className="text-xs text-muted-foreground">
            Người thực hiện
          </Label>
          <Select
            id="nguoiThucHienNhatKy"
            className="w-auto"
            value={nguoiDungId}
            onChange={(e) => {
              setTrang(1);
              setNguoiDungId(e.target.value);
            }}
          >
            <option value="">Tất cả</option>
            {dsNguoiDung?.duLieu.map((nd) => (
              <option key={nd.id} value={nd.id}>
                {nd.hoTen} ({nd.tenDangNhap})
              </option>
            ))}
          </Select>
        </div>

        <Select
          className="w-auto"
          value={kichThuoc}
          onChange={(e) => {
            setTrang(1);
            setKichThuoc(Number(e.target.value));
          }}
        >
          <option value={20}>20 dòng</option>
          <option value={50}>50 dòng</option>
          <option value={100}>100 dòng</option>
        </Select>
      </div>

      {/* Tag loc theo nhom hanh dong - giong pattern tag loc loaiMauIn o
          /lenh-dieu-cong-tac (thay vi dropdown ~25 muc roi rac). */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(["", ...TAT_CA_NHOM_HANH_DONG] as const).map((gt) => {
          const dangChon = nhomLoc === gt;
          return (
            <button
              key={gt || "tat-ca"}
              type="button"
              onClick={() => {
                setTrang(1);
                setNhomLoc(gt as MaNhomHanhDong | "");
              }}
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                dangChon
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              {gt === "" ? "Tất cả" : NHAN_NHOM_HANH_DONG[gt]}
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thời gian</TableHead>
              <TableHead>Người thực hiện</TableHead>
              <TableHead>Hành động</TableHead>
              <TableHead>Đối tượng</TableHead>
              <TableHead>Địa chỉ IP</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <HangDangTai />}

            {!isLoading && data?.duLieu.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10">
                  <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
                    <History className="size-8 text-muted-foreground/50" />
                    <p className="text-sm">
                      {tuKhoa || tuNgay || denNgay || nguoiDungId || nhomLoc
                        ? "Không có dòng nào khớp bộ lọc."
                        : "Chưa có nhật ký nào."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {data?.duLieu.map((dong) => (
              <TableRow key={dong.id}>
                <TableCell className="whitespace-nowrap tabular-nums text-muted-foreground">
                  {dinhDangThoiGian(dong.thoiGian)}
                </TableCell>
                <TableCell>
                  {dong.nguoiDung ? (
                    <>
                      <div>{dong.nguoiDung.hoTen}</div>
                      <p className="text-xs text-muted-foreground">{dong.nguoiDung.tenDangNhap}</p>
                    </>
                  ) : (
                    <span className="text-muted-foreground">Hệ thống</span>
                  )}
                </TableCell>
                <TableCell>{nhanHanhDong(dong.hanhDong)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {dong.doiTuong}
                  {dong.tomTat && <span className="text-foreground"> — {dong.tomTat}</span>}
                </TableCell>
                <TableCell className="text-muted-foreground">{dong.diaChiIp ?? "—"}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Xem chi tiết"
                    title="Xem chi tiết"
                    onClick={() => setDongDangXem(dong)}
                    className="text-muted-foreground hover:bg-muted"
                  >
                    <Eye />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {data && data.tong > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Trang {data.trang}/{tongTrang} — {data.tong} dòng
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={trang <= 1} onClick={() => setTrang((t) => t - 1)}>
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={trang >= tongTrang}
              onClick={() => setTrang((t) => t + 1)}
            >
              Sau
            </Button>
          </div>
        </div>
      )}

      <XemChiTietNhatKyDialog
        open={!!dongDangXem}
        onOpenChange={(o) => !o && setDongDangXem(null)}
        dong={dongDangXem}
      />
    </div>
  );
}
