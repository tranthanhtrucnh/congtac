"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Briefcase,
  Car,
  Copy,
  Eye,
  Loader2,
  Pencil,
  Plus,
  Printer,
  Search,
  Trash2,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { MA_QUYEN } from "@congtac/shared";
import { API_BASE_URL } from "@/lib/api";
import { useNguoiDungHienTai, coQuyen } from "@/hooks/use-nguoi-dung-hien-tai";
import {
  useDanhSachLenhDieuCongTac,
  type CotSapXepLenhDieuCongTac,
  type LenhDieuCongTac,
} from "@/hooks/use-danh-sach-lenh-dieu-cong-tac";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { XemTruocPdfDialog } from "@/components/xem-truoc-pdf-dialog";
import { mauChuTheoLoaiMauIn, soHieuChiSo } from "@/lib/utils";
import { TaoLenhDieuCongTacDialog } from "./tao-lenh-dieu-cong-tac-dialog";
import { SuaLenhDieuCongTacDialog } from "./sua-lenh-dieu-cong-tac-dialog";
import { HuyLenhDieuCongTacDialog } from "./huy-lenh-dieu-cong-tac-dialog";
import { XoaCungLenhDieuCongTacDialog } from "./xoa-cung-lenh-dieu-cong-tac-dialog";

interface SapXepLenhDieuCongTac {
  cot: CotSapXepLenhDieuCongTac;
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
  cot: CotSapXepLenhDieuCongTac;
  sapXep: SapXepLenhDieuCongTac | null;
  onBam: (cot: CotSapXepLenhDieuCongTac) => void;
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

/** Chuoi ten thanh vien cach nhau dau phay, uu tien truong doan len dau -
 * dung Array.sort on-dinh cua JS (khong xao tron thu tu cac nguoi con lai,
 * giu dung thu tu thuTu tu backend) - xem NHAT_KY_QUYET_DINH.md muc "Truong
 * doan + CCCD trong mau in LDCT". */
function tenThanhVien(ldct: LenhDieuCongTac): string {
  return [...(ldct.thanhVien ?? [])]
    .sort((a, b) => Number(b.laTruongDoan) - Number(a.laTruongDoan))
    .map((tv) => tv.hoTen)
    .join(", ");
}

/** Lenh dieu cong tac CHI co 1 minh tai xe (thanh vien duy nhat con lai
 * trong doan, va nguoi do dung la tai xe duoc chi dinh cua 1 LDX con dang
 * hoat dong cua chinh lenh nay) - truong hop tai xe di chung doan nhung ve
 * som/khac gio, phai lap 1 TO DOC LAP rieng chi ghi tai xe (khong dung
 * chung so hieu voi lenh ca doan). Nhan dien qua du lieu san co (khong phai
 * 1 field rieng trong DB, chi la 1 cach dung LDCT thong thuong) de danh dau
 * ro trong danh sach - giup nguoi dung nhin vao biet ngay day la lenh nen
 * dung nut Sao chep/Clone khi can lap lai cho dot cong tac khac, khong phai
 * lenh binh thuong bi thieu thanh vien. Nguoi dung yeu cau 2026-08-13, xem
 * NHAT_KY_QUYET_DINH.md. */
function laLenhTaiXeRieng(ldct: LenhDieuCongTac): boolean {
  const thanhVienDangCo = (ldct.thanhVien ?? []).filter((tv) => !tv.daLoaiKhoiDoan);
  if (thanhVienDangCo.length !== 1) return false;
  const ldxHoatDong = (ldct.lenhDieuXe ?? []).find((l) => !l.daHuy);
  return !!ldxHoatDong && ldxHoatDong.thanhVienTaiXeId === thanhVienDangCo[0].id;
}

export default function TrangLenhDieuCongTac() {
  const { data: nguoiDungHienTai } = useNguoiDungHienTai();
  const [trang, setTrang] = useState(1);
  const [kichThuoc, setKichThuoc] = useState(20);
  const [oTimKiem, setOTimKiem] = useState("");
  const [tuKhoa, setTuKhoa] = useState("");
  const [daHuyLoc, setDaHuyLoc] = useState<"" | "true" | "false">("");
  // Tag loc theo loai lenh dieu cong tac (Tuyen thuong/Tram/Ve e/Tai xe rieng)
  // - nguoi dung yeu cau 2026-08-14, xem NHAT_KY_QUYET_DINH.md. "" = tat ca.
  // "TAI_XE_RIENG" KHONG phai 1 gia tri cua loaiMauIn (dac diem tach biet,
  // truyen qua param chiTaiXeRieng rieng khi goi hook - xem ben duoi).
  const [loaiMauInLoc, setLoaiMauInLoc] = useState<
    "" | "TUYEN_THUONG" | "TRAM" | "PHAT_HANH_THU_HOI_VE_E" | "TAI_XE_RIENG"
  >("");
  const [sapXep, setSapXep] = useState<SapXepLenhDieuCongTac | null>(null);
  // Checkbox chon dong - tu 2026-08-10 chi dong bo giao dien voi /nhan-vien,
  // chua gan hanh dong nao; 2026-08-28 gan them nut "In da chon" (xem thanh
  // "Da chon N lenh dieu cong tac" ben duoi). Van CHUA co nut "Huy da chon".
  const [dongChon, setDongChon] = useState<Set<string>>(new Set());

  const { data, isLoading, isFetching } = useDanhSachLenhDieuCongTac({
    trang,
    kichThuoc,
    tuKhoa,
    daHuy: daHuyLoc === "" ? undefined : daHuyLoc === "true",
    loaiMauIn:
      loaiMauInLoc === "" || loaiMauInLoc === "TAI_XE_RIENG" ? undefined : loaiMauInLoc,
    chiTaiXeRieng: loaiMauInLoc === "TAI_XE_RIENG" ? true : undefined,
    sapXepTheo: sapXep?.cot,
    huongSapXep: sapXep?.huong,
  });

  function xepTheoCot(cot: CotSapXepLenhDieuCongTac) {
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
      truoc.size === data.duLieu.length ? new Set() : new Set(data.duLieu.map((ldct) => ldct.id)),
    );
  }

