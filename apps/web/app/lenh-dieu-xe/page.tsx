"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Car,
  Loader2,
  Lock,
  Pencil,
  Printer,
  Search,
  X,
  XCircle,
} from "lucide-react";
import { MA_QUYEN } from "@congtac/shared";
import { useNguoiDungHienTai, coQuyen } from "@/hooks/use-nguoi-dung-hien-tai";
import { API_BASE_URL } from "@/lib/api";
import {
  useDanhSachLenhDieuXe,
  type CotSapXepLenhDieuXe,
  type LenhDieuXe,
} from "@/hooks/use-danh-sach-lenh-dieu-xe";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { XemTruocPdfDialog } from "@/components/xem-truoc-pdf-dialog";
import { mauChuTheoLoaiMauIn, soHieuChiSo } from "@/lib/utils";
import { TaoLenhDieuXeDialog } from "./tao-lenh-dieu-xe-dialog";
import { SuaLenhDieuXeDialog } from "./sua-lenh-dieu-xe-dialog";
import { HuyLenhDieuXeDialog } from "./huy-lenh-dieu-xe-dialog";

interface SapXepLenhDieuXe {
  cot: CotSapXepLenhDieuXe;
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
  cot: CotSapXepLenhDieuXe;
  sapXep: SapXepLenhDieuXe | null;
  onBam: (cot: CotSapXepLenhDieuXe) => void;
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

function HangDangTai() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell colSpan={6}>
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

function dinhDangNgay(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN");
}

export default function TrangLenhDieuXe() {
  const { data: nguoiDungHienTai } = useNguoiDungHienTai();
  const [trang, setTrang] = useState(1);
  const [kichThuoc, setKichThuoc] = useState(20);
  const [oTimKiem, setOTimKiem] = useState("");
  const [tuKhoa, setTuKhoa] = useState("");
  const [daHuyLoc, setDaHuyLoc] = useState<"" | "true" | "false">("");
  const [sapXep, setSapXep] = useState<SapXepLenhDieuXe | null>(null);
  // Checkbox chon dong - hien chi de dong bo giao dien voi /nhan-vien, CHUA
  // gan hanh dong hang loat nao (nguoi dung xac nhan 2026-08-10, xem
  // NHAT_KY_QUYET_DINH.md).
  const [dongChon, setDongChon] = useState<Set<string>>(new Set());

  const { data, isLoading, isFetching } = useDanhSachLenhDieuXe({
    trang,
    kichThuoc,
    tuKhoa,
    daHuy: daHuyLoc === "" ? undefined : daHuyLoc === "true",
    sapXepTheo: sapXep?.cot,
    huongSapXep: sapXep?.huong,
  });

  function xepTheoCot(cot: CotSapXepLenhDieuXe) {
    setTrang(1);
    setSapXep((truoc) =>
      truoc?.cot === cot ? { cot, huong: truoc.huong === "asc" ? "desc" : "asc" } : { cot, huong: "asc" },
    );
  }

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
      truoc.size === data.duLieu.length ? new Set() : new Set(data.duLieu.map((ldx) => ldx.id)),
    );
  }

  const [moDialogTao, setMoDialogTao] = useState(false);
  const [lenhDangSua, setLenhDangSua] = useState<LenhDieuXe | null>(null);
  const [lenhDangHuy, setLenhDangHuy] = useState<LenhDieuXe | null>(null);
  const [xemTruoc, setXemTruoc] = useState<{ url: string; tieuDe: string } | null>(null);

  const coQuyenTao = coQuyen(nguoiDungHienTai, MA_QUYEN.CHUNG_TU_TAO);
  const coQuyenSua = coQuyen(nguoiDungHienTai, MA_QUYEN.CHUNG_TU_SUA);
  const coQuyenHuy = coQuyen(nguoiDungHienTai, MA_QUYEN.CHUNG_TU_HUY);
  const coQuyenIn = coQuyen(nguoiDungHienTai, MA_QUYEN.CHUNG_TU_IN);
  const coCotThaoTac = coQuyenSua || coQuyenHuy || coQuyenIn;

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

  return (
    <div className="mx-auto w-full max-w-6xl p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Lệnh điều xe</h1>
          <p className="text-sm text-muted-foreground">
            Văn thư lập và in trực tiếp, không cần chờ phê duyệt.
          </p>
        </div>
        {/* Tam khoa nut lap lenh dieu xe DOC LAP (2026-08-13, nguoi dung yeu
            cau) - huong dan lap qua Lenh dieu cong tac thay the (chon tai xe
            trong doan, he thong tu tao kem LDX, xem
            tao-lenh-dieu-cong-tac-dialog.tsx). CHUA xoa dialog/state
            moDialogTao/TaoLenhDieuXeDialog - chi disable nut, de bat lai chi
            can 1 dong khi het "tam thoi". Xem NHAT_KY_QUYET_DINH.md. */}
        {coQuyenTao && (
          <Button
            disabled
            title="Tạm khóa lập lệnh điều xe độc lập — lập kèm từ Lệnh điều công tác (chọn tài xế trong đoàn)"
          >
            <Lock /> Lập lệnh điều xe
          </Button>
        )}
      </div>

      {coQuyenTao && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          <span>
            Tạm thời không lập lệnh điều xe độc lập ở đây — hãy lập từ{" "}
            <strong>Lệnh điều công tác</strong>, chọn tài xế trong đoàn ở bước "Tài xế/Biển số", hệ thống sẽ
            tự tạo kèm lệnh điều xe.
          </span>
          <Button variant="outline" size="sm" asChild className="shrink-0">
            <Link href="/lenh-dieu-cong-tac">Đến Lệnh điều công tác</Link>
          </Button>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm theo số hiệu, lái xe, biển số..."
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
          value={daHuyLoc}
          onChange={(e) => {
            setTrang(1);
            setDaHuyLoc(e.target.value as typeof daHuyLoc);
          }}
        >
          <option value="">Tất cả</option>
          <option value="false">Chưa hủy</option>
          <option value="true">Đã hủy</option>
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

      <div className="overflow-hidden rounded-lg border border-border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  aria-label="Chọn tất cả"
                  checked={!!data && data.duLieu.length > 0 && dongChon.size === data.duLieu.length}
                  onCheckedChange={toggleChonTatCa}
                  className="border-primary-foreground/60 data-[state=checked]:border-primary-foreground data-[state=checked]:bg-primary-foreground data-[state=checked]:text-primary"
                />
              </TableHead>
              <TieuDeSapXep nhan="Số hiệu" cot="soHieu" sapXep={sapXep} onBam={xepTheoCot} />
              <TieuDeSapXep nhan="Lái xe / Biển số" cot="laiXe" sapXep={sapXep} onBam={xepTheoCot} />
              <TableHead>Nơi đến</TableHead>
              <TieuDeSapXep nhan="Ngày đi / về" cot="ngayDi" sapXep={sapXep} onBam={xepTheoCot} />
              {coCotThaoTac && <TableHead className="text-right">Thao tác</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <HangDangTai />}

            {!isLoading && data?.duLieu.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10">
                  <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
                    <Car className="size-8 text-muted-foreground/50" />
                    <p className="text-sm">
                      {tuKhoa ? `Không có lệnh điều xe nào khớp "${tuKhoa}".` : "Chưa có lệnh điều xe nào."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {data?.duLieu.map((ldx) => (
              <TableRow key={ldx.id} className={ldx.daHuy ? "opacity-60" : undefined}>
                <TableCell>
                  <Checkbox
                    aria-label={`Chọn ${ldx.soHieu}`}
                    checked={dongChon.has(ldx.id)}
                    onCheckedChange={() => toggleChonMot(ldx.id)}
                  />
                </TableCell>
                {/* Mau chu theo loai mau in cua LDCT CHA (chi co khi LDX sinh
                    kem tu 1 LDCT - lenh-dieu-xe.lenhDieuCongTac null neu la
                    LDX doc lap, mauChuTheoLoaiMauIn tu tra ve "" cho truong
                    hop nay) - dong bo voi danh sach LDCT/GDD. Nguoi dung yeu
                    cau 2026-08-13, xem NHAT_KY_QUYET_DINH.md. */}
                {/* Chi hien phan SO (truoc "/"), an ky hieu de nhuong khong
                    gian cho cac cot khac - title = so hieu day du khi hover.
                    Nguoi dung yeu cau 2026-08-17, xem NHAT_KY_QUYET_DINH.md. */}
                <TableCell
                  className={`font-semibold tabular-nums ${mauChuTheoLoaiMauIn(ldx.lenhDieuCongTac?.loaiMauIn) || "text-foreground"}`}
                  title={ldx.soHieu}
                >
                  {soHieuChiSo(ldx.soHieu)}
                  {ldx.daHuy && <span className="ml-1.5 text-xs font-normal text-muted-foreground">· Đã hủy</span>}
                </TableCell>
                <TableCell>
                  <div className={mauChuTheoLoaiMauIn(ldx.lenhDieuCongTac?.loaiMauIn) || "text-foreground"}>
                    {ldx.laiXeHoTen}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-mono font-medium text-foreground/80">{ldx.bienSo}</span> —{" "}
                    {ldx.nhanHieu}
                  </p>
                </TableCell>
                {/* Chi hien Noi den - bo Noi di khoi danh sach (2026-08-13,
                    nguoi dung yeu cau): Noi di hau nhu luon co dinh la tru
                    so cong ty, khong can nhac lai o moi dong, chi ton cho +
                    roi mat. Noi di van con day du trong chi tiet/mau in, chi
                    an o BANG danh sach nay. Xem NHAT_KY_QUYET_DINH.md. */}
                <TableCell className={mauChuTheoLoaiMauIn(ldx.lenhDieuCongTac?.loaiMauIn) || "text-foreground"}>
                  {ldx.noiDen}
                </TableCell>
                <TableCell
                  className={`tabular-nums ${mauChuTheoLoaiMauIn(ldx.lenhDieuCongTac?.loaiMauIn) || "text-muted-foreground"}`}
                >
                  {dinhDangNgay(ldx.ngayDi)} – {dinhDangNgay(ldx.ngayVe)}
                </TableCell>
                {coCotThaoTac && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {coQuyenIn && (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Xem/In lệnh điều xe"
                          title="Xem/In (khổ A5)"
                          onClick={() =>
                            setXemTruoc({
                              url: `${API_BASE_URL}/lenh-dieu-xe/${ldx.id}/pdf`,
                              tieuDe: `Lệnh điều xe ${ldx.soHieu}`,
                            })
                          }
                          className="text-muted-foreground hover:bg-muted"
                        >
                          <Printer />
                        </Button>
                      )}
                      {coQuyenSua && !ldx.daHuy && (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Sửa lệnh điều xe"
                          onClick={() => setLenhDangSua(ldx)}
                          className="text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40"
                        >
                          <Pencil />
                        </Button>
                      )}
                      {coQuyenHuy && !ldx.daHuy && !ldx.lenhDieuCongTacId && (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Hủy lệnh điều xe"
                          onClick={() => setLenhDangHuy(ldx)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <XCircle />
                        </Button>
                      )}
                      {coQuyenHuy && !ldx.daHuy && ldx.lenhDieuCongTacId && (
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled
                          aria-label="Không hủy riêng được - sinh kèm lệnh điều công tác"
                          title="Sinh kèm lệnh điều công tác - hủy qua lệnh điều công tác (loại tài xế khỏi đoàn)"
                          className="text-muted-foreground/40"
                        >
                          <Lock />
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
            Trang {data.trang}/{tongTrang} — {data.tong} lệnh điều xe
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

      <TaoLenhDieuXeDialog open={moDialogTao} onOpenChange={setMoDialogTao} />
      <SuaLenhDieuXeDialog
        open={!!lenhDangSua}
        onOpenChange={(o) => !o && setLenhDangSua(null)}
        lenhDieuXe={lenhDangSua}
      />
      <HuyLenhDieuXeDialog
        open={!!lenhDangHuy}
        onOpenChange={(o) => !o && setLenhDangHuy(null)}
        lenhDieuXe={lenhDangHuy}
      />
      <XemTruocPdfDialog
        open={!!xemTruoc}
        onOpenChange={(o) => !o && setXemTruoc(null)}
        url={xemTruoc?.url ?? null}
        tieuDe={xemTruoc?.tieuDe ?? ""}
      />
    </div>
  );
}
