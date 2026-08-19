"use client";

import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { MA_QUYEN } from "@congtac/shared";
import { useNguoiDungHienTai, coQuyen } from "@/hooks/use-nguoi-dung-hien-tai";
import {
  useDanhSachPhuongTien,
  type CotSapXepPhuongTien,
  type PhuongTien,
} from "@/hooks/use-danh-sach-phuong-tien";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { TaoPhuongTienDialog } from "./tao-phuong-tien-dialog";
import { SuaPhuongTienDialog } from "./sua-phuong-tien-dialog";
import { XoaPhuongTienDialog, type MucTieuXoaPhuongTien } from "./xoa-phuong-tien-dialog";

function HangDangTai() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell colSpan={8}>
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

interface SapXepPhuongTien {
  cot: CotSapXepPhuongTien;
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
  cot: CotSapXepPhuongTien;
  sapXep: SapXepPhuongTien | null;
  onBam: (cot: CotSapXepPhuongTien) => void;
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

export default function TrangPhuongTien() {
  const { data: nguoiDungHienTai } = useNguoiDungHienTai();
  const [trang, setTrang] = useState(1);
  const [kichThuoc, setKichThuoc] = useState(20);
  const [oTimKiem, setOTimKiem] = useState("");
  const [tuKhoa, setTuKhoa] = useState("");
  const [trangThaiLoc, setTrangThaiLoc] = useState<"" | "DANG_SU_DUNG" | "NGUNG_SU_DUNG">("");
  const [sapXep, setSapXep] = useState<SapXepPhuongTien | null>(null);

  const { data, isLoading, isFetching } = useDanhSachPhuongTien({
    trang,
    kichThuoc,
    tuKhoa,
    trangThai: trangThaiLoc || undefined,
    sapXepTheo: sapXep?.cot,
    huongSapXep: sapXep?.huong,
  });

  function xepTheoCot(cot: CotSapXepPhuongTien) {
    setTrang(1);
    setSapXep((truoc) => {
      if (!truoc || truoc.cot !== cot) return { cot, huong: "asc" };
      if (truoc.huong === "asc") return { cot, huong: "desc" };
      return null;
    });
  }

  const [moDialogTao, setMoDialogTao] = useState(false);
  const [phuongTienDangSua, setPhuongTienDangSua] = useState<PhuongTien | null>(null);
  const [mucTieuXoa, setMucTieuXoa] = useState<MucTieuXoaPhuongTien | null>(null);
  const [dongChon, setDongChon] = useState<Set<string>>(new Set());

  const coQuyenThem = coQuyen(nguoiDungHienTai, MA_QUYEN.PHUONG_TIEN_THEM);
  const coQuyenSua = coQuyen(nguoiDungHienTai, MA_QUYEN.PHUONG_TIEN_SUA);
  const coQuyenXoa = coQuyen(nguoiDungHienTai, MA_QUYEN.PHUONG_TIEN_XOA);
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
      truoc.size === data.duLieu.length ? new Set() : new Set(data.duLieu.map((pt) => pt.id)),
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Danh mục Phương tiện</h1>
          <p className="text-sm text-muted-foreground">
            Dùng làm biển số xe cho Lệnh điều xe và các chứng từ liên quan.
          </p>
        </div>
        {coQuyenThem && (
          <Button onClick={() => setMoDialogTao(true)}>
            <Plus /> Thêm phương tiện
          </Button>
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm theo biển số..."
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
          <option value="DANG_SU_DUNG">Đang sử dụng</option>
          <option value="NGUNG_SU_DUNG">Ngừng sử dụng</option>
        </Select>

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
          <span className="text-sm text-foreground">Đã chọn {dongChon.size} phương tiện</span>
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
              <TieuDeSapXep nhan="Biển số" cot="bienSo" sapXep={sapXep} onBam={xepTheoCot} />
              <TieuDeSapXep nhan="Nhãn hiệu / dòng xe" cot="nhanHieu" sapXep={sapXep} onBam={xepTheoCot} />
              <TieuDeSapXep nhan="Loại xe" cot="loaiXe" sapXep={sapXep} onBam={xepTheoCot} />
              <TieuDeSapXep nhan="Số chỗ" cot="soCho" sapXep={sapXep} onBam={xepTheoCot} />
              <TableHead>Tài xế thường dùng</TableHead>
              <TieuDeSapXep nhan="Trạng thái" cot="trangThai" sapXep={sapXep} onBam={xepTheoCot} />
              {coCotThaoTac && <TableHead className="text-right">Thao tác</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <HangDangTai />}

            {!isLoading && data?.duLieu.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="py-10">
                  <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
                    <Truck className="size-8 text-muted-foreground/50" />
                    <p className="text-sm">
                      {tuKhoa ? `Không có phương tiện nào khớp "${tuKhoa}".` : "Chưa có phương tiện nào."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {data?.duLieu.map((pt, i) => (
              <TableRow key={pt.id}>
                {coQuyenXoa && (
                  <TableCell>
                    <Checkbox
                      aria-label={`Chọn ${pt.bienSo}`}
                      checked={dongChon.has(pt.id)}
                      onCheckedChange={() => toggleChonMot(pt.id)}
                    />
                  </TableCell>
                )}
                <TableCell className="text-muted-foreground">
                  {(trang - 1) * kichThuoc + i + 1}
                </TableCell>
                <TableCell className="font-mono font-medium text-foreground">{pt.bienSo}</TableCell>
                <TableCell className="text-foreground">{pt.nhanHieu}</TableCell>
                <TableCell className="text-muted-foreground">{pt.loaiXe || "—"}</TableCell>
                <TableCell className="text-muted-foreground">{pt.soCho ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">
                  {pt.taiXeThuongDung?.hoTen || "—"}
                </TableCell>
                <TableCell>
                  {pt.trangThai === "DANG_SU_DUNG" ? (
                    <Badge>Đang sử dụng</Badge>
                  ) : (
                    <Badge variant="muted">Ngừng sử dụng</Badge>
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
                          onClick={() => setPhuongTienDangSua(pt)}
                          className="text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40"
                        >
                          <Pencil />
                        </Button>
                      )}
                      {coQuyenXoa && (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Xóa phương tiện"
                          onClick={() => setMucTieuXoa({ loai: "mot", phuongTien: pt })}
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
            Trang {data.trang}/{tongTrang} — {data.tong} phương tiện
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

      <TaoPhuongTienDialog open={moDialogTao} onOpenChange={setMoDialogTao} />
      <SuaPhuongTienDialog
        open={!!phuongTienDangSua}
        onOpenChange={(o) => !o && setPhuongTienDangSua(null)}
        phuongTien={phuongTienDangSua}
      />
      <XoaPhuongTienDialog
        open={!!mucTieuXoa}
        onOpenChange={(o) => !o && setMucTieuXoa(null)}
        muc={mucTieuXoa}
        onXoaXong={() => setDongChon(new Set())}
      />
    </div>
  );
}
