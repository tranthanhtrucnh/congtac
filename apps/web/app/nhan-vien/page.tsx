"use client";

import { Fragment, useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Car,
  FileUp,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { MA_QUYEN } from "@congtac/shared";
import { useNguoiDungHienTai, coQuyen } from "@/hooks/use-nguoi-dung-hien-tai";
import {
  useDanhSachNhanVien,
  type CotSapXepNhanVien,
  type NhanVien,
} from "@/hooks/use-danh-sach-nhan-vien";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { TaoNhanVienDialog } from "./tao-nhan-vien-dialog";
import { SuaNhanVienDialog } from "./sua-nhan-vien-dialog";
import { XoaNhanVienDialog, type MucTieuXoa } from "./xoa-nhan-vien-dialog";
import { NhapNhanVienDialog } from "./nhap-nhan-vien-dialog";

function dinhDangNgay(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN");
}

function HangDangTai() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell colSpan={7}>
            <div className="flex animate-pulse items-center gap-3 py-1">
              <div className="h-3.5 w-40 rounded bg-muted" />
              <div className="h-3.5 w-24 rounded bg-muted" />
              <div className="h-3.5 w-20 rounded bg-muted" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

interface SapXepNhanVien {
  cot: CotSapXepNhanVien;
  huong: "asc" | "desc";
}

function TieuDeSapXep({
  nhan,
  cot,
  sapXep,
  onBam,
  className,
}: {
  nhan: string;
  cot: CotSapXepNhanVien;
  sapXep: SapXepNhanVien | null;
  onBam: (cot: CotSapXepNhanVien) => void;
  className?: string;
}) {
  const dangChon = sapXep?.cot === cot;
  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onBam(cot)}
        className={`inline-flex items-center gap-1 text-primary-foreground/80 hover:text-primary-foreground ${dangChon ? "font-semibold text-primary-foreground" : ""}`}
      >
        {nhan}
        {dangChon ? (
          sapXep!.huong === "asc" ? (
            <ArrowUp className="size-3.5" />
          ) : (
            <ArrowDown className="size-3.5" />
          )
        ) : (
          <ArrowUpDown className="size-3.5 text-primary-foreground/50" />
        )}
      </button>
    </TableHead>
  );
}

