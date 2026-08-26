import type { MauNhom } from "./mau-nhom-menu";

/**
 * Mau NHAN DIEN rieng cho tung nhom menu o SIDEBAR (tinh chinh lan 2,
 * 2026-08-26 - xem NHAT_KY_QUYET_DINH.md). CHU Y: day la mot he mau HOAN
 * TOAN TACH BIET voi MAU_NHOM (mau-nhom-menu.ts) - MAU_NHOM chi phuc vu
 * trang Tong quan (app/page.tsx), KHONG dong den. Sidebar dung mau khac
 * (nhat hon nhieu, chi la background tint + accent chu, khong dung lam
 * chu/nen day du) nen tach rieng token de tranh nham lan.
 *
 * Pham vi ap dung CHI GIOI HAN o: (1) nen tint cuc nhat cua card nhom, (2)
 * mau accent cua tieu de nhom + chevron thu gon/mo rong. KHONG dung cho:
 * icon/chu cua tung muc menu binh thuong (luon giu mau trung tinh) va
 * KHONG dung cho trang thai active (active luon dung chung 1 mau xanh
 * --primary o moi nhom, xem sidebar.tsx) - dam bao dieu huong nhat quan.
 */
export const MAU_NHOM_SIDEBAR: Record<MauNhom, { accent: string; nenCard: string }> = {
  // "Chung tu" tai dung thang mau --primary lam accent - trung voi mau yeu
  // cau (#2563EB), khong can token rieng.
  primary: { accent: "text-primary", nenCard: "bg-sidebar-card-bg-primary" },
  shared: { accent: "text-sidebar-accent-shared", nenCard: "bg-sidebar-card-bg-shared" },
  system: { accent: "text-sidebar-accent-system", nenCard: "bg-sidebar-card-bg-system" },
};
