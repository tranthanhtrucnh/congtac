"use client";

import { useState } from "react";
import { ClipboardList, FileText, Car } from "lucide-react";
import { MA_QUYEN } from "@congtac/shared";
import { useNguoiDungHienTai, coQuyen } from "@/hooks/use-nguoi-dung-hien-tai";
import { Button } from "@/components/ui/button";
import { XemTruocPdfDialog } from "@/components/xem-truoc-pdf-dialog";
import { NhapLenhDieuCongTacDialog } from "./nhap-lenh-dieu-cong-tac-dialog";
import { NhapGiayDiDuongDialog } from "./nhap-giay-di-duong-dialog";
import { NhapLenhDieuXeDialog } from "./nhap-lenh-dieu-xe-dialog";

/**
 * "Mẫu in nháp" - Văn thư xem/in thử layout của cả 3 loại chứng từ TRƯỚC KHI
 * lập chính thức: số hiệu gõ tay tự do, dữ liệu KHÔNG lưu vào CSDL, KHÔNG
 * cấp số qua DanhSoService (không đụng bộ đếm/lịch sử số chứng từ thật) -
 * "có thể xóa luôn" vì thực chất không có gì được lưu lại cả, mỗi lần bấm
 * "Xem/In nháp" chỉ sinh PDF tạm thời qua headless browser (CLAUDE.md quy
 * tắc #2) rồi thôi. Ban đầu dùng chung quyền In chứng từ (chung-tu.in) theo
 * quyết định 2026-08-26, sau đó TÁCH RIÊNG thành quyền chung-tu.in-nhap từ
 * 2026-08-27 (người dùng phát hiện vai trò Người xem lỡ được cấp chung-tu.in
 * nên vô tình thấy được cả mẫu in nháp) - xem NHAT_KY_QUYET_DINH.md.
 *
 * 3 dialog nháp là component RIÊNG BIỆT (không tái dùng dialog "Lập lệnh..."
 * thật) - quyết định có chủ đích để không đụng chạm vào luồng tạo chứng từ
 * chính thức đang chạy ổn định, đổi lại một ít trùng lặp code trường nhập.
 */
export default function TrangMauNhap() {
  const { data: nguoiDungHienTai } = useNguoiDungHienTai();
  const coQuyenIn = coQuyen(nguoiDungHienTai, MA_QUYEN.CHUNG_TU_IN_NHAP);

  const [moLdct, setMoLdct] = useState(false);
  const [moGdd, setMoGdd] = useState(false);
  const [moLdx, setMoLdx] = useState(false);
  const [xemTruoc, setXemTruoc] = useState<{ url: string; tieuDe: string } | null>(null);

  function moXemTruoc(url: string, tieuDe: string) {
    setXemTruoc({ url, tieuDe });
  }

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">Mẫu in nháp</h1>
        <p className="text-sm text-muted-foreground">
          Xem/in thử layout của 3 loại chứng từ trước khi lập chính thức. Số hiệu gõ tay tự do, dữ liệu{" "}
          <strong>không lưu vào hệ thống</strong> - đóng dialog là mất, không cần xóa gì thêm.
        </p>
      </div>

      {!coQuyenIn && (
        <div className="rounded-md border border-border bg-muted/40 px-4 py-2.5 text-sm text-muted-foreground">
          Bạn không có quyền xem/in mẫu in nháp nên không dùng được chức năng này.
        </div>
      )}

      {coQuyenIn && (
        <div className="grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => setMoLdct(true)}
            className="flex flex-col items-start gap-2 rounded-lg border border-border bg-background p-4 text-left transition-colors hover:bg-muted/50"
          >
            <ClipboardList className="size-6 text-primary" />
            <span className="text-sm font-semibold text-foreground">Lệnh điều công tác</span>
            <span className="text-xs text-muted-foreground">Đầy đủ bảng thành viên như form thật.</span>
          </button>

          <button
            type="button"
            onClick={() => setMoGdd(true)}
            className="flex flex-col items-start gap-2 rounded-lg border border-border bg-background p-4 text-left transition-colors hover:bg-muted/50"
          >
            <FileText className="size-6 text-primary" />
            <span className="text-sm font-semibold text-foreground">Công lệnh / Giấy đi đường</span>
            <span className="text-xs text-muted-foreground">1 người, 2 mặt.</span>
          </button>

          <button
            type="button"
            onClick={() => setMoLdx(true)}
            className="flex flex-col items-start gap-2 rounded-lg border border-border bg-background p-4 text-left transition-colors hover:bg-muted/50"
          >
            <Car className="size-6 text-primary" />
            <span className="text-sm font-semibold text-foreground">Lệnh điều xe</span>
            <span className="text-xs text-muted-foreground">Lái xe/biển số gõ tay tự do.</span>
          </button>
        </div>
      )}

      <NhapLenhDieuCongTacDialog open={moLdct} onOpenChange={setMoLdct} onXemTruoc={moXemTruoc} />
      <NhapGiayDiDuongDialog open={moGdd} onOpenChange={setMoGdd} onXemTruoc={moXemTruoc} />
      <NhapLenhDieuXeDialog open={moLdx} onOpenChange={setMoLdx} onXemTruoc={moXemTruoc} />

      <XemTruocPdfDialog
        open={!!xemTruoc}
        onOpenChange={(o) => !o && setXemTruoc(null)}
        url={xemTruoc?.url ?? null}
        tieuDe={xemTruoc?.tieuDe ?? ""}
      />
    </div>
  );
}