export default function TrangNhanVien() {
  const { data: nguoiDungHienTai } = useNguoiDungHienTai();
  const [trang, setTrang] = useState(1);
  const [kichThuoc, setKichThuoc] = useState(20);
  const [oTimKiem, setOTimKiem] = useState("");
  const [tuKhoa, setTuKhoa] = useState("");
  const [trangThaiLoc, setTrangThaiLoc] = useState<"" | "DANG_LAM_VIEC" | "NGUNG_LAM_VIEC">("");
  const [chiTaiXe, setChiTaiXe] = useState(false);
  const [sapXep, setSapXep] = useState<SapXepNhanVien | null>(null);

  const { data, isLoading, isFetching } = useDanhSachNhanVien({
    trang,
    kichThuoc,
    tuKhoa,
    trangThai: trangThaiLoc || undefined,
    chiTaiXe,
    sapXepTheo: sapXep?.cot,
    huongSapXep: sapXep?.huong,
  });

  function xepTheoCot(cot: CotSapXepNhanVien) {
    setTrang(1);
    setSapXep((truoc) => {
      if (!truoc || truoc.cot !== cot) return { cot, huong: "asc" };
      if (truoc.huong === "asc") return { cot, huong: "desc" };
      return null; // bam lan 3 -> ve lai sap xep mac dinh (nhom phong ban)
    });
  }

  const [moDialogTao, setMoDialogTao] = useState(false);
  const [moDialogNhap, setMoDialogNhap] = useState(false);
  const [nhanVienDangSua, setNhanVienDangSua] = useState<NhanVien | null>(null);
  const [mucTieuXoa, setMucTieuXoa] = useState<MucTieuXoa | null>(null);
  const [dongChon, setDongChon] = useState<Set<string>>(new Set());

  const coQuyenThem = coQuyen(nguoiDungHienTai, MA_QUYEN.NHAN_VIEN_THEM);
  const coQuyenSua = coQuyen(nguoiDungHienTai, MA_QUYEN.NHAN_VIEN_SUA);
  const coQuyenXoa = coQuyen(nguoiDungHienTai, MA_QUYEN.NHAN_VIEN_XOA);
  const coCotThaoTac = coQuyenSua || coQuyenXoa;

  const tongTrang = data ? Math.max(1, Math.ceil(data.tong / data.kichThuoc)) : 1;

  useEffect(() => {
    const hen = setTimeout(() => {
      setTrang(1);
      setTuKhoa(oTimKiem.trim());
    }, 250);
    return () => clearTimeout(hen);
  }, [oTimKiem]);

  useEffect(() => {
    setDongChon(new Set());
  }, [data]);

  function toggleChonMot(id: string) {
    setDongChon((truoc) => {
      const moi = new Set(truoc);
      if (moi.has(id)) moi.delete(id);
      else moi.add(id);
      return moi;
    });
  }

  function toggleChonTatCa() {
    if (!data) return;
    setDongChon((truoc) =>
      truoc.size === data.duLieu.length ? new Set() : new Set(data.duLieu.map((nv) => nv.id)),
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Danh mục Nhân viên</h1>
          <p className="text-sm text-muted-foreground">
            Dùng làm thành viên đoàn công tác và tài xế cho các chứng từ.
          </p>
        </div>
        {coQuyenThem && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setMoDialogNhap(true)}>
              <FileUp /> Nhập từ Excel/Word
            </Button>
            <Button onClick={() => setMoDialogTao(true)}>
              <Plus /> Thêm nhân viên
            </Button>
          </div>
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm theo họ tên hoặc CCCD (không cần gõ dấu)..."
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
          <option value="DANG_LAM_VIEC">Đang làm việc</option>
          <option value="NGUNG_LAM_VIEC">Ngừng làm việc</option>
        </Select>

        <label className="flex h-[46px] items-center gap-2 rounded-md border border-input px-3 text-sm text-foreground">
          <Checkbox
            checked={chiTaiXe}
            onCheckedChange={(c) => {
              setTrang(1);
              setChiTaiXe(!!c);
            }}
          />
          Chỉ tài xế
        </label>

        <Select className="w-auto" value={kichThuoc} onChange={(e) => { setTrang(1); setKichThuoc(Number(e.target.value)); }}>
          <option value={20}>20 dòng</option>
          <option value={50}>50 dòng</option>
          <option value={100}>100 dòng</option>
        </Select>
      </div>

      {coQuyenXoa && dongChon.size > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-md border border-border bg-muted/40 px-4 py-2.5">
          <span className="text-sm text-foreground">Đã chọn {dongChon.size} nhân viên</span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setMucTieuXoa({ loai: "nhieu", ids: [...dongChon] })}
          >
            <Trash2 /> Xóa đã chọn
          </Button>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              {coQuyenXoa && (
                <TableHead className="w-10">
                  <Checkbox
                    aria-label="Chọn tất cả"
                    checked={!!data && data.duLieu.length > 0 && dongChon.size === data.duLieu.length}
                    onCheckedChange={toggleChonTatCa}
                    className="border-primary-foreground/60 data-[state=checked]:border-primary-foreground data-[state=checked]:bg-primary-foreground data-[state=checked]:text-primary"
                  />
                </TableHead>
              )}
              <TableHead className="w-12">STT</TableHead>
              <TieuDeSapXep nhan="Họ tên" cot="hoTen" sapXep={sapXep} onBam={xepTheoCot} />
              <TieuDeSapXep nhan="Ngày sinh" cot="ngaySinh" sapXep={sapXep} onBam={xepTheoCot} />
              <TieuDeSapXep nhan="CCCD/CMND" cot="cccd" sapXep={sapXep} onBam={xepTheoCot} />
              <TieuDeSapXep nhan="Chức vụ / Đơn vị" cot="chucVu" sapXep={sapXep} onBam={xepTheoCot} />
              <TieuDeSapXep nhan="Trạng thái" cot="trangThai" sapXep={sapXep} onBam={xepTheoCot} />
              {coCotThaoTac && <TableHead className="text-right">Thao tác</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <HangDangTai />}

            {!isLoading && data?.duLieu.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-10">
                  <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
                    <Users className="size-8 text-muted-foreground/50" />
                    <p className="text-sm">
                      {tuKhoa ? `Không có nhân viên nào khớp "${tuKhoa}".` : "Chưa có nhân viên nào."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {(() => {
              let phongBanTruoc: string | null = null;
              const soCot = 2 + (coQuyenXoa ? 1 : 0) + (coCotThaoTac ? 1 : 0) + 4;
              return data?.duLieu.map((nv, i) => {
                const phongBanHienTai = nv.donViCongTac?.trim() || "Chưa phân loại";
                const hienThiNhomMoi = !sapXep && phongBanHienTai !== phongBanTruoc;
                phongBanTruoc = phongBanHienTai;

                return (
                  <Fragment key={nv.id}>
                    {hienThiNhomMoi && (
                      <TableRow className="border-b-0 bg-muted/50 hover:bg-muted/50">
                        <TableCell
                          colSpan={soCot}
                          className="py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                        >
                          {phongBanHienTai}
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow className={nv.laTaiXe ? "bg-blue-50/60 dark:bg-blue-950/20" : ""}>
                      {coQuyenXoa && (
                        <TableCell>
                          <Checkbox
                            aria-label={`Chọn ${nv.hoTen}`}
                            checked={dongChon.has(nv.id)}
                            onCheckedChange={() => toggleChonMot(nv.id)}
                          />
                        </TableCell>
                      )}
                      <TableCell className="text-muted-foreground">
                        {(trang - 1) * kichThuoc + i + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{nv.hoTen}</span>
                          {nv.laTaiXe && (
                            <span
                              aria-label="Tài xế"
                              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                            >
                              <Car className="size-3" />
                              Tài xế
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{dinhDangNgay(nv.ngaySinh)}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{nv.cccd}</TableCell>
                      <TableCell>
                        <p className="text-foreground">{nv.chucVu}</p>
                        {nv.donViCongTac && !nv.chucVu.includes(nv.donViCongTac.trim()) && (
                          <p className="text-xs text-muted-foreground">{nv.donViCongTac}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        {nv.trangThai === "DANG_LAM_VIEC" ? (
                          <Badge>Đang làm việc</Badge>
                        ) : (
                          <Badge variant="muted">Ngừng làm việc</Badge>
                        )}
                      </TableCell>
                      {coCotThaoTac && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {coQuyenSua && (
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Sửa thông tin"
                                onClick={() => setNhanVienDangSua(nv)}
                                className="text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40"
                              >
                                <Pencil />
                              </Button>
                            )}
                            {coQuyenXoa && (
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Xóa nhân viên"
                                onClick={() => setMucTieuXoa({ loai: "mot", nhanVien: nv })}
                                className="text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  </Fragment>
                );
              });
            })()}
          </TableBody>
        </Table>
      </div>

      {data && data.tong > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Trang {data.trang}/{tongTrang} — {data.tong} nhân viên
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

      <TaoNhanVienDialog open={moDialogTao} onOpenChange={setMoDialogTao} />
      <NhapNhanVienDialog open={moDialogNhap} onOpenChange={setMoDialogNhap} />
      <SuaNhanVienDialog
        open={!!nhanVienDangSua}
        onOpenChange={(o) => !o && setNhanVienDangSua(null)}
        nhanVien={nhanVienDangSua}
      />
      <XoaNhanVienDialog
        open={!!mucTieuXoa}
        onOpenChange={(o) => !o && setMucTieuXoa(null)}
        muc={mucTieuXoa}
        onXoaXong={() => setDongChon(new Set())}
      />
    </div>
  );
}
