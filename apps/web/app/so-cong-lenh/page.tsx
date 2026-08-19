"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Download, Loader2, Search, X } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { useDanhSachSoCongLenh, xayQuerySoCongLenh } from "@/hooks/use-danh-sach-so-cong-lenh";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";

function dinhDangNgay(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN");
}

function HangDangTai() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell colSpan={8}>
            <div className="flex animate-pulse items-center gap-3 py-1">
              <div className="h-3.5 w-24 rounded bg-muted" />
              <div className="h-3.5 w-32 rounded bg-muted" />
              <div className="h-3.5 w-40 rounded bg-muted" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

// So cong lenh - bao cao TU SINH thay the "So ghi cong lenh" viet tay cua Van
// thu, KHONG co Tao/Sua/Xoa rieng (sua ghi chu qua form Lenh dieu cong tac).
// Xem NHAT_KY_QUYET_DINH.md muc "So cong lenh".
export default function TrangSoCongLenh() {
  const [trang, setTrang] = useState(1);
  const [kichThuoc, setKichThuoc] = useState(50);
  const [oTimKiem, setOTimKiem] = useState("");
  const [tuKhoa, setTuKhoa] = useState("");
  const [tuNgay, setTuNgay] = useState("");
  const [denNgay, setDenNgay] = useState("");

  const { data, isLoading, isFetching } = useDanhSachSoCongLenh({
    trang,
    kichThuoc,
    tuKhoa,
    tuNgay: tuNgay || undefined,
    denNgay: denNgay || undefined,
  });

  const tongTrang = data ? Math.max(1, Math.ceil(data.tong / data.kichThuoc)) : 1;

  useEffect(() => {
    const hen = setTimeout(() => {
      setTrang(1);
      setTuKhoa(oTimKiem.trim());
    }, 250);
    return () => clearTimeout(hen);
  }, [oTimKiem]);

  // To mau xen ke theo TUNG DOAN cong lenh cung 1 lenh dieu cong tac (giong
  // /giay-di-duong) - de nguoi dung de nhan biet cac dong nao cung 1 doan.
  let ldctTruoc: string | null = null;
  let nhomLe = false;
  const nhomMauDong = (data?.duLieu ?? []).map((dong) => {
    if (dong.lenhDieuCongTacId !== ldctTruoc) {
      nhomLe = !nhomLe;
      ldctTruoc = dong.lenhDieuCongTacId;
    }
    return nhomLe;
  });

  function xuatExcel() {
    const query = xayQuerySoCongLenh({ tuKhoa, tuNgay: tuNgay || undefined, denNgay: denNgay || undefined });
    window.open(`${API_BASE_URL}/so-cong-lenh/xuat-excel?${query.toString()}`, "_blank");
  }

  return (
    <div className="mx-auto w-full max-w-6xl p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Sổ theo dõi công lệnh</h1>
          <p className="text-sm text-muted-foreground">
            Báo cáo tự sinh từ Lệnh điều công tác và Công lệnh/Giấy đi đường — thay cho sổ ghi tay của Văn
            thư. Mỗi dòng là 1 người/1 công lệnh. Để sửa ghi chú, mở lại lệnh điều công tác tương ứng.
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
            placeholder="Tìm theo tên, số hiệu, địa điểm, mục đích..."
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
          <Label htmlFor="tuNgaySoCongLenh" className="text-xs text-muted-foreground">
            Từ ngày lập
          </Label>
          <Input
            id="tuNgaySoCongLenh"
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
          <Label htmlFor="denNgaySoCongLenh" className="text-xs text-muted-foreground">
            Đến ngày lập
          </Label>
          <Input
            id="denNgaySoCongLenh"
            type="date"
            className="w-auto"
            value={denNgay}
            onChange={(e) => {
              setTrang(1);
              setDenNgay(e.target.value);
            }}
          />
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

      <div className="overflow-hidden rounded-lg border border-border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">STT</TableHead>
              <TableHead>Ngày lập</TableHead>
              <TableHead>Số LĐCT</TableHead>
              <TableHead>Số Công lệnh/GĐĐ</TableHead>
              <TableHead>Họ tên</TableHead>
              <TableHead>Địa điểm</TableHead>
              <TableHead>Mục đích</TableHead>
              <TableHead>Ngày đi/về</TableHead>
              <TableHead>Ghi chú</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <HangDangTai />}

            {!isLoading && data?.duLieu.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="py-10">
                  <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
                    <BookOpen className="size-8 text-muted-foreground/50" />
                    <p className="text-sm">
                      {tuKhoa || tuNgay || denNgay
                        ? "Không có dòng nào khớp bộ lọc."
                        : "Chưa có công lệnh nào."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {data?.duLieu.map((dong, i) => (
              <TableRow key={dong.id} className={cn(nhomMauDong[i] && "bg-muted/40")}>
                <TableCell className="text-muted-foreground">{(trang - 1) * kichThuoc + i + 1}</TableCell>
                <TableCell className="whitespace-nowrap">{dinhDangNgay(dong.ngayLap)}</TableCell>
                <TableCell className="whitespace-nowrap font-medium">
                  <Link href={`/lenh-dieu-cong-tac/${dong.lenhDieuCongTacId}`} className="hover:underline">
                    {dong.soLdct}
                  </Link>
                </TableCell>
                <TableCell className="whitespace-nowrap">{dong.soCongLenh}</TableCell>
                <TableCell>{dong.hoTen}</TableCell>
                <TableCell>{dong.diaDiem}</TableCell>
                <TableCell>{dong.mucDich}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {dinhDangNgay(dong.ngayDi)} – {dinhDangNgay(dong.ngayVe)}
                </TableCell>
                <TableCell className="max-w-[16rem] whitespace-pre-wrap text-muted-foreground">
                  {dong.ghiChu}
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
    </div>
  );
}