  const [moDialogTao, setMoDialogTao] = useState(false);
  const [lenhDangSua, setLenhDangSua] = useState<LenhDieuCongTac | null>(null);
  const [lenhDangHuy, setLenhDangHuy] = useState<LenhDieuCongTac | null>(null);
  const [lenhDangXoa, setLenhDangXoa] = useState<LenhDieuCongTac | null>(null);
  const [xemTruoc, setXemTruoc] = useState<{ url: string; tieuDe: string } | null>(null);
  // Lenh dang duoc "Sao chep" (khac null khi mo dialog Tao tu nut Sao chep o
  // hang, thay vi tu nut "Lap lenh dieu cong tac" o dau trang) - truyen
  // xuong TaoLenhDieuCongTacDialog de dien san form, xoa ve null luc dong
  // dialog (ca 2 duong mo deu dung chung 1 dialog). Xem
  // docs/superpowers/specs/2026-08-10-clone-lenh-dieu-cong-tac-design.md.
  const [ldctDangSaoChep, setLdctDangSaoChep] = useState<LenhDieuCongTac | null>(null);

  const coQuyenTao = coQuyen(nguoiDungHienTai, MA_QUYEN.CHUNG_TU_TAO);
  const coQuyenSua = coQuyen(nguoiDungHienTai, MA_QUYEN.CHUNG_TU_SUA);
  const coQuyenHuy = coQuyen(nguoiDungHienTai, MA_QUYEN.CHUNG_TU_HUY);
  const coQuyenIn = coQuyen(nguoiDungHienTai, MA_QUYEN.CHUNG_TU_IN);
  const coQuyenXoa = coQuyen(nguoiDungHienTai, MA_QUYEN.CHUNG_TU_XOA);

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
          <h1 className="text-xl font-semibold text-foreground">Lệnh điều công tác</h1>
          <p className="text-sm text-muted-foreground">
            Lưu sẽ tạo cùng lúc lệnh điều công tác, công lệnh/giấy đi đường cho từng thành viên và lệnh điều
            xe nếu đoàn có tài xế.
          </p>
        </div>
        {coQuyenTao && (
          <Button onClick={() => setMoDialogTao(true)}>
            <Plus /> Lập lệnh điều công tác
          </Button>
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm theo số hiệu, nơi đến..."
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

      {/* Tag loc theo loai lenh dieu cong tac - dong bo mau voi badge/nhan da
          dung trong bang (amber = Tram, violet = ve e, teal = tai xe rieng
          (giong mau icon Car o cot So hieu), trung tinh = Tuyen thuong/Tat
          ca) de nguoi dung nhan dien nhanh. "Tai xe rieng" la 1 tag RIENG,
          loai tru voi 4 tag con lai (dung chung 1 state loaiMauInLoc) du ve
          ban chat day la 1 dac diem khac chieu voi loaiMauIn - xem cach goi
          hook useDanhSachLenhDieuCongTac o tren (tach thanh 2 tham so
          loaiMauIn/chiTaiXeRieng). Nguoi dung yeu cau 2026-08-14, xem
          NHAT_KY_QUYET_DINH.md. */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(
          [
            { giaTri: "", nhan: "Tất cả" },
            { giaTri: "TUYEN_THUONG", nhan: "Tuyến thường" },
            { giaTri: "TRAM", nhan: "Trạm" },
            { giaTri: "PHAT_HANH_THU_HOI_VE_E", nhan: "Phát hành, thu hồi vé ế" },
            { giaTri: "TAI_XE_RIENG", nhan: "Tài xế riêng" },
          ] as const
        ).map((tuy) => {
          const dangChon = loaiMauInLoc === tuy.giaTri;
          const mauChon =
            tuy.giaTri === "TRAM"
              ? "border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-900 dark:text-amber-300"
              : tuy.giaTri === "PHAT_HANH_THU_HOI_VE_E"
                ? "border-violet-300 bg-violet-100 text-violet-800 dark:border-violet-800 dark:bg-violet-900 dark:text-violet-300"
                : tuy.giaTri === "TAI_XE_RIENG"
                  ? "border-teal-300 bg-teal-100 text-teal-800 dark:border-teal-800 dark:bg-teal-900 dark:text-teal-300"
                  : "border-primary bg-primary text-primary-foreground";
          return (
            <button
              key={tuy.giaTri}
              type="button"
              onClick={() => {
                setTrang(1);
                setLoaiMauInLoc(tuy.giaTri);
              }}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                dangChon
                  ? mauChon
                  : "border-border bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              {tuy.giaTri === "PHAT_HANH_THU_HOI_VE_E" && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src="/icons/ve-so.png" alt="" className="h-3 w-auto shrink-0" />
              )}
              {tuy.giaTri === "TAI_XE_RIENG" && <Car className="size-3.5 shrink-0" />}
              {tuy.nhan}
            </button>
          );
        })}
      </div>

