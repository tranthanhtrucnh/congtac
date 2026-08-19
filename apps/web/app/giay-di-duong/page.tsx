"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown, FileText, Loader2, Printer, Search, X } from "lucide-react";
import { MA_QUYEN } from "@congtac/shared";
import { API_BASE_URL } from "@/lib/api";
import { useNguoiDungHienTai, coQuyen } from "@/hooks/use-nguoi-dung-hien-tai";
import { useDanhSachGiayDiDuong, type CotSapXepGiayDiDuong } from "@/hooks/use-danh-sach-giay-di-duong";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { XemTruocPdfDialog } from "@/components/xem-truoc-pdf-dialog";
import { cn, mauChuTheoLoaiMauIn, soHieuChiSo } from "@/lib/utils";

interface SapXepGiayDiDuong {
  cot: CotSapXepGiayDiDuong;
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
  cot: CotSapXepGiayDiDuong;
  sapXep: SapXepGiayDiDuong | null;
  onBam: (cot: CotSapXepGiayDiDuong) => void;
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

export default function TrangGiayDiDuong() {
  const { data: nguoiDungHienTai } = useNguoiDungHienTai();
  const [trang, setTrang] = useState(1);
  const [kichThuoc, setKichThuoc] = useState(20);
  const [oTimKiem, setOTimKiem] = useState("");
  const [tuKhoa, setTuKhoa] = useState("");
  const [daHuyLoc, setDaHuyLoc] = useState<"" | "true" | "false">("");
  const [sapXep, setSapXep] = useState<SapXepGiayDiDuong | null>(null);
  // Checkbox chon dong - ban dau (2026-08-10) chi de dong bo giao dien voi
  // /nhan-vien, sau do cung ngay nguoi dung yeu cau gan them hanh dong "In
  // da chon" (in gop nhieu GDD thanh 1 file PDF, moi GDD van du 2 mat truoc/
  // sau) - xem NHAT_KY_QUYET_DINH.md.
  const [dongChon, setDongChon] = useState<Set<string>>(new Set());
  const [xemTruoc, setXemTruoc] = useState<{ url: string; tieuDe: string } | null>(null);

  const { data, isLoading, isFetching } = useDanhSachGiayDiDuong({
    trang,
    kichThuoc,
    tuKhoa,
    daHuy: daHuyLoc === "" ? undefined : daHuyLoc === "true",
    sapXepTheo: sapXep?.cot,
    huongSapXep: sapXep?.huong,
  });

  function xepTheoCot(cot: CotSapXepGiayDiDuong) {
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
      truoc.size === data.duLieu.length ? new Set() : new Set(data.duLieu.map((gdd) => gdd.id)),
    );
  }

  const coQuyenIn = coQuyen(nguoiDungHienTai, MA_QUYEN.CHUNG_TU_IN);
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

  // To mau xen ke theo TUNG DOAN cong lenh cung 1 lenh dieu cong tac - khong
  // phai xen ke tung dong nhu zebra thuong. Cac dong lien tiep cung
  // lenhDieuCongTac.id se cung 1 mau; doi lenhDieuCongTac.id thi doi mau. Chi
  // "dep mat" khi cac dong cung doan nam lien nhau (dung voi sap xep mac
  // dinh theo so hieu, hoac sap xep theo cac cot khac co the lam xen ke).
  let ldctTruoc: string | null = null;
  let nhomLe = false;
  const nhomMauDong = (data?.duLieu ?? []).map((gdd) => {
    if (gdd.lenhDieuCongTac.id !== ldctTruoc) {
      nhomLe = !nhomLe;
      ldctTruoc = gdd.lenhDieuCongTac.id;
    }
    return nhomLe;
  });

