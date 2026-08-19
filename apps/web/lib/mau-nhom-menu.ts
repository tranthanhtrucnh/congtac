/**
 * Bang mau rieng cho tung NHOM MENU (Chung tu / Danh muc dung chung / He
 * thong) - chi de phan biet truc quan cac nhom da gom san trong menu.ts
 * (sidebar + trang Tong quan dung chung 1 nguon), KHONG mang y nghia trang
 * thai nhu --success/--destructive. Token mau khai bao tai app/globals.css
 * (--group-shared, --group-system). Xem NHAT_KY_QUYET_DINH.md muc "Mau nhom
 * menu trang Tong quan" (2026-08-17).
 */
export type MauNhom = "primary" | "shared" | "system";

interface LopMauNhom {
  /** Cham tron truoc tieu de nhom. */
  cham: string;
  /** Chu/icon mau day du (dung tren nen sang/tinh). */
  chu: string;
  /** Nen mo nhat - dung cho trang thai active/hover va o icon the thong ke. */
  nenNhat: string;
  /** Vach trai (active trong sidebar). */
  vachTrai: string;
  /** Vien tren (the nhom o trang Tong quan). */
  vienTren: string;
}

export const MAU_NHOM: Record<MauNhom, LopMauNhom> = {
  primary: {
    cham: "bg-primary",
    chu: "text-primary",
    nenNhat: "bg-primary/10",
    vachTrai: "border-l-primary",
    vienTren: "border-t-primary",
  },
  shared: {
    cham: "bg-group-shared",
    chu: "text-group-shared",
    nenNhat: "bg-group-shared/10",
    vachTrai: "border-l-group-shared",
    vienTren: "border-t-group-shared",
  },
  system: {
    cham: "bg-group-system",
    chu: "text-group-system",
    nenNhat: "bg-group-system/10",
    vachTrai: "border-l-group-system",
    vienTren: "border-t-group-system",
  },
};
