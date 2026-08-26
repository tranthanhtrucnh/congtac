import { z } from "zod";
import { truyVanSoCongLenhSchema } from "./truy-van-so-cong-lenh.schema";

/**
 * 8 cột dữ liệu có thể bật/tắt khi in mẫu "Sổ theo dõi công lệnh" (STT luôn
 * hiện, không nằm trong danh sách này vì chỉ là số thứ tự dòng, không phải dữ
 * liệu). Người dùng yêu cầu 2026-08-26 cho Văn thư tự chọn cột khi in, xem
 * NHAT_KY_QUYET_DINH.md.
 */
export const COT_SO_THEO_DOI = [
  "ngayLap",
  "soLdct",
  "soCongLenh",
  "hoTen",
  "diaDiem",
  "mucDich",
  "ngayDiVe",
  "ghiChu",
] as const;

export type CotSoTheoDoi = (typeof COT_SO_THEO_DOI)[number];

/**
 * In mẫu "Sổ theo dõi công lệnh" (A4 ngang) - dùng GET + query string (mở tab
 * mới qua XemTruocPdfDialog, không gửi POST body được), theo đúng quy ước đã
 * dùng cho inNhieuGiayDiDuongSchema. Dùng CHUNG bộ lọc với
 * truyVanSoCongLenhSchema (tuNgay/denNgay/tuKhoa) - "dùng luôn bộ lọc đang áp
 * dụng trên màn hình" theo yêu cầu người dùng, KHÔNG có bộ lọc riêng cho bản
 * in (các nút nhanh Hôm nay/Tuần này/Tháng này/Quý này/Năm này chỉ điền lại 2
 * ô Từ ngày/Đến ngày sẵn có trên trang, không phải 1 bộ lọc tách biệt).
 *
 * Thêm nguoiLapSo (Văn thư tự gõ, mặc định là tên người đang đăng nhập) và
 * cot (danh sách cột được chọn, phân cách dấu phẩy). "Người ký duyệt" KHÔNG
 * nằm trong input người dùng chọn ở đây - luôn lấy từ Người ký đang
 * "DANG_KY_CHINH_THUC" tại thời điểm in (giống cách LĐCT/GĐĐ/LĐX đang làm,
 * xem lenh-dieu-cong-tac.service.ts) - không có lựa chọn riêng cho từng lần in
 * vì hệ thống chỉ có 1 người ký chính thức tại 1 thời điểm.
 */
export const inSoCongLenhSchema = truyVanSoCongLenhSchema.extend({
  nguoiLapSo: z.string().trim().min(1, "Chưa nhập tên người lập sổ"),
  cot: z
    .string()
    .min(1, "Chưa chọn cột nào để in")
    .transform((v) =>
      v
        .split(",")
        .map((s) => s.trim())
        .filter((s): s is CotSoTheoDoi => (COT_SO_THEO_DOI as readonly string[]).includes(s)),
    )
    .refine((cot) => cot.length > 0, "Chưa chọn cột nào để in"),
});

export type InSoCongLenhInput = z.infer<typeof inSoCongLenhSchema>;
