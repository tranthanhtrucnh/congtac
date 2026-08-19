import { z } from "zod";

// Dung chung cho ca schema Tao va Sua LDCT. "id" chi co khi sua 1 thanh vien
// da ton tai (giu nguyen GiayDiDuong da cap so cua nguoi do) - khong gui id
// = thanh vien moi them vao doan, se duoc tao GiayDiDuong moi.
export const thanhVienLenhDieuCongTacSchema = z
  .object({
    id: z.string().trim().optional(),
    nhanVienId: z.string().trim().min(1, "Thiếu mã nhân viên"),
    ngayDiRieng: z.coerce.date({ invalid_type_error: "Ngày đi riêng không hợp lệ" }).optional(),
    ngayVeRieng: z.coerce.date({ invalid_type_error: "Ngày về riêng không hợp lệ" }).optional(),
    // Chi co y nghia khi LenhDieuCongTac.loaiMauIn la TRAM hoac
    // PHAT_HANH_THU_HOI_VE_E (xem tao-lenh-dieu-cong-tac.schema.ts) - van
    // nhan gia tri binh thuong o TUYEN_THUONG, chi khong hien/dung o mau in.
    laTruongDoan: z.boolean().default(false),
  })
  .refine((tv) => !tv.ngayDiRieng || !tv.ngayVeRieng || tv.ngayVeRieng >= tv.ngayDiRieng, {
    message: "Ngày về không được sớm hơn ngày đi",
    path: ["ngayVeRieng"],
  });

export type ThanhVienLenhDieuCongTacInput = z.infer<typeof thanhVienLenhDieuCongTacSchema>;
