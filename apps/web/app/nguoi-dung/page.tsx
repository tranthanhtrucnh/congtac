"use client";

import { useEffect, useState } from "react";
import { KeyRound, Lock, LockOpen, Pencil, Plus, Search, Users, X } from "lucide-react";
import { MA_QUYEN } from "@congtac/shared";
import { useNguoiDungHienTai, coQuyen } from "@/hooks/use-nguoi-dung-hien-tai";
import { useDanhSachNguoiDung, type NguoiDung } from "@/hooks/use-danh-sach-nguoi-dung";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { TaoTaiKhoanDialog } from "./tao-tai-khoan-dialog";
import { SuaNguoiDungDialog } from "./sua-nguoi-dung-dialog";
import { DatLaiMatKhauDialog } from "./dat-lai-mat-khau-dialog";
import { KhoaTaiKhoanDialog } from "./khoa-tai-khoan-dialog";

function layChuCaiDauTien(hoTen: string) {
  const phan = hoTen.trim().split(/\s+/);
  return (phan[phan.length - 1]?.[0] ?? "?").toUpperCase();
}

function HangDangTai() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell colSpan={4}>
            <div className="flex animate-pulse items-center gap-3 py-1">
              <div className="size-8 shrink-0 rounded-full bg-muted" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-32 rounded bg-muted" />
                <div className="h-3 w-20 rounded bg-muted" />
              </div>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

export default function TrangQuanLyNguoiDung() {
  const { data: nguoiDungHienTai } = useNguoiDungHienTai();
  const [trang, setTrang] = useState(1);
  const [oTimKiem, setOTimKiem] = useState("");
  const [tuKhoa, setTuKhoa] = useState("");
  const { data, isLoading } = useDanhSachNguoiDung(trang, tuKhoa);

  const [moDialogTao, setMoDialogTao] = useState(false);
  const [nguoiDungDangSua, setNguoiDungDangSua] = useState<NguoiDung | null>(null);
  const [nguoiDungDangDatLaiMk, setNguoiDungDangDatLaiMk] = useState<NguoiDung | null>(null);
  const [nguoiDungDangKhoa, setNguoiDungDangKhoa] = useState<NguoiDung | null>(null);

  const coQuyenThem = coQuyen(nguoiDungHienTai, MA_QUYEN.NGUOI_DUNG_THEM);
  const coQuyenSua = coQuyen(nguoiDungHienTai, MA_QUYEN.NGUOI_DUNG_SUA);
  const coQuyenKhoa = coQuyen(nguoiDungHienTai, MA_QUYEN.NGUOI_DUNG_KHOA);
  const coCotThaoTac = coQuyenSua || coQuyenKhoa;

  const tongTrang = data ? Math.max(1, Math.ceil(data.tong / data.kichThuoc)) : 1;

  // Tim kiem tuc thi - go la tim, khong can bam nut hay nhan Enter.
  useEffect(() => {
    const hen = setTimeout(() => {
      setTrang(1);
      setTuKhoa(oTimKiem.trim());
    }, 300);
    return () => clearTimeout(hen);
  }, [oTimKiem]);

  return (
    <div className="mx-auto w-full max-w-5xl p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Quản lý người dùng</h1>
          <p className="text-sm text-muted-foreground">
            Tài khoản đăng nhập hệ thống. Không có đăng ký công khai.
          </p>
        </div>
        {coQuyenThem && (
          <Button onClick={() => setMoDialogTao(true)}>
            <Plus /> Tạo tài khoản
          </Button>
        )}
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Tìm theo tên đăng nhập hoặc họ tên..."
          value={oTimKiem}
          onChange={(e) => setOTimKiem(e.target.value)}
          className="pl-9 pr-9"
        />
        {oTimKiem && (
          <button
            type="button"
            aria-label="Xóa tìm kiếm"
            onClick={() => setOTimKiem("")}
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
              <TableHead>Người dùng</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              {coCotThaoTac && <TableHead className="text-right">Thao tác</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <HangDangTai />}

            {!isLoading && data?.duLieu.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-10">
                  <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
                    <Users className="size-8 text-muted-foreground/50" />
                    <p className="text-sm">
                      {tuKhoa ? `Không có người dùng nào khớp "${tuKhoa}".` : "Chưa có người dùng nào."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {data?.duLieu.map((nd) => (
              <TableRow key={nd.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {layChuCaiDauTien(nd.hoTen)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{nd.hoTen}</p>
                      <p className="truncate font-mono text-xs text-muted-foreground">
                        {nd.tenDangNhap}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {nd.vaiTro.map((vt) => (
                      <Badge key={vt.id} variant="outline">
                        {vt.ten}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1.5 text-sm">
                    <span
                      aria-hidden
                      className={`size-1.5 rounded-full ${
                        nd.trangThai === "HOAT_DONG" ? "bg-success" : "bg-destructive"
                      }`}
                    />
                    <span
                      className={
                        nd.trangThai === "HOAT_DONG" ? "text-foreground" : "text-muted-foreground"
                      }
                    >
                      {nd.trangThai === "HOAT_DONG" ? "Hoạt động" : "Đã khóa"}
                    </span>
                  </span>
                </TableCell>
                {coCotThaoTac && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {coQuyenSua && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Sửa thông tin"
                            onClick={() => setNguoiDungDangSua(nd)}
                            className="text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40"
                          >
                            <Pencil />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Đặt lại mật khẩu"
                            onClick={() => setNguoiDungDangDatLaiMk(nd)}
                            className="text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <KeyRound />
                          </Button>
                        </>
                      )}
                      {coQuyenKhoa && (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={nd.trangThai === "HOAT_DONG" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                          onClick={() => setNguoiDungDangKhoa(nd)}
                          className={nd.trangThai === "HOAT_DONG" ? "text-destructive hover:bg-destructive/10" : ""}
                        >
                          {nd.trangThai === "HOAT_DONG" ? <Lock /> : <LockOpen />}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {data && data.tong > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Trang {data.trang}/{tongTrang} — {data.tong} người dùng
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={trang <= 1}
              onClick={() => setTrang((t) => t - 1)}
            >
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

      <TaoTaiKhoanDialog open={moDialogTao} onOpenChange={setMoDialogTao} />
      <SuaNguoiDungDialog
        open={!!nguoiDungDangSua}
        onOpenChange={(o) => !o && setNguoiDungDangSua(null)}
        nguoiDung={nguoiDungDangSua}
      />
      <DatLaiMatKhauDialog
        open={!!nguoiDungDangDatLaiMk}
        onOpenChange={(o) => !o && setNguoiDungDangDatLaiMk(null)}
        nguoiDung={nguoiDungDangDatLaiMk}
      />
      <KhoaTaiKhoanDialog
        open={!!nguoiDungDangKhoa}
        onOpenChange={(o) => !o && setNguoiDungDangKhoa(null)}
        nguoiDung={nguoiDungDangKhoa}
      />
    </div>
  );
}
