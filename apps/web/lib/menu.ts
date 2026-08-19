import {
  BookOpen,
  Building2,
  Car,
  ClipboardList,
  DatabaseBackup,
  FileText,
  Hash,
  History,
  LayoutDashboard,
  MapPin,
  PenLine,
  ShieldCheck,
  Truck,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";
import { MA_QUYEN } from "@congtac/shared";
import type { MauNhom } from "./mau-nhom-menu";

export interface MucMenu {
  nhan: string;
  href: string;
  icon: LucideIcon;
  /** Quyen can co de thay muc nay - khong khai bao nghia la ai dang nhap cung thay. */
  quyenCanCo?: string;
  /** Module chua xay xong - hien nhung khong bam duoc, co nhan "Sap co". */
  sapCo?: boolean;
}

export interface NhomMenu {
  tieuDe: string;
  mucs: MucMenu[];
  /** Mau rieng cua nhom - dung o sidebar + trang Tong quan, xem lib/mau-nhom-menu.ts. */
  nhomMau: MauNhom;
}

export const MUC_TONG_QUAN: MucMenu = { nhan: "Tổng quan", href: "/", icon: LayoutDashboard };

/**
 * Cau truc menu chinh - nhom theo docs/QUY_TAC_GIAO_DIEN.md ("Nhom chuc nang
 * He thong va Danh muc dung chung ro rang") va thu tu module trong
 * docs/DAC_TA_UNG_DUNG.md muc 6. Cac module chua code xong van hien trong
 * menu (sapCo: true) de nguoi dung thay lo trinh, nhung khong bam duoc.
 */
export const NHOM_MENU: NhomMenu[] = [
  {
    tieuDe: "Chứng từ",
    nhomMau: "primary",
    // Thu tu menu (2026-08-10, theo yeu cau nguoi dung): Lenh dieu cong tac
    // -> Cong lenh/Giay di duong -> Lenh dieu xe. LDCT dung dau vi la chung
    // tu goc, sinh kem GDD+LDX tu dong.
    mucs: [
      {
        nhan: "Lệnh điều công tác",
        href: "/lenh-dieu-cong-tac",
        icon: ClipboardList,
        quyenCanCo: MA_QUYEN.CHUNG_TU_XEM,
      },
      // Muc menu rieng cho GDD - phuc hoi 2026-08-10 theo yeu cau nguoi dung
      // (truoc do chi xem duoc qua trang chi tiet LDCT, xem
      // NHAT_KY_QUYET_DINH.md muc "Phuc hoi menu Cong lenh/Giay di duong").
      // GDD van sinh tu dong theo LDCT, KHONG tao/sua/huy rieng o trang nay.
      {
        nhan: "Công lệnh / Giấy đi đường",
        href: "/giay-di-duong",
        icon: FileText,
        quyenCanCo: MA_QUYEN.CHUNG_TU_XEM,
      },
      { nhan: "Lệnh điều xe", href: "/lenh-dieu-xe", icon: Car, quyenCanCo: MA_QUYEN.CHUNG_TU_XEM },
      // Bao cao tu sinh thay so ghi tay cua Van thu ("So ghi cong lenh") -
      // KHONG tao/sua/xoa rieng, chi xem + xuat Excel. Them 2026-08-14, xem
      // NHAT_KY_QUYET_DINH.md muc "So cong lenh".
      {
        nhan: "Sổ theo dõi công lệnh",
        href: "/so-cong-lenh",
        icon: BookOpen,
        quyenCanCo: MA_QUYEN.CHUNG_TU_XEM,
      },
    ],
  },
  {
    tieuDe: "Danh mục dùng chung",
    nhomMau: "shared",
    mucs: [
      { nhan: "Nhân viên", href: "/nhan-vien", icon: Users, quyenCanCo: MA_QUYEN.NHAN_VIEN_XEM },
      { nhan: "Phương tiện", href: "/phuong-tien", icon: Truck, quyenCanCo: MA_QUYEN.PHUONG_TIEN_XEM },
      { nhan: "Địa điểm", href: "/dia-diem", icon: MapPin, quyenCanCo: MA_QUYEN.DIA_DIEM_XEM },
      { nhan: "Người ký", href: "/nguoi-ky", icon: PenLine, quyenCanCo: MA_QUYEN.NGUOI_KY_XEM },
    ],
  },
  {
    tieuDe: "Hệ thống",
    nhomMau: "system",
    mucs: [
      {
        nhan: "Quản lý người dùng",
        href: "/nguoi-dung",
        icon: UserCog,
        quyenCanCo: MA_QUYEN.NGUOI_DUNG_XEM,
      },
      {
        nhan: "Vai trò & phân quyền",
        href: "/vai-tro",
        icon: ShieldCheck,
        quyenCanCo: MA_QUYEN.NGUOI_DUNG_XEM,
      },
      {
        nhan: "Đánh số chứng từ",
        href: "/danh-so",
        icon: Hash,
        quyenCanCo: MA_QUYEN.DANH_SO_THIET_LAP,
      },
      {
        nhan: "Nhật ký hệ thống",
        href: "/nhat-ky",
        icon: History,
        quyenCanCo: MA_QUYEN.NHAT_KY_XEM,
      },
      {
        nhan: "Thông tin đơn vị",
        href: "/cau-hinh-don-vi",
        icon: Building2,
        quyenCanCo: MA_QUYEN.DON_VI_XEM,
      },
      {
        nhan: "Sao lưu & phục hồi",
        href: "/sao-luu",
        icon: DatabaseBackup,
        quyenCanCo: MA_QUYEN.SAO_LUU_QUAN_LY,
      },
    ],
  },
];
