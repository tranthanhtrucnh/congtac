import { z } from "zod";
import { thanhVienLenhDieuCongTacSchema } from "./thanh-vien-lenh-dieu-cong-tac.schema";
import { changCongTacSchema } from "./chang-cong-tac.schema";

// Lap LDCT la 1 form duy nhat - Luu tao dong thoi LDCT + 1 GiayDiDuong cho
// moi thanh vien + 1 LenhDieuXe neu co chon tai xe + bien so (xem
// NHAT_KY_QUYET_DINH.md muc "LDCT sinh kem GDD va LDX").
export const taoLenhDieuCongTacSchema = z
  .object({
    canCu: z.string().trim().optional(),
    // Tuy chon - de trong thi backend tu dung "noi di mac dinh" tu Danh muc
    // Dia diem (diemDiMacDinh, giu nguyen hanh vi cu). Them 2026-08-10 de
    // nguoi lap co the ghi de rieng cho tung lenh (vd doan xuat phat tu noi
    // khac voi tru so chinh) ma khong phai sua tay tung Giay di duong sau
    // khi tao - xem NHAT_KY_QUYET_DINH.md.
    noiDi: z.string().trim().optional(),
    diaDiemCongTac: z.string().trim().min(1, "Vui lòng nhập địa điểm công tác"),
    mucDich: z.string().trim().min(1, "Vui lòng nhập mục đích"),
    // Ghi chu tu do CHUNG cho ca doan (vd "đã nhận tiền", "đã ký"...) - khong
    // bat buoc, khong in ra chung tu, chi phuc vu theo doi noi bo (xem trang
    // /so-cong-lenh). Nguoi dung yeu cau 2026-08-14, xem NHAT_KY_QUYET_DINH.md.
    ghiChu: z.string().trim().max(1000, "Ghi chú tối đa 1000 ký tự").optional(),
    ngayDi: z.coerce.date({ invalid_type_error: "Ngày đi không hợp lệ" }),
    ngayVe: z.coerce.date({ invalid_type_error: "Ngày về không hợp lệ" }),
    ngayKy: z.coerce.date({ invalid_type_error: "Ngày lập không hợp lệ" }),
    cacChang: z.array(changCongTacSchema).max(4, "Tối đa 4 chặng").optional().nullable(),
    thanhVien: z.array(thanhVienLenhDieuCongTacSchema).min(1, "Đoàn phải có ít nhất 1 thành viên"),
    // Ca hai cung co hoac cung khong - kiem tra o refine ben duoi. Nguoi
    // duoc chon lam tai xe phai la 1 trong so cac thanhVien.nhanVienId.
    taiXeNhanVienId: z.string().trim().optional(),
    phuongTienId: z.string().trim().optional(),
    // Tu chon moi lan lap (2026-08-10, xem NHAT_KY_QUYET_DINH.md) - KHONG suy
    // ra tu diaDiemCongTac. TRAM = mau in them cot CCCD + nhan truong doan.
    // PHAT_HANH_THU_HOI_VE_E them 2026-08-12, xem NHAT_KY_QUYET_DINH.md muc
    // "Mau in Phat hanh, thu hoi ve e".
    loaiMauIn: z.enum(["TUYEN_THUONG", "TRAM", "PHAT_HANH_THU_HOI_VE_E"]).default("TUYEN_THUONG"),
  })
  .refine((d) => d.ngayVe >= d.ngayDi, {
    message: "Ngày về không được sớm hơn ngày đi",
    path: ["ngayVe"],
  })
  .refine((d) => !d.taiXeNhanVienId || d.thanhVien.some((tv) => tv.nhanVienId === d.taiXeNhanVienId), {
    message: "Người được chọn làm tài xế phải nằm trong danh sách thành viên",
    path: ["taiXeNhanVienId"],
  })
  .refine((d) => Boolean(d.taiXeNhanVienId) === Boolean(d.phuongTienId), {
    message: "Chọn tài xế thì phải chọn thêm biển số xe (và ngược lại)",
    path: ["phuongTienId"],
  })
  .refine((d) => d.thanhVien.filter((tv) => tv.laTruongDoan).length <= 1, {
    message: "Chỉ được chọn tối đa 1 trưởng đoàn",
    path: ["thanhVien"],
  })
  .refine((d) => new Set(d.thanhVien.map((tv) => tv.nhanVienId)).size === d.thanhVien.length, {
    message: "Có nhân viên bị trùng lặp trong danh sách thành viên",
    path: ["thanhVien"],
  });

export type TaoLenhDieuCongTacInput = z.infer<typeof taoLenhDieuCongTacSchema>;
