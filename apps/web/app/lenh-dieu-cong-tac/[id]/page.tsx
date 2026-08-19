"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Car, Pencil, Printer, Users, XCircle } from "lucide-react";
import { MA_QUYEN } from "@congtac/shared";
import { API_BASE_URL } from "@/lib/api";
import { useNguoiDungHienTai, coQuyen } from "@/hooks/use-nguoi-dung-hien-tai";
import { useChiTietLenhDieuCongTac } from "@/hooks/use-danh-sach-lenh-dieu-cong-tac";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { XemTruocPdfDialog } from "@/components/xem-truoc-pdf-dialog";
import { SuaLenhDieuCongTacDialog } from "../sua-lenh-dieu-cong-tac-dialog";
import { HuyLenhDieuCongTacDialog } from "../huy-lenh-dieu-cong-tac-dialog";

function dinhDangNgay(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN");
}

export default function TrangChiTietLenhDieuCongTac() {
  const { id } = useParams<{ id: string }>();
  const { data: nguoiDungHienTai } = useNguoiDungHienTai();
  const { data: lenh, isLoading } = useChiTietLenhDieuCongTac(id);

  const [moSua, setMoSua] = useState(false);
  const [moHuy, setMoHuy] = useState(false);
  const [xemTruoc, setXemTruoc] = useState<{ url: string; tieuDe: string } | null>(null);

  const coQuyenSua = coQuyen(nguoiDungHienTai, MA_QUYEN.CHUNG_TU_SUA);
  const coQuyenHuy = coQuyen(nguoiDungHienTai, MA_QUYEN.CHUNG_TU_HUY);
  const coQuyenIn = coQuyen(nguoiDungHienTai, MA_QUYEN.CHUNG_TU_IN);

  if (isLoading) {
    return <div className="mx-auto w-full max-w-4xl p-6 text-sm text-muted-foreground">Đang tải...</div>;
  }
  if (!lenh) {
    return <div className="mx-auto w-full max-w-4xl p-6 text-sm text-muted-foreground">Không tìm thấy chứng từ.</div>;
  }

  const thanhVienDangCo = (lenh.thanhVien ?? []).filter((tv) => !tv.daLoaiKhoiDoan);
  const thanhVienDaLoai = (lenh.thanhVien ?? []).filter((tv) => tv.daLoaiKhoiDoan);
  // Truong doan dung duoc o ca 2 loai mau in TRAM va PHAT_HANH_THU_HOI_VE_E
  // (CCCD thi CHI TRAM co) - xem NHAT_KY_QUYET_DINH.md muc "Mau in Phat
  // hanh, thu hoi ve e".
  const coTruongDoan = lenh.loaiMauIn === "TRAM" || lenh.loaiMauIn === "PHAT_HANH_THU_HOI_VE_E";
  const ldxHoatDong = lenh.lenhDieuXe?.find((l) => !l.daHuy);

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <Link
        href="/lenh-dieu-cong-tac"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Danh sách lệnh điều công tác
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Lệnh điều công tác {lenh.soHieu}
            {lenh.daHuy && <span className="ml-2 text-sm font-normal text-muted-foreground">· Đã hủy</span>}
          </h1>
          <p className="text-sm text-muted-foreground">{lenh.diaDiemCongTac}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {coQuyenIn && (
            <Button
              variant="outline"
              title="Xem/In (khổ A5, tự động A4 nếu đoàn đông người)"
              onClick={() =>
                setXemTruoc({
                  url: `${API_BASE_URL}/lenh-dieu-cong-tac/${lenh.id}/pdf-lenh`,
                  tieuDe: `Lệnh điều công tác + lệnh điều xe — ${lenh.soHieu}`,
                })
              }
            >
              <Printer /> In lệnh điều công tác + lệnh điều xe
            </Button>
          )}
          {coQuyenIn && (
            <Button
              variant="outline"
              title="Xem/In (khổ A5, 2 mặt/người)"
              onClick={() =>
                setXemTruoc({
                  url: `${API_BASE_URL}/lenh-dieu-cong-tac/${lenh.id}/pdf-giay-di-duong`,
                  tieuDe: `Công lệnh/Giấy đi đường — ${lenh.soHieu}`,
                })
              }
            >
              <Printer /> In toàn bộ công lệnh/giấy đi đường
            </Button>
          )}
          {coQuyenSua && !lenh.daHuy && (
            <Button variant="outline" onClick={() => setMoSua(true)}>
              <Pencil /> Sửa
            </Button>
          )}
          {coQuyenHuy && !lenh.daHuy && (
            <Button
              variant="outline"
              onClick={() => setMoHuy(true)}
              className="text-destructive hover:bg-destructive/10"
            >
              <XCircle /> Hủy
            </Button>
          )}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-x-6 gap-y-3 rounded-lg border border-border bg-background p-4 text-sm">
        <div>
          <div className="text-muted-foreground">Ngày lập</div>
          <div className="text-foreground">{dinhDangNgay(lenh.ngayKy)}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Ngày đi / về (chung đoàn)</div>
          <div className="text-foreground">
            {dinhDangNgay(lenh.ngayDi)} – {dinhDangNgay(lenh.ngayVe)}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground">Người ký</div>
          <div className="text-foreground">
            {lenh.nguoiKyHoTen} <span className="text-muted-foreground">({lenh.nguoiKyChucDanh})</span>
          </div>
        </div>
        {lenh.canCu && (
          <div>
            <div className="text-muted-foreground">Căn cứ</div>
            <div className="text-foreground">{lenh.canCu}</div>
          </div>
        )}
        <div className="col-span-2">
          <div className="text-muted-foreground">Mục đích</div>
          <div className="text-foreground">{lenh.mucDich}</div>
        </div>
      </div>

      {ldxHoatDong && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-border bg-background p-4 text-sm">
          <Car className="size-5 shrink-0 text-blue-600 dark:text-blue-400" />
          <div>
            <div className="text-foreground">
              Lệnh điều xe {ldxHoatDong.soHieu} — {ldxHoatDong.laiXeHoTen}
            </div>
            <div className="text-muted-foreground">
              <span className="font-mono">{ldxHoatDong.bienSo}</span> — {ldxHoatDong.nhanHieu}
            </div>
          </div>
        </div>
      )}

      <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-foreground">
        <Users className="size-4" /> Thành viên đoàn ({thanhVienDangCo.length})
      </div>
      <div className="overflow-hidden rounded-lg border border-border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">STT</TableHead>
              <TableHead>Họ tên / chức vụ</TableHead>
              {lenh.loaiMauIn === "TRAM" && <TableHead>CCCD</TableHead>}
              <TableHead>Ngày đi / về</TableHead>
              <TableHead>Công lệnh/GĐĐ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {thanhVienDangCo.map((tv, i) => (
              <TableRow key={tv.id}>
                <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                <TableCell>
                  <div className="text-foreground">
                    {tv.hoTen}
                    {coTruongDoan && tv.laTruongDoan && (
                      <span className="ml-1.5 text-xs font-normal text-blue-700 dark:text-blue-300">
                        · Trưởng đoàn
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{tv.chucVu}</p>
                </TableCell>
                {lenh.loaiMauIn === "TRAM" && (
                  <TableCell className="tabular-nums text-muted-foreground">{tv.cccd}</TableCell>
                )}
                <TableCell className="tabular-nums text-muted-foreground">
                  {tv.ngayDiRieng ? dinhDangNgay(tv.ngayDiRieng) : dinhDangNgay(lenh.ngayDi)}
                  {" – "}
                  {tv.ngayVeRieng ? dinhDangNgay(tv.ngayVeRieng) : dinhDangNgay(lenh.ngayVe)}
                  {(tv.ngayDiRieng || tv.ngayVeRieng) && (
                    <span className="ml-1 text-xs text-blue-700 dark:text-blue-300">(riêng)</span>
                  )}
                </TableCell>
                <TableCell className="tabular-nums text-foreground">
                  {tv.giayDiDuong?.soHieu ?? "—"}
                  {tv.giayDiDuong?.daHuy && (
                    <span className="ml-1.5 text-xs font-normal text-muted-foreground">· Đã hủy</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {thanhVienDaLoai.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 text-sm font-medium text-muted-foreground">
            Đã loại khỏi đoàn ({thanhVienDaLoai.length})
          </div>
          <div className="overflow-hidden rounded-lg border border-border/60 bg-muted/20 opacity-70">
            <Table>
              <TableBody>
                {thanhVienDaLoai.map((tv) => (
                  <TableRow key={tv.id}>
                    <TableCell>{tv.hoTen}</TableCell>
                    <TableCell className="text-muted-foreground">{tv.chucVu}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {tv.giayDiDuong?.soHieu} · Đã hủy
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <SuaLenhDieuCongTacDialog open={moSua} onOpenChange={setMoSua} lenhDieuCongTac={lenh} />
      <HuyLenhDieuCongTacDialog open={moHuy} onOpenChange={setMoHuy} lenhDieuCongTac={lenh} />
      <XemTruocPdfDialog
        open={!!xemTruoc}
        onOpenChange={(o) => !o && setXemTruoc(null)}
        url={xemTruoc?.url ?? null}
        tieuDe={xemTruoc?.tieuDe ?? ""}
      />
    </div>
  );
}
