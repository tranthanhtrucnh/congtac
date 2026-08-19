"use client";

import { useState } from "react";
import { FileSpreadsheet, Upload } from "lucide-react";
import { goiApi, LoiApi } from "@/lib/api";
import { useLamMoiDanhSachNhanVien } from "@/hooks/use-danh-sach-nhan-vien";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type TrangThaiDongNhap = "HOP_LE" | "THIEU_DU_LIEU" | "SAI_DINH_DANG" | "TRUNG_CCCD" | "NGHI_TRUNG";

interface DongXemTruoc {
  soDong: number;
  hoTen: string;
  ngaySinh: string | null;
  ngaySinhGoc: string;
  cccd: string;
  chucVu: string;
  donViCongTac: string;
  trangThai: TrangThaiDongNhap;
  ghiChu?: string;
}

const NHAN_TRANG_THAI: Record<TrangThaiDongNhap, { nhan: string; variant: "default" | "destructive" | "outline" }> = {
  HOP_LE: { nhan: "Hợp lệ", variant: "default" },
  THIEU_DU_LIEU: { nhan: "Thiếu dữ liệu", variant: "destructive" },
  SAI_DINH_DANG: { nhan: "Sai định dạng", variant: "destructive" },
  TRUNG_CCCD: { nhan: "Trùng CCCD", variant: "destructive" },
  NGHI_TRUNG: { nhan: "Nghi trùng", variant: "outline" },
};

type Buoc = "chon-file" | "xem-truoc" | "ket-qua";