      {/* In nhieu lenh da chon - checkbox chon dong da co san tu truoc (dong
          bo giao dien voi /nhan-vien) nhung chua gan hanh dong nao, nguoi
          dung yeu cau bo sung 2026-08-28 - xem NHAT_KY_QUYET_DINH.md muc "In
          nhieu lenh dieu cong tac cung luc". LUON in kho A5 cho ca file (da
          hoi lai nguoi dung) - xem doc comment o taoHtmlLenhDieuCongTacHangLoat,
          apps/api. */}
      {coQuyenIn && dongChon.size > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-md border border-border bg-muted/40 px-4 py-2.5">
          <span className="text-sm text-foreground">Đã chọn {dongChon.size} lệnh điều công tác</span>
          <Button
            size="sm"
            onClick={() =>
              setXemTruoc({
                url: `${API_BASE_URL}/lenh-dieu-cong-tac/in-nhieu?ids=${[...dongChon].join(",")}`,
                tieuDe: `Xem/In ${dongChon.size} lệnh điều công tác đã chọn`,
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
              <TableHead>Thành viên</TableHead>
              <TieuDeSapXep nhan="Nơi đến" cot="diaDiemCongTac" sapXep={sapXep} onBam={xepTheoCot} />
              <TieuDeSapXep nhan="Ngày đi / về" cot="ngayDi" sapXep={sapXep} onBam={xepTheoCot} />
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <HangDangTai />}

            {!isLoading && data?.duLieu.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10">
                  <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
                    <Briefcase className="size-8 text-muted-foreground/50" />
                    <p className="text-sm">
                      {tuKhoa
                        ? `Không có lệnh điều công tác nào khớp "${tuKhoa}".`
                        : "Chưa có lệnh điều công tác nào."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {data?.duLieu.map((ldct) => (
              <TableRow
                key={ldct.id}
                className={
                  [
                    ldct.daHuy ? "opacity-60" : "",
                    ldct.loaiMauIn === "TRAM" ? "bg-amber-50/60 dark:bg-amber-950/20" : "",
                    ldct.loaiMauIn === "PHAT_HANH_THU_HOI_VE_E" ? "bg-violet-50/60 dark:bg-violet-950/20" : "",
                  ]
                    .filter(Boolean)
                    .join(" ") || undefined
                }
              >
                <TableCell>
                  <Checkbox
                    aria-label={`Chọn ${ldct.soHieu}`}
                    checked={dongChon.has(ldct.id)}
                    onCheckedChange={() => toggleChonMot(ldct.id)}
                  />
                </TableCell>
                <TableCell className="font-semibold tabular-nums text-foreground">
                  {/* Chi hien phan SO (truoc "/"), an ky hieu ("/LĐCT"...) de
                      nhuong khong gian cho cac cot khac - Số hiệu DAY DU van
                      xem duoc qua tooltip (title) hoac mo chi tiet/mau in.
                      Nguoi dung yeu cau 2026-08-17, xem NHAT_KY_QUYET_DINH.md. */}
                  <Link
                    href={`/lenh-dieu-cong-tac/${ldct.id}`}
                    className={`hover:underline ${mauChuTheoLoaiMauIn(ldct.loaiMauIn)}`}
                    title={ldct.soHieu}
                  >
                    {soHieuChiSo(ldct.soHieu)}
                  </Link>
                  {/* Nhan "Trạm" (badge chu) + icon ve so "Vé ế" (anh, xem
                      duoi) de phan biet 3 loai mau in ngay trong danh sach,
                      khong can mo tung lenh de xem. Nguoi dung yeu cau
                      2026-08-10 (Tram, van la badge chu mau amber), doi sang
                      icon anh that cho vé ế 2026-08-13 (truoc do la badge
                      chu mau violet). Xem NHAT_KY_QUYET_DINH.md. */}
                  {ldct.loaiMauIn === "TRAM" && (
                    <span className="ml-1.5 inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                      Trạm
                    </span>
                  )}
                  {/* Icon anh ve so that (nguoi dung gui 2026-08-13, luu san
                      /public/icons/ve-so.png, cat goc bo tron) thay cho badge
                      chu "Vé ế" mau tim - dong bo cach lam voi icon xe "Tai xe
                      rieng" ben duoi (bo chu, chi con icon, co title hover).
                      Xem NHAT_KY_QUYET_DINH.md. */}
                  {ldct.loaiMauIn === "PHAT_HANH_THU_HOI_VE_E" && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src="/icons/ve-so.png"
                      alt="Phát hành, thu hồi vé ế"
                      title="Phát hành, thu hồi vé ế"
                      className="ml-1.5 inline-block h-4 w-auto shrink-0 align-text-bottom"
                    />
                  )}
                  {/* Danh dau "to doc lap chi ghi tai xe" - CHI icon xe (khong
                      chu, khong nen pill) theo yeu cau nguoi dung 2026-08-13
                      (gon hon ban dau la badge chu "Tai xe rieng" mau teal) -
                      giu mau teal + title de hover van biet y nghia. Xem
                      NHAT_KY_QUYET_DINH.md. */}
                  {laLenhTaiXeRieng(ldct) && (
                    <span
                      title="Tài xế riêng — lệnh chỉ có 1 mình tài xế"
                      className="ml-1.5 inline-flex shrink-0 items-center align-text-bottom text-teal-600 dark:text-teal-400"
                    >
                      <Car className="size-3.5" aria-label="Tài xế riêng" />
                    </span>
                  )}
                  {ldct.daHuy && <span className="ml-1.5 text-xs font-normal text-muted-foreground">· Đã hủy</span>}
                </TableCell>
                <TableCell className="max-w-[16rem]">
                  {/* Dao lai thu tu (2026-08-13, nguoi dung yeu cau): TEN
                      thanh vien la thong tin chinh (nguoi dung can biet AI
                      di, khong chi bao nhieu nguoi) - to mau theo loai giong
                      cac cot khac cua ban ghi. So luong "X nguoi" chi la
                      thong tin phu, chuyen xuong nho/muted ben duoi. Truoc
                      day nguoc lai: "X nguoi" to, ten nho/truncate - nguoi
                      dung phan hoi kho doc ten ngay. Xem NHAT_KY_QUYET_DINH.md. */}
                  {(ldct.thanhVien?.length ?? 0) > 0 ? (
                    <p
                      className={`truncate ${mauChuTheoLoaiMauIn(ldct.loaiMauIn) || "text-foreground"}`}
                      title={tenThanhVien(ldct)}
                    >
                      {tenThanhVien(ldct)}
                    </p>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                  <span className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="size-3 shrink-0" />
                    {ldct.soThanhVien ?? 0} người
                  </span>
                </TableCell>
                <TableCell className={mauChuTheoLoaiMauIn(ldct.loaiMauIn) || "text-foreground"}>
                  {ldct.diaDiemCongTac}
                </TableCell>
                <TableCell className={`tabular-nums ${mauChuTheoLoaiMauIn(ldct.loaiMauIn) || "text-muted-foreground"}`}>
                  {dinhDangNgay(ldct.ngayDi)} – {dinhDangNgay(ldct.ngayVe)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {coQuyenIn && (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="In riêng lệnh điều công tác"
                        title="In riêng lệnh điều công tác (không kèm lệnh điều xe)"
                        onClick={() =>
                          setXemTruoc({
                            url: `${API_BASE_URL}/lenh-dieu-cong-tac/${ldct.id}/pdf`,
                            tieuDe: `Lệnh điều công tác ${ldct.soHieu}`,
                          })
                        }
                        className="text-muted-foreground hover:bg-muted"
                      >
                        <Printer />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Xem chi tiết"
                      title="Xem chi tiết"
                      asChild
                      className="text-muted-foreground hover:bg-muted"
                    >
                      <Link href={`/lenh-dieu-cong-tac/${ldct.id}`}>
                        <Eye />
                      </Link>
                    </Button>
                    {coQuyenSua && !ldct.daHuy && (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Sửa lệnh điều công tác"
                        title="Sửa lệnh điều công tác"
                        onClick={() => setLenhDangSua(ldct)}
                        className="text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40"
                      >
                        <Pencil />
                      </Button>
                    )}
                    {coQuyenTao && (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Sao chép lệnh điều công tác"
                        title="Lập lệnh mới, điền sẵn địa điểm/mục đích/ngày đi-về từ lệnh này"
                        onClick={() => {
                          setLdctDangSaoChep(ldct);
                          setMoDialogTao(true);
                        }}
                        className="text-muted-foreground hover:bg-muted"
                      >
                        <Copy />
                      </Button>
                    )}
                    {coQuyenHuy && !ldct.daHuy && (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Hủy lệnh điều công tác"
                        title="Hủy (giữ lại trong hệ thống, chỉ đánh dấu đã hủy)"
                        onClick={() => setLenhDangHuy(ldct)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <XCircle />
                      </Button>
                    )}
                    {/* Xoa cung - CHI hien khi dang la so MOI NHAT cua nam
                        (laSoMoiNhat, server tinh san o danhSach()) - xem
                        xoa-cung-lenh-dieu-cong-tac-dialog.tsx. Server van tu
                        kiem tra lai dieu kien nay, day chi la goi y hien/an
                        nut. KHONG loai tru lenh da Huy (truoc day co dieu
                        kien !ldct.daHuy o day, gay ket dinh vinh vien: neu
                        chung tu dang giu so MOI NHAT bi Huy thi khong bao gio
                        xoa cung duoc no nua vi nut bi an, va cac chung tu so
                        thap hon cung ket theo vi khong ai la "so moi nhat" -
                        Huy KHONG the hoan tac nen day la ngo cut vinh vien.
                        Nguoi dung phat hien 2026-08-28, xem NHAT_KY_QUYET_DINH.md). */}
                    {coQuyenXoa && ldct.laSoMoiNhat && (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Xóa cứng lệnh điều công tác"
                        title="Xóa cứng (mất hẳn khỏi hệ thống, khác với Hủy)"
                        onClick={() => setLenhDangXoa(ldct)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 />
                      </Button>
                    )}
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
            Trang {data.trang}/{tongTrang} — {data.tong} lệnh điều công tác
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

      <TaoLenhDieuCongTacDialog
        open={moDialogTao}
        onOpenChange={(o) => {
          setMoDialogTao(o);
          // Dong dialog (ca luc Luu thanh cong lan bam Huy) - xoa lenh dang
          // sao chep de lan mo tiep theo (du la tu nut "Lap" hay "Sao chep"
          // khac) khong bi dinh du lieu cu.
          if (!o) setLdctDangSaoChep(null);
        }}
        duLieuSaoChep={ldctDangSaoChep}
      />
      <SuaLenhDieuCongTacDialog
        open={!!lenhDangSua}
        onOpenChange={(o) => !o && setLenhDangSua(null)}
        lenhDieuCongTac={lenhDangSua}
      />
      <HuyLenhDieuCongTacDialog
        open={!!lenhDangHuy}
        onOpenChange={(o) => !o && setLenhDangHuy(null)}
        lenhDieuCongTac={lenhDangHuy}
      />
      <XoaCungLenhDieuCongTacDialog
        open={!!lenhDangXoa}
        onOpenChange={(o) => !o && setLenhDangXoa(null)}
        lenhDieuCongTac={lenhDangXoa}
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
