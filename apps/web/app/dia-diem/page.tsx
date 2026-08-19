"use client";

import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { MA_QUYEN } from "@congtac/shared";
import { useNguoiDungHienTai, coQuyen } from "@/hooks/use-nguoi-dung-hien-tai";
import {
  useDanhSachDiaDiem,
  type CotSapXepDiaDiem,
  type DiaDiem,
} from "@/hooks/use-danh-sach-dia-diem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { TaoDiaDiemDialog } from "./tao-dia-diem-dialog";
import { SuaDiaDiemDialog } from "./sua-dia-diem-dialog";
import { XoaDiaDiemDialog, type MucTieuXoaDiaDiem } from "./xoa-dia-diem-dialog";

function HangDangTai() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell colSpan={7}>
            <div className="flex animate-pulse items-center gap-3 py-1">
              <div className="h-3.5 w-32 rounded bg-muted" />
              <div className="h-3.5 w-24 rounded bg-muted" />
              <div className="h-3.5 w-16 rounded bg-muted" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

interface SapXepDiaDiem {
  cot: CotSapXepDiaDiem;
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
  cot: CotSapXepDiaDiem;
  sapXep: SapXepDiaDiem | null;
  onBam: (cot: CotSapXepDiaDiem) => void;
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

export default function TrangDiaDiem() {
  const { data: nguoiDungHienTai } = useNguoiDungHienTai();
  const [trang, setTrang] = useState(1);
  const [kichThuoc, setKichThuoc] = useState(20);
  const [oTimKiem, setOTimKiem] = useState("");
  const [tuKhoa, setTuKhoa] = useState("");
  const [trangThaiLoc, setTrangThaiLoc] = useState<"" | "DANG_DUNG" | "NGUNG_DUNG">("");
  const [chiThuongDung, setChiThuongDung] = useState(false);
  const [sapXep, setSapXep] = useState<SapXepDiaDiem | null>(null);

  const { data, isLoading, isFetching } = useDanhSachDiaDiem({
    trang,
    kichThuoc,
    tuKhoa,
    trangThai: trangThaiLoc || undefined,
    chiThuongDung,
    sapXepTheo: sapXep?.cot,
    huongSapXep: sapXep?.huong,
  });

  function xepTheoCot(cot: CotSapXepDiaDiem) {
    setTrang(1);
    setSapXep((truoc) => {
      if (!truoc || truoc.cot !== cot) return { cot, huong: "asc" };
      if (truoc.huong === "asc") return { cot, huong: "desc" };
      return null;
    });
  }

  const [moDialogTao, setMoDialogTao] = useState(false);
  const [diaDiemDangSua, setDiaDiemDangSua] = useState<DiaDiem | null>(null);
  const [mucTieuXoa, setMucTieuXoa] = useState<MucTieuXoaDiaDiem | null>(null);
  const [dongChon, setDongChon] = useState<Set<string>>(new Set());

  const coQuyenThem = coQuyen(nguoiDungHienTai, MA_QUYEN.DIA_DIEM_THEM);
  const coQuyenSua = coQuyen(nguoiDungHienTai, MA_QUYEN.DIA_DIEM_SUA);
  const coQuyenXoa = coQuyen(nguoiDungHienTai, MA_QUYEN.DIA_DIEM_XOA);
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
      truoc.size === data.duLieu.length ? new Set() : new Set(data.duLieu.map((dd) => dd.id)),
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Danh mục Địa điểm</h1>
          <p className="text-sm text-muted-foreground">
            Nơi đến dùng cho Lệnh điều công tác và Công lệnh kiêm Giấy đi đường.
          </p>
        </div>
        {coQuyenThem && (
          <Button onClick={() => setMoDialogTao(true)}>
            <Plus /> Thêm địa điểm
          </Button>
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên hoặc cách ghi tắt..."
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
          <option value="DANG_DUNG">Đang dùng</option>
          <option value="NGUNG_DUNG">Ngừng dùng</option>
        </Select>

        <label className="flex h-[46px] items-center gap-2 rounded-md border border-input px-3 text-sm text-foreground">
          <Checkbox
            checked={chiThuongDung}
            onCheckedChange={(c) => {
              setTrang(1);
              setChiThuongDung(!!c);
            }}
          />
          Chỉ thường dùng
        </label>

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

      {coQuyenXoa && dongChon.size > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-md border border-border bg-muted/40 px-4 py-2.5">
          <span className="text-sm text-foreground">Đã chọn {dongChon.size} địa điểm</span>
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
              <TieuDeSapXep nhan="Tên địa điểm" cot="tenDayDu" sapXep={sapXep} onBam={xepTheoCot} />
              <TableHead>Cách ghi tắt khác</TableHead>
              <TieuDeSapXep nhan="Trạng thái" cot="trangThai" sapXep={sapXep} onBam={xepTheoCot} />
              {coCotThaoTac && <TableHead className="text-right">Thao tác</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <HangDangTai />}

            {!isLoading && data?.duLieu.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10">
                  <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
                    <MapPin className="size-8 text-muted-foreground/50" />
                    <p className="text-sm">
                      {tuKhoa ? `Không có địa điểm nào khớp "${tuKhoa}".` : "Chưa có địa điểm nào."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {data?.duLieu.map((dd, i) => (
              <TableRow key={dd.id}>
                {coQuyenXoa && (
                  <TableCell>
                    <Checkbox
                      aria-label={`Chọn ${dd.tenDayDu}`}
                      checked={dongChon.has(dd.id)}
                      onCheckedChange={() => toggleChonMot(dd.id)}
                    />
                  </TableCell>
                )}
                <TableCell className="text-muted-foreground">
                  {(trang - 1) * kichThuoc + i + 1}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {dd.thuongDung && (
                      <span aria-label="Thường dùng" className="text-amber-500">
                        <Star className="size-3.5 fill-current" />
                      </span>
                    )}
                    <span className="font-medium text-foreground">{dd.tenDayDu}</span>
                    {dd.diemDiMacDinh && (
                      <Badge variant="outline" className="text-[10px]">
                        Điểm đi mặc định
                      </Badge>
                    )}
                  </div>
                  {dd.ghiChu && <p className="text-xs text-muted-foreground">{dd.ghiChu}</p>}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {dd.cacTenTat.length > 0 ? dd.cacTenTat.join(", ") : "—"}
                </TableCell>
                <TableCell>
                  {dd.trangThai === "DANG_DUNG" ? (
                    <Badge>Đang dùng</Badge>
                  ) : (
                    <Badge variant="muted">Ngừng dùng</Badge>
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
                          onClick={() => setDiaDiemDangSua(dd)}
                          className="text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40"
                        >
                          <Pencil />
                        </Button>
                      )}
                      {coQuyenXoa && (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Xóa địa điểm"
                          onClick={() => setMucTieuXoa({ loai: "mot", diaDiem: dd })}
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
            Trang {data.trang}/{tongTrang} — {data.tong} địa điểm
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

      <TaoDiaDiemDialog open={moDialogTao} onOpenChange={setMoDialogTao} />
      <SuaDiaDiemDialog
        open={!!diaDiemDangSua}
        onOpenChange={(o) => !o && setDiaDiemDangSua(null)}
        diaDiem={diaDiemDangSua}
      />
      <XoaDiaDiemDialog
        open={!!mucTieuXoa}
        onOpenChange={(o) => !o && setMucTieuXoa(null)}
        muc={mucTieuXoa}
        onXoaXong={() => setDongChon(new Set())}
      />
    </div>
  );
}