export function NhapNhanVienDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const lamMoiDanhSach = useLamMoiDanhSachNhanVien();
  const [buoc, setBuoc] = useState<Buoc>("chon-file");
  const [file, setFile] = useState<File | null>(null);
  const [dangXuLy, setDangXuLy] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);
  const [dongDuLieu, setDongDuLieu] = useState<DongXemTruoc[]>([]);
  const [dongDuocChon, setDongDuocChon] = useState<Set<number>>(new Set());
  const [ketQua, setKetQua] = useState<{ soLuongDaThem: number; soLuongBoQua: number } | null>(null);

  function dong() {
    onOpenChange(false);
    setBuoc("chon-file");
    setFile(null);
    setLoi(null);
    setDongDuLieu([]);
    setDongDuocChon(new Set());
    setKetQua(null);
  }

  async function xuLyXemTruoc() {
    if (!file) return;
    setDangXuLy(true);
    setLoi(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await goiApi<{ dongDuLieu: DongXemTruoc[] }>("/nhan-vien/nhap/xem-truoc", {
        method: "POST",
        body: formData,
      });
      setDongDuLieu(res.dongDuLieu);
      setDongDuocChon(new Set(res.dongDuLieu.filter((d) => d.trangThai === "HOP_LE").map((d) => d.soDong)));
      setBuoc("xem-truoc");
    } catch (loiGoi) {
      setLoi(loiGoi instanceof LoiApi ? loiGoi.message : "Không đọc được file, vui lòng thử lại");
    } finally {
      setDangXuLy(false);
    }
  }

  async function xuLyXacNhan() {
    setDangXuLy(true);
    setLoi(null);
    try {
      const dongGui = dongDuLieu
        .filter((d) => dongDuocChon.has(d.soDong))
        .map((d) => ({
          hoTen: d.hoTen,
          ngaySinh: d.ngaySinh,
          cccd: d.cccd,
          chucVu: d.chucVu,
          donViCongTac: d.donViCongTac,
        }));
      const res = await goiApi<{ soLuongDaThem: number; soLuongBoQua: number }>(
        "/nhan-vien/nhap/xac-nhan",
        { method: "POST", body: JSON.stringify({ dongDuLieu: dongGui }) },
      );
      setKetQua(res);
      await lamMoiDanhSach();
      setBuoc("ket-qua");
    } catch (loiGoi) {
      setLoi(loiGoi instanceof LoiApi ? loiGoi.message : "Không thể nhập dữ liệu, vui lòng thử lại");
    } finally {
      setDangXuLy(false);
    }
  }

  function toggleDong(soDong: number, coTheChon: boolean) {
    if (!coTheChon) return;
    setDongDuocChon((truoc) => {
      const moi = new Set(truoc);
      if (moi.has(soDong)) moi.delete(soDong);
      else moi.add(soDong);
      return moi;
    });
  }

  const soLuongTheoTrangThai = dongDuLieu.reduce<Record<string, number>>((acc, d) => {
    acc[d.trangThai] = (acc[d.trangThai] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : dong())}>
      <DialogContent
        className={buoc === "xem-truoc" ? "max-h-[85vh] max-w-3xl overflow-y-auto" : undefined}
      >
        {buoc === "chon-file" && (
          <>
            <DialogHeader>
              <DialogTitle>Nhập danh sách từ Excel/Word</DialogTitle>
              <DialogDescription>
                Hỗ trợ file .xlsx và .docx. File .doc cũ cần mở bằng Word, chọn "Save As" → Word
                Document (.docx) trước khi tải lên.
              </DialogDescription>
            </DialogHeader>

            <a
              href="/mau/mau-nhap-nhan-vien.xlsx"
              download
              className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <FileSpreadsheet className="size-4" />
              Tải file mẫu Excel
            </a>

            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border p-8 text-center hover:border-primary/40 hover:bg-muted/30">
              <Upload className="size-6 text-muted-foreground" />
              <span className="text-sm text-foreground">
                {file ? file.name : "Bấm để chọn file .xlsx hoặc .docx"}
              </span>
              <input
                type="file"
                accept=".xlsx,.docx"
                className="sr-only"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>

            {loi && (
              <div role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {loi}
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={dong}>
                Hủy
              </Button>
              <Button type="button" onClick={xuLyXemTruoc} disabled={!file || dangXuLy}>
                {dangXuLy ? "Đang đọc file..." : "Xem trước"}
              </Button>
            </DialogFooter>
          </>
        )}

        {buoc === "xem-truoc" && (
          <>
            <DialogHeader>
              <DialogTitle>Xem trước trước khi nhập</DialogTitle>
              <DialogDescription>
                {soLuongTheoTrangThai.HOP_LE ?? 0} hợp lệ · {soLuongTheoTrangThai.THIEU_DU_LIEU ?? 0}{" "}
                thiếu dữ liệu · {soLuongTheoTrangThai.SAI_DINH_DANG ?? 0} sai định dạng ·{" "}
                {soLuongTheoTrangThai.TRUNG_CCCD ?? 0} trùng CCCD · {soLuongTheoTrangThai.NGHI_TRUNG ?? 0}{" "}
                nghi trùng. Bỏ chọn dòng nào bạn không muốn nhập.
              </DialogDescription>
            </DialogHeader>

            <div className="overflow-hidden rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10" />
                    <TableHead>Họ tên</TableHead>
                    <TableHead>CCCD</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ghi chú</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dongDuLieu.map((d) => {
                    const coTheChon = d.trangThai === "HOP_LE" || d.trangThai === "NGHI_TRUNG";
                    return (
                      <TableRow key={d.soDong}>
                        <TableCell>
                          <Checkbox
                            checked={dongDuocChon.has(d.soDong)}
                            disabled={!coTheChon}
                            onCheckedChange={() => toggleDong(d.soDong, coTheChon)}
                          />
                        </TableCell>
                        <TableCell className="font-medium text-foreground">{d.hoTen || "—"}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {d.cccd || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={NHAN_TRANG_THAI[d.trangThai].variant}>
                            {NHAN_TRANG_THAI[d.trangThai].nhan}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{d.ghiChu ?? ""}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {loi && (
              <div role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {loi}
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setBuoc("chon-file")} disabled={dangXuLy}>
                Quay lại
              </Button>
              <Button type="button" onClick={xuLyXacNhan} disabled={dongDuocChon.size === 0 || dangXuLy}>
                {dangXuLy ? "Đang nhập..." : `Nhập ${dongDuocChon.size} dòng đã chọn`}
              </Button>
            </DialogFooter>
          </>
        )}

        {buoc === "ket-qua" && ketQua && (
          <>
            <DialogHeader>
              <DialogTitle>Đã nhập xong</DialogTitle>
              <DialogDescription>
                Đã thêm {ketQua.soLuongDaThem} nhân viên
                {ketQua.soLuongBoQua > 0 && `, bỏ qua ${ketQua.soLuongBoQua} dòng do trùng CCCD`}.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" onClick={dong}>
                Đóng
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
