"use client";

import { Fragment, useEffect, useState } from "react";
import { AlertTriangle, Lock, Save, ShieldCheck, Undo2 } from "lucide-react";
import { MA_QUYEN, MA_VAI_TRO } from "@congtac/shared";
import { useNguoiDungHienTai, coQuyen } from "@/hooks/use-nguoi-dung-hien-tai";
import {
  useDanhSachVaiTro,
  useToanBoQuyen,
  useSuaQuyenVaiTro,
  type QuyenCuaVaiTro,
  type VaiTro,
} from "@/hooks/use-danh-sach-vai-tro";
import { LoiApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

// Nhan tieng Viet cho tung nhom quyen (truong `nhom` tren Quyen) - chi dung
// rieng o trang nay nen khong tach ra file dung chung (packages/shared) nhu
// da lam cho nhan-hanh-dong.ts (noi do can ca backend lan frontend cung doc).
const NHAN_NHOM_QUYEN: Record<string, string> = {
  "nguoi-dung": "Người dùng",
  "nhan-vien": "Nhân viên",
  "phuong-tien": "Phương tiện",
  "dia-diem": "Địa điểm",
  "chung-tu": "Chứng từ",
  "danh-so": "Đánh số chứng từ",
  "nguoi-ky": "Người ký",
  "don-vi": "Thông tin đơn vị",
  "nhat-ky": "Nhật ký hệ thống",
  "sao-luu": "Sao lưu / phục hồi",
  "vai-tro": "Vai trò & phân quyền",
};

function nhomQuyen(danhSach: QuyenCuaVaiTro[]) {
  const theoNhom = new Map<string, QuyenCuaVaiTro[]>();
  for (const q of danhSach) {
    const ds = theoNhom.get(q.nhom) ?? [];
    ds.push(q);
    theoNhom.set(q.nhom, ds);
  }
  return Array.from(theoNhom.entries()).sort(([a], [b]) =>
    (NHAN_NHOM_QUYEN[a] ?? a).localeCompare(NHAN_NHOM_QUYEN[b] ?? b, "vi"),
  );
}

function taoTapQuyen(vaiTro: VaiTro): Set<string> {
  return new Set(vaiTro.quyen.map((q) => q.ma));
}

function taiKhac(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return true;
  for (const ma of a) if (!b.has(ma)) return true;
  return false;
}

// Bang ma tran quyen x vai tro - hang = quyen (nhom theo module), cot = vai
// tro, o giao la checkbox. Quan tri he thong CO DINH (khong sua qua UI),
// 3 vai tro con lai sua duoc, moi cot co nut "Lưu thay đổi" rieng khi co
// thay doi chua luu. Xem docs/superpowers/specs/2026-08-17-vai-tro-phan-quyen-design.md.
export default function TrangVaiTro() {
  const { data: nguoiDungHienTai } = useNguoiDungHienTai();
  const { data: danhSachVaiTro, isLoading: dangTaiVaiTro, isError: loiVaiTro } = useDanhSachVaiTro();
  const { data: toanBoQuyen, isLoading: dangTaiQuyen, isError: loiQuyen } = useToanBoQuyen();
  const suaQuyen = useSuaQuyenVaiTro();

  const coQuyenSua = coQuyen(nguoiDungHienTai, MA_QUYEN.VAI_TRO_SUA);

  // Tap quyen dang chon (lam viec) cho tung vai tro - khoi tao 1 lan tu du
  // lieu server khi vai tro do lan dau xuat hien, khong ghi de lai neu nguoi
  // dung dang sua do (tranh mat thao tac khi refetch sau khi luu vai tro khac).
  const [chonTheoVaiTro, setChonTheoVaiTro] = useState<Record<string, Set<string>>>({});
  const [dangLuuVaiTroId, setDangLuuVaiTroId] = useState<string | null>(null);
  const [loiTheoVaiTro, setLoiTheoVaiTro] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!danhSachVaiTro) return;
    setChonTheoVaiTro((truoc) => {
      let doi = false;
      const moi = { ...truoc };
      for (const vt of danhSachVaiTro) {
        if (!(vt.id in moi)) {
          moi[vt.id] = taoTapQuyen(vt);
          doi = true;
        }
      }
      return doi ? moi : truoc;
    });
  }, [danhSachVaiTro]);

  function toggleQuyen(vaiTroId: string, quyenMa: string) {
    setChonTheoVaiTro((truoc) => {
      const hienTai = new Set(truoc[vaiTroId] ?? []);
      if (hienTai.has(quyenMa)) hienTai.delete(quyenMa);
      else hienTai.add(quyenMa);
      return { ...truoc, [vaiTroId]: hienTai };
    });
  }

  function huyThayDoi(vaiTro: VaiTro) {
    setChonTheoVaiTro((truoc) => ({ ...truoc, [vaiTro.id]: taoTapQuyen(vaiTro) }));
    setLoiTheoVaiTro((truoc) => ({ ...truoc, [vaiTro.id]: "" }));
  }

  async function luuVaiTro(vaiTroId: string) {
    setDangLuuVaiTroId(vaiTroId);
    setLoiTheoVaiTro((truoc) => ({ ...truoc, [vaiTroId]: "" }));
    try {
      await suaQuyen.mutateAsync({ vaiTroId, quyenMa: Array.from(chonTheoVaiTro[vaiTroId] ?? []) });
    } catch (loi) {
      setLoiTheoVaiTro((truoc) => ({
        ...truoc,
        [vaiTroId]: loi instanceof LoiApi ? loi.message : "Không thể lưu, vui lòng thử lại",
      }));
    } finally {
      setDangLuuVaiTroId(null);
    }
  }

  const dangTai = dangTaiVaiTro || dangTaiQuyen;
  const loi = loiVaiTro || loiQuyen;

  return (
    <div className="mx-auto w-full max-w-6xl p-6">
      <div className="mb-6 flex items-start gap-2">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
        <div>
          <h1 className="text-xl font-semibold text-foreground">Vai trò & phân quyền</h1>
          <p className="text-sm text-muted-foreground">
            Tích chọn quyền cho từng vai trò. Vai trò <strong>Quản trị hệ thống</strong> luôn có đủ mọi quyền, cố
            định — không sửa được qua giao diện. Gán vai trò cho tài khoản thực hiện ở trang Quản lý người dùng.
          </p>
          {!coQuyenSua && !dangTai && !loi && (
            <p className="mt-2 text-sm text-muted-foreground">
              Bạn chỉ có quyền xem — chỉ Quản trị hệ thống mới sửa được quyền của vai trò.
            </p>
          )}
        </div>
      </div>

      {dangTai && <div className="py-10 text-center text-muted-foreground">Đang tải...</div>}

      {loi && (
        <div className="py-10 text-center">
          <AlertTriangle className="mx-auto mb-2 size-6 text-destructive/70" />
          <p className="text-sm text-destructive">Không tải được dữ liệu, vui lòng thử lại.</p>
        </div>
      )}

      {danhSachVaiTro && toanBoQuyen && (
        <div className="overflow-hidden rounded-lg border border-border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[240px]">Quyền</TableHead>
                {danhSachVaiTro.map((vt) => {
                  const laQuanTri = vt.ma === MA_VAI_TRO.QUAN_TRI_HE_THONG;
                  const daThayDoi = !laQuanTri && taiKhac(chonTheoVaiTro[vt.id] ?? new Set(), taoTapQuyen(vt));
                  return (
                    <TableHead key={vt.id} className="min-w-[170px] text-center align-top">
                      <div className="flex flex-col items-center gap-1 py-1">
                        <span>{vt.ten}</span>
                        {laQuanTri && (
                          <span className="flex items-center gap-1 text-[10px] font-normal normal-case text-primary-foreground/70">
                            <Lock className="size-2.5" />
                            Cố định
                          </span>
                        )}
                        {!laQuanTri && coQuyenSua && daThayDoi && (
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-6 border-transparent bg-background px-2 text-[11px] font-normal normal-case text-foreground hover:bg-background/90"
                              disabled={dangLuuVaiTroId === vt.id}
                              onClick={() => luuVaiTro(vt.id)}
                            >
                              <Save className="size-3" />
                              {dangLuuVaiTroId === vt.id ? "Đang lưu..." : "Lưu thay đổi"}
                            </Button>
                            <button
                              type="button"
                              aria-label={`Hủy thay đổi quyền của ${vt.ten}`}
                              className="text-primary-foreground/70 hover:text-primary-foreground"
                              onClick={() => huyThayDoi(vt)}
                            >
                              <Undo2 className="size-3.5" />
                            </button>
                          </div>
                        )}
                        {loiTheoVaiTro[vt.id] && (
                          <span className="max-w-[150px] text-[10px] font-normal normal-case text-destructive">
                            {loiTheoVaiTro[vt.id]}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {nhomQuyen(toanBoQuyen).map(([nhom, dsQuyen]) => (
                <Fragment key={nhom}>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableCell
                      colSpan={1 + danhSachVaiTro.length}
                      className="py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      {NHAN_NHOM_QUYEN[nhom] ?? nhom}
                    </TableCell>
                  </TableRow>
                  {dsQuyen.map((q) => (
                    <TableRow key={q.ma}>
                      <TableCell className="text-sm text-foreground">{q.moTa ?? q.ma}</TableCell>
                      {danhSachVaiTro.map((vt) => {
                        const laQuanTri = vt.ma === MA_VAI_TRO.QUAN_TRI_HE_THONG;
                        const daChon = laQuanTri ? true : (chonTheoVaiTro[vt.id]?.has(q.ma) ?? false);
                        return (
                          <TableCell key={vt.id} className="text-center">
                            <Checkbox
                              checked={daChon}
                              disabled={laQuanTri || !coQuyenSua}
                              onCheckedChange={() => toggleQuyen(vt.id, q.ma)}
                              aria-label={`${q.moTa ?? q.ma} — ${vt.ten}`}
                            />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
