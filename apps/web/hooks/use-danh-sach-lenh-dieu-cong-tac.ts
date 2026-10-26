"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { goiApi } from "@/lib/api";
import type { ChangCongTacInput } from "@congtac/validation";

export interface ThanhVienLenhDieuCongTac {
  id: string;
  nhanVienId: string | null;
  hoTen: string;
  chucVu: string;
  cccd: string;
  ngayDiRieng: string | null;
  ngayVeRieng: string | null;
  thuTu: number;
  daLoaiKhoiDoan: boolean;
  // Chi co y nghia khi LenhDieuCongTac.loaiMauIn la TRAM hoac
  // PHAT_HANH_THU_HOI_VE_E - xem NHAT_KY_QUYET_DINH.md muc "Truong doan +
  // CCCD trong mau in LDCT" va muc "Mau in Phat hanh, thu hoi ve e".
  laTruongDoan: boolean;
  giayDiDuong: GiayDiDuong | null;
}

export interface GiayDiDuong {
  id: string;
  nam: number;
  soThuTu: number;
  soHieu: string;
  lenhDieuCongTacId: string;
  thanhVienId: string;
  noiDiRieng: string | null;
  noiDenRieng: string | null;
  cacChangRieng?: ChangCongTacInput[] | null;
  xacNhanNoiDen: string | null;
  daHuy: boolean;
  lyDoHuy: string | null;
}

export interface LenhDieuXeLienKet {
  id: string;
  soHieu: string;
  laiXeId: string | null;
  laiXeHoTen: string;
  phuongTienId: string | null;
  bienSo: string;
  nhanHieu: string;
  thanhVienTaiXeId: string | null;
  daHuy: boolean;
  lyDoHuy: string | null;
}

export interface LenhDieuCongTac {
  id: string;
  nam: number;
  soThuTu: number;
  soHieu: string;

  canCu: string | null;
  diaDiemCongTac: string;
  mucDich: string;
  // Ghi chu tu do CHUNG cho ca doan (khong in ra chung tu) - xem trang
  // /so-cong-lenh. Them 2026-08-14, xem NHAT_KY_QUYET_DINH.md.
  ghiChu: string | null;
  cacChang?: ChangCongTacInput[] | null;

  ngayDi: string;
  ngayVe: string;
  ngayKy: string;

  nguoiKyId: string | null;
  nguoiKyHoTen: string;
  nguoiKyChucDanh: string;
  nguoiKyTheThuc: string;

  daHuy: boolean;
  lyDoHuy: string | null;

  // Tu chon luc lap (mac dinh "TUYEN_THUONG") - xem NHAT_KY_QUYET_DINH.md muc
  // "Truong doan + CCCD trong mau in LDCT" va muc "Mau in Phat hanh, thu hoi
  // ve e".
  loaiMauIn: "TUYEN_THUONG" | "TRAM" | "PHAT_HANH_THU_HOI_VE_E";

  ngayTao: string;
  ngayCapNhat: string;

  // Co ca o /:id (chi tiet) LAN danh sach /lenh-dieu-cong-tac (backend tra
  // day du, khong chi "soThanhVien" - xem lenh-dieu-cong-tac.service.ts
  // danhSach()).
  thanhVien?: ThanhVienLenhDieuCongTac[];
  lenhDieuXe?: LenhDieuXeLienKet[];
  soThanhVien?: number;

  // Co gia tri (chi o /lenh-dieu-cong-tac, danh sach) khi dang mang so MOI
  // NHAT cua nam - dung de an/hien nut Xoa cung o trang danh sach. Backend TU
  // KIEM TRA LAI dieu kien nay o server luc xoa that (khong chi tin gia tri
  // nay tu frontend) - xem NHAT_KY_QUYET_DINH.md muc "Xoa cung chung tu - don
  // gian hoa 2026-08-20". TU 2026-08-28: chi con phu thuoc rieng day LDCT
  // (khong con bat buoc GDD/LDX cung phai la so moi nhat - xem
  // coCanhBaoKhoangTrong ben duoi va NHAT_KY_QUYET_DINH.md muc "Noi long dieu
  // kien Xoa cung LDCT - 2026-08-28").
  laSoMoiNhat?: boolean;

