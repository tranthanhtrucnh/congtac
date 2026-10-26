import { z } from "zod";
import { thanhVienLenhDieuCongTacSchema } from "./thanh-vien-lenh-dieu-cong-tac.schema";
import { changCongTacSchema } from "./chang-cong-tac.schema";

// Sua duoc bat cu luc nao, chi chan khi chung tu da huy (kiem tra o service).
// Neu gui truong "thanhVien" thi COI LA THAY THE TOAN BO danh sach hien tai:
// - Phan tu co "id" khop voi thanh vien dang co -> cap nhat ngay rieng.
// - Phan tu KHONG co "id" -> thanh vien moi, tu tao them GiayDiDuong.
// - Thanh vien dang co nhung KHONG con trong mang gui len -> bi loai khoi
//   doan, service se cascade huy GiayDiDuong cua nguoi do (khong xoa cung).
// Khong gui truong "thanhVien" = giu nguyen danh sach hien tai.
export const suaLenhDieuCongTacSchema = z
  .object({
    canCu: z.string().trim().optional(),
    diaDiemCongTac: z.string().trim().min(1, "Địa điểm công tác không được để trống").optional(),
    mucDich: z.string().trim().min(1, "Mục đích không được để trống").optional(),
    // Ghi chu tu do CHUNG cho ca doan - khong bat buoc, cung quy uoc voi
    // mucDich/diaDiemCongTac o tren (luon gui kem tu form, khong dung tri
    // trang thai null/undefined nhu taiXeNhanVienId). Xem NHAT_KY_QUYET_DINH.md.
    ghiChu: z.string().trim().max(1000, "Ghi chú tối đa 1000 ký tự").optional(),
    ngayDi: z.coerce.date({ invalid_type_error: "Ngày đi không hợp lệ" }).optional(),
    ngayVe: z.coerce.date({ invalid_type_error: "Ngày về không hợp lệ" }).optional(),
    ngayKy: z.coerce.date({ invalid_type_error: "Ngày lập không hợp lệ" }).optional(),
    cacChang: z.array(changCongTacSchema).max(4, "Tối đa 4 chặng").nullable().optional(),
    thanhVien: z.array(thanhVienLenhDieuCongTacSchema).min(1, "Đoàn phải có ít nhất 1 thành viên").optional(),
    // null = bo tai xe/bien so da chon truoc do; undefined = khong doi;
    // chuoi = doi sang tai xe/bien so khac.
    taiXeNhanVienId: z.string().trim().nullable().optional(),
    phuongTienId: z.string().trim().nullable().optional(),
    // Khong gui = giu nguyen gia tri dang co (xem NHAT_KY_QUYET_DINH.md).
    loaiMauIn: z.enum(["TUYEN_THUONG", "TRAM", "PHAT_HANH_THU_HOI_VE_E"]).optional(),
  })
  // Chi kiem tra khi CA HAI cung co mat (giong sua-lenh-dieu-xe.schema.ts) -
  // truong hop 1 trong 2 duoc kiem tra bo sung o service (so voi gia tri dang
  // luu trong DB).
  .refine((d) => !d.ngayDi || !d.ngayVe || d.ngayVe >= d.ngayDi, {
    message: "Ngày về không được sớm hơn ngày đi",
    path: ["ngayVe"],
  })
  .refine(
    (d) => !d.taiXeNhanVienId || !d.thanhVien || d.thanhVien.some((tv) => tv.nhanVienId === d.taiXeNhanVienId),
    {
      message: "Người được chọn làm tài xế phải nằm trong danh sách thành viên",
      path: ["taiXeNhanVienId"],
    },
  )
  .refine((d) => !d.thanhVien || d.thanhVien.filter((tv) => tv.laTruongDoan).length <= 1, {
    message: "Chỉ được chọn tối đa 1 trưởng đoàn",
    path: ["thanhVien"],
  })
  // Phong ho khi "doi nguoi" (giu nguyen id, doi nhanVienId - xem
  // NHAT_KY_QUYET_DINH.md muc "Doi nguoi trong doan - giu nguyen so cong
  // lenh") vo tinh chon trung 1 nguoi da co san o vi tri khac trong doan.
  .refine(
    (d) => !d.thanhVien || new Set(d.thanhVien.map((tv) => tv.nhanVienId)).size === d.thanhVien.length,
    { message: "Có nhân viên bị trùng lặp trong danh sách thành viên", path: ["thanhVien"] },
  );

export type SuaLenhDieuCongTacInput = z.infer<typeof suaLenhDieuCongTacSchema>;