  return (
    <div className="mx-auto w-full max-w-6xl p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">Công lệnh / Giấy đi đường</h1>
        <p className="text-sm text-muted-foreground">
          Sinh tự động khi lập lệnh điều công tác — mỗi thành viên trong đoàn có 1 công lệnh riêng. Xem
          thêm/sửa đoàn tại lệnh điều công tác liên kết.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên người, số hiệu..."
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

      {coQuyenIn && dongChon.size > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-md border border-border bg-muted/40 px-4 py-2.5">
          <span className="text-sm text-foreground">Đã chọn {dongChon.size} công lệnh</span>
          <Button
            size="sm"
            onClick={() =>
              setXemTruoc({
                url: `${API_BASE_URL}/giay-di-duong/in-nhieu?ids=${[...dongChon].join(",")}`,
                tieuDe: `Xem/In ${dongChon.size} công lệnh đã chọn`,
              })
            }
          >
            <Printer /> In đã chọn
          </Button>
        </div>
      )}

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
              <TieuDeSapXep nhan="Người được cấp" cot="nguoiDuocCap" sapXep={sapXep} onBam={xepTheoCot} />
              <TableHead>Lệnh điều công tác</TableHead>
              <TieuDeSapXep nhan="Nơi đến" cot="diaDiem" sapXep={sapXep} onBam={xepTheoCot} />
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <HangDangTai />}

            {!isLoading && data?.duLieu.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10">
                  <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
                    <FileText className="size-8 text-muted-foreground/50" />
                    <p className="text-sm">
                      {tuKhoa ? `Không có công lệnh nào khớp "${tuKhoa}".` : "Chưa có công lệnh nào."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {data?.duLieu.map((gdd, i) => (
              <TableRow
                key={gdd.id}
                className={cn(nhomMauDong[i] && "bg-muted/40", gdd.daHuy && "opacity-60")}
              >
                <TableCell>
                  <Checkbox
                    aria-label={`Chọn ${gdd.soHieu}`}
                    checked={dongChon.has(gdd.id)}
                    onCheckedChange={() => toggleChonMot(gdd.id)}
                  />
                </TableCell>
                {/* Mau chu theo loai mau in cua LDCT CHA (khong phai cua ban
                    than GDD - GDD khong co khai niem loai mau in rieng) -
                    dong bo voi danh sach LDCT de nguoi dung quet mat biet
                    ngay cong lenh nay thuoc doan loai nao. Nguoi dung yeu cau
                    2026-08-13, xem NHAT_KY_QUYET_DINH.md. */}
                {/* Chi hien phan SO (truoc "/"), an ky hieu de nhuong khong
                    gian cho cac cot khac - title = so hieu day du khi hover.
                    Nguoi dung yeu cau 2026-08-17, xem NHAT_KY_QUYET_DINH.md. */}
                <TableCell
                  className={`font-semibold tabular-nums ${mauChuTheoLoaiMauIn(gdd.lenhDieuCongTac.loaiMauIn) || "text-foreground"}`}
                  title={gdd.soHieu}
                >
                  {soHieuChiSo(gdd.soHieu)}
                  {gdd.daHuy && <span className="ml-1.5 text-xs font-normal text-muted-foreground">· Đã hủy</span>}
                </TableCell>
                <TableCell className={mauChuTheoLoaiMauIn(gdd.lenhDieuCongTac.loaiMauIn) || "text-foreground"}>
                  <div>{gdd.thanhVien.hoTen}</div>
                  <p className="text-xs text-muted-foreground">{gdd.thanhVien.chucVu}</p>
                </TableCell>
                <TableCell
                  className={mauChuTheoLoaiMauIn(gdd.lenhDieuCongTac.loaiMauIn) || "text-muted-foreground"}
                >
                  <Link href={`/lenh-dieu-cong-tac/${gdd.lenhDieuCongTac.id}`} className="hover:underline">
                    {gdd.lenhDieuCongTac.soHieu}
                  </Link>
                  <p className="text-xs">
                    {dinhDangNgay(gdd.lenhDieuCongTac.ngayDi)} – {dinhDangNgay(gdd.lenhDieuCongTac.ngayVe)}
                  </p>
                </TableCell>
                <TableCell className={mauChuTheoLoaiMauIn(gdd.lenhDieuCongTac.loaiMauIn) || "text-foreground"}>
                  {gdd.lenhDieuCongTac.diaDiemCongTac}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {coQuyenIn && (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Xem/In công lệnh"
                        title="Xem/In (khổ A5, 2 mặt)"
                        onClick={() =>
                          setXemTruoc({
                            url: `${API_BASE_URL}/giay-di-duong/${gdd.id}/pdf`,
                            tieuDe: `Công lệnh ${gdd.soHieu}`,
                          })
                        }
                        className="text-muted-foreground hover:bg-muted"
                      >
                        <Printer />
                      </Button>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/lenh-dieu-cong-tac/${gdd.lenhDieuCongTac.id}`}>Xem đoàn</Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {data && data.tong > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Trang {data.trang}/{tongTrang} — {data.tong} công lệnh
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

      <XemTruocPdfDialog
        open={!!xemTruoc}
        onOpenChange={(o) => !o && setXemTruoc(null)}
        url={xemTruoc?.url ?? null}
        tieuDe={xemTruoc?.tieuDe ?? ""}
      />
    </div>
  );
}