  // true neu cong lenh hoac lenh dieu xe cua LDCT nay KHONG phai so moi nhat
  // cua day tuong ung - xoa cung van duoc phep (2026-08-28, noi long) nhung
  // se de lai 1 "lo hong" vinh vien trong day so do (khong lui bo dem ve
  // dung so nay duoc vi con so cao hon o noi khac). Dung de hien canh bao
  // trong dialog xac nhan xoa. Xem NHAT_KY_QUYET_DINH.md.
  coCanhBaoKhoangTrong?: boolean;
}

export interface DanhSachLenhDieuCongTac {
  duLieu: LenhDieuCongTac[];
  tong: number;
  trang: number;
  kichThuoc: number;
}

export type CotSapXepLenhDieuCongTac = "soHieu" | "diaDiemCongTac" | "ngayDi" | "ngayVe" | "ngayKy";

export interface BoLocLenhDieuCongTac {
  trang: number;
  kichThuoc: number;
  tuKhoa: string;
  daHuy?: boolean;
  nam?: number;
  // Loc theo loai mau in - dung cho cac tag "Tuyen thuong/Tram/Ve e" o dau
  // danh sach, khong truyen = tat ca. Xem NHAT_KY_QUYET_DINH.md.
  loaiMauIn?: "TUYEN_THUONG" | "TRAM" | "PHAT_HANH_THU_HOI_VE_E";
  // Loc rieng "to chi co 1 minh tai xe" - TACH BIET voi loaiMauIn (xem
  // danh-sach-lenh-dieu-cong-tac.schema.ts). Chi truyen true khi bat.
  chiTaiXeRieng?: boolean;
  sapXepTheo?: CotSapXepLenhDieuCongTac;
  huongSapXep?: "asc" | "desc";
}

function khoaTruyVan(boLoc: BoLocLenhDieuCongTac) {
  return ["lenh-dieu-cong-tac", boLoc] as const;
}

export function useDanhSachLenhDieuCongTac(boLoc: BoLocLenhDieuCongTac) {
  const query = new URLSearchParams({
    trang: String(boLoc.trang),
    kichThuoc: String(boLoc.kichThuoc),
  });
  if (boLoc.tuKhoa) query.set("tuKhoa", boLoc.tuKhoa);
  if (boLoc.daHuy !== undefined) query.set("daHuy", String(boLoc.daHuy));
  if (boLoc.nam) query.set("nam", String(boLoc.nam));
  if (boLoc.loaiMauIn) query.set("loaiMauIn", boLoc.loaiMauIn);
  if (boLoc.chiTaiXeRieng) query.set("chiTaiXeRieng", "true");
  if (boLoc.sapXepTheo) query.set("sapXepTheo", boLoc.sapXepTheo);
  if (boLoc.huongSapXep) query.set("huongSapXep", boLoc.huongSapXep);

  return useQuery({
    queryKey: khoaTruyVan(boLoc),
    queryFn: () => goiApi<DanhSachLenhDieuCongTac>(`/lenh-dieu-cong-tac?${query.toString()}`),
    placeholderData: (dataTruoc) => dataTruoc,
  });
}

export function useChiTietLenhDieuCongTac(id: string | null) {
  return useQuery({
    queryKey: ["lenh-dieu-cong-tac", "chi-tiet", id],
    queryFn: () => goiApi<LenhDieuCongTac>(`/lenh-dieu-cong-tac/${id}`),
    enabled: !!id,
  });
}

export function useLamMoiDanhSachLenhDieuCongTac() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["lenh-dieu-cong-tac"] });
}
