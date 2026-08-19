"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, Loader2, Pencil, PenLine, Plus, Search, Trash2, X } from "lucide-react";
import { MA_QUYEN } from "@congtac/shared";
import { useNguoiDungHienTai, coQuyen } from "@/hooks/use-nguoi-dung-hien-tai";
import {
  useDanhSachNguoiKy,
  type NguoiKy,
  type TrangThaiNguoiKy,
} from "@/hooks/use-danh-sach-nguoi-ky";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { TaoNguoiKyDialog } from "./tao-nguoi-ky-dialog";
import { SuaNguoiKyDialog } from "./sua-nguoi-ky-dialog";
import { XoaNguoiKyDialog } from "./xoa-nguoi-ky-dialog";
import { DatChinhThucDialog } from "./dat-chinh-thuc-dialog";

function HangDangTai() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell colSpan={6}>
            <div className="flex animate-pulse items-center gap-3 py-1">
              <div className="h-3.5 w-32 rounded bg-muted" />
              <div className="h-3.5 w-40 rounded bg-muted" />
              <div className="h-3.5 w-20 rounded bg-muted" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

function TheTrangThai({ trangThai }: { trangThai: TrangThaiNguoiKy }) {
  if (trangThai === "DANG_KY_CHINH_THUC") {
    return (
      <Badge className="gap-1">
        <BadgeCheck className="size-3" />
        Đang ký chính thức
      </Badge>
    );
  }
  if (trangThai === "DU_PHONG") {
    return <Badge variant="outline">Dự phòng</Badge>;
  }
  return <Badge variant="muted">Ngừng sử dụng</Badge>;
}

export default function TrangNguoiKy() {
  const { data: nguoiDungHienTai } = useNguoiDungHienTai();
  const [trang, setTrang] = useState(1);
  const [kichThuoc, setKichThuoc] = useState(20);
  const [oTimKiem, setOTimKiem] = useState("");
  const [tuKhoa, setTuKhoa] = useState("");
  const [trangThaiLoc, setTrangThaiLoc] = useState<"" | TrangThaiNguoiKy>("");

  const { data, isLoading, isFetching } = useDanhSachNguoiKy({
    trang,
    kichThuoc,
    tuKhoa,
    trangThai: trangThaiLoc || undefined,
  });

  const [moDialogTao, setMoDialogTao] = useState(false);
  const [nguoiKyDangSua, setNguoiKyDangSua] = useState<NguoiKy | null>(null);
  const [nguoiKyDangXoa, setNguoiKyDangXoa] = useState<NguoiKy | null>(null);
  const [nguoiKyDatChinhThuc, setNguoiKyDatChinhThuc] = useState<NguoiKy | null>(null);

  const coQuyenThem = coQuyen(nguoiDungHienTai, MA_QUYEN.NGUOI_KY_THEM);
  const coQuyenSua = coQuyen(nguoiDungHienTai, MA_QUYEN.NGUOI_KY_SUA);
  const coQuyenXoa = coQuyen(nguoiDungHienTai, MA_QUYEN.NGUOI_KY_XOA);
  const coQuyenDatChinhThuc = coQuyen(nguoiDungHienTai, MA_QUYEN.NGUOI_KY_DAT_CHINH_THUC);
  const coCotThaoTac = coQuyenSua || coQuyenXoa || coQuyenDatChinhThuc;

  const nguoiDangChinhThuc = data?.duLieu.find((nk) => nk.trangThai === "DANG_KY_CHINH_THUC") ?? null;

  const tongTrang = data ? Math.max(1, Math.ceil(data.tong / data.kichThuoc)) : 1;

  useEffect(() => {
    const hen = setTimeout(() => {
      setTrang(1);
      setTuKhoa(oTimKiem.trim());
    }, 250);
    return () => clearTimeout(hen);
  }, [oTimKiem]);

  return (
    <div className="mx-auto w-full max-w-5xl p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Danh mục Người ký</h1>
          <p className="text-sm text-muted-foreground">
            Người ký cả 3 loại chứng từ (LĐCT/GĐĐ/LĐX) — chỉ 1 người đang ký chính thức tại 1 thời điểm.
          </p>
        </div>
        {coQuyenThem && (
          <Button onClick={() => setMoDialogTao(true)}>
            <Plus /> Thêm người ký
          </Button>
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm theo họ tên..."
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

        <Select
          className="w-auto"
          value={trangThaiLoc}
          onChange={(e) => {
            setTrang(1);
            setTrangThaiLoc(e.target.value as typeof trangThaiLoc);
          }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="DANG_KY_CHINH_THUC">Đang ký chính thức</option>
          <option value="DU_PHONG">Dự phòng</option>
          <option value="NGUNG_SU_DUNG">Ngừng sử dụng</option>
        </Select>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">STT</TableHead>
              <TableHead>Họ tên</TableHead>
              <TableHead>Chức danh khi ký</TableHead>
              <TableHead>Thể thức ký</TableHead>
              <TableHead>Trạng thái</TableHead>
              {coCotThaoTac && <TableHead className="text-right">Thao tác</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <HangDangTai />}

            {!isLoading && data?.duLieu.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10">
                  <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
                    <PenLine className="size-8 text-muted-foreground/50" />
                    <p className="text-sm">
                      {tuKhoa ? `Không có người ký nào khớp "${tuKhoa}".` : "Chưa có người ký nào."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {data?.duLieu.map((nk, i) => (
              <TableRow key={nk.id}>
                <TableCell className="text-muted-foreground">
                  {(trang - 1) * kichThuoc + i + 1}
                </TableCell>
                <TableCell>
                  <div className="font-medium text-foreground">{nk.nhanVien.hoTen}</div>
                  {nk.nhanVien.donViCongTac && (
                    <p className="text-xs text-muted-foreground">{nk.nhanVien.donViCongTac}</p>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">{nk.chucDanhKy}</TableCell>
                <TableCell className="text-muted-foreground">{nk.theThucKy}</TableCell>
                <TableCell>
                  <TheTrangThai trangThai={nk.trangThai} />
                </TableCell>
                {coCotThaoTac && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {coQuyenDatChinhThuc && nk.trangThai === "DU_PHONG" && (
                        <Button variant="outline" size="sm" onClick={() => setNguoiKyDatChinhThuc(nk)}>
                          Đặt làm chính thức
                        </Button>
                      )}
                      {coQuyenSua && (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Sửa thông tin"
                          onClick={() => setNguoiKyDangSua(nk)}
                          className="text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40"
                        >
                          <Pencil />
                        </Button>
                      )}
                      {coQuyenXoa && (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Xóa người ký"
                          onClick={() => setNguoiKyDangXoa(nk)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 />
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
            Trang {data.trang}/{tongTrang} — {data.tong} người ký
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

      <TaoNguoiKyDialog open={moDialogTao} onOpenChange={setMoDialogTao} />
      <SuaNguoiKyDialog
        open={!!nguoiKyDangSua}
        onOpenChange={(o) => !o && setNguoiKyDangSua(null)}
        nguoiKy={nguoiKyDangSua}
      />
      <XoaNguoiKyDialog
        open={!!nguoiKyDangXoa}
        onOpenChange={(o) => !o && setNguoiKyDangXoa(null)}
        nguoiKy={nguoiKyDangXoa}
      />
      <DatChinhThucDialog
        open={!!nguoiKyDatChinhThuc}
        onOpenChange={(o) => !o && setNguoiKyDatChinhThuc(null)}
        nguoiKy={nguoiKyDatChinhThuc}
        nguoiDangChinhThuc={nguoiDangChinhThuc}
      />
    </div>
  );
}
