import { z } from "zod";

/**
 * "Mẫu in nháp" Lệnh điều công tác - Văn thư yêu cầu 2026-08-26: cần xem/in
 * thử layout của cả 3 loại chứng từ TRƯỚC KHI lập chính thức, số hiệu nhập
 * tay tự do, KHÔNG lưu vào CSDL, KHÔNG cấp số qua DanhSoService (không đụng
 * tới bộ đếm/lịch sử số chứng từ thật). Vì vậy schema này ĐỘC LẬP hoàn toàn
 * với taoLenhDieuCongTacSchema (không dùng nhanVienId tham chiếu Danh mục
 * Nhân viên - cho gõ tay tự do họ tên/chức vụ/CCCD, vì bản nháp có thể dùng
 * dữ liệu giả định chưa có trong hệ thống). Xem NHAT_KY_QUYET_DINH.md.
 *
 * 2 schema TÁCH RIÊNG dùng cùng 1 bộ trường (KHÔNG phải 1 schema dùng chung -
 * "thanhVien" có hình dạng KHÁC NHAU ở 2 nơi):
 * - `nhapLenhDieuCongTacFormSchema`: dùng ở FRONTEND (react-hook-form +
 *   zodResolver) - "thanhVien" là MẢNG object thật (useFieldArray thao tác
 *   trực tiếp trên mảng).
 * - `nhapLenhDieuCongTacSchema`: dùng ở BACKEND (GET query string, giống
 *   pattern in-nhieu-giay-di-duong.schema.ts, để dùng chung được
 *   XemTruocPdfDialog - chỉ nhận 1 url, không gửi POST body) - "thanhVien"
 *   đóng gói thành 1 CHUỖI JSON duy nhất (frontend tự JSON.stringify() mảng
 *   đã validate trước khi gắn vào query string).
 */
export const thanhVienNhapSchema = z.object({
  hoTen: z.string().trim().min(1, "Vui lòng nhập họ tên"),
  chucVu: z.string().trim().min(1, "Vui lòng nhập chức vụ"),
  cccd: z.string().trim().max(20, "CCCD tối đa 20 ký tự").optional().default(""),
  ngaySinh: z.coerce.date({ invalid_type_error: "Ngày sinh không hợp lệ" }).optional(),
  laTruongDoan: z.boolean().optional().default(false),
  ngayDiRieng: z.coerce.date({ invalid_type_error: "Ngày đi riêng không hợp lệ" }).optional(),
  ngayVeRieng: z.coerce.date({ invalid_type_error: "Ngày về riêng không hợp lệ" }).optional(),
  laTaiXe: z.boolean().optional().default(false),
});

const truongChungLenhDieuCongTacNhap = {
  soHieu: z.string().trim().min(1, "Vui lòng nhập số hiệu"),
  ngayKy: z.coerce.date({ invalid_type_error: "Ngày lập không hợp lệ" }),
  ngayDi: z.coerce.date({ invalid_type_error: "Ngày đi không hợp lệ" }),
  ngayVe: z.coerce.date({ invalid_type_error: "Ngày về không hợp lệ" }),
  diaDiemCongTac: z.string().trim().min(1, "Vui lòng nhập địa điểm công tác"),
  mucDich: z.string().trim().min(1, "Vui lòng nhập mục đích"),
  canCu: z.string().trim().optional(),
  loaiMauIn: z.enum(["TUYEN_THUONG", "TRAM", "PHAT_HANH_THU_HOI_VE_E"]).default("TUYEN_THUONG"),
};

export const nhapLenhDieuCongTacFormSchema = z
  .object({
    ...truongChungLenhDieuCongTacNhap,
    thanhVien: z.array(thanhVienNhapSchema).min(1, "Đoàn phải có ít nhất 1 thành viên"),
  })
  .refine((d) => d.ngayVe >= d.ngayDi, {
    message: "Ngày về không được sớm hơn ngày đi",
    path: ["ngayVe"],
  });

export type NhapLenhDieuCongTacFormInput = z.infer<typeof nhapLenhDieuCongTacFormSchema>;

export const nhapLenhDieuCongTacSchema = z
  .object({
    ...truongChungLenhDieuCongTacNhap,
    // Mang thanh vien dong goi JSON (xem doc comment tren dau file).
    thanhVien: z
      .string()
      .min(1, "Chưa có thành viên nào")
      .transform((v) => {
        try {
          return JSON.parse(v) as unknown;
        } catch {
          return null;
        }
      })
      .pipe(z.array(thanhVienNhapSchema).min(1, "Đoàn phải có ít nhất 1 thành viên")),
  })
  .refine((d) => d.ngayVe >= d.ngayDi, {
    message: "Ngày về không được sớm hơn ngày đi",
    path: ["ngayVe"],
  });

export type NhapLenhDieuCongTacInput = z.infer<typeof nhapLenhDieuCongTacSchema>;
