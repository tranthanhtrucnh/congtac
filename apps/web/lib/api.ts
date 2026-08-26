// Export de cac noi can dung truc tiep URL API (vd mo file PDF o tab moi
// bang the <a>/window.open thay vi goiApi()) khong phai khai bao lai.
//
// Mac dinh la duong dan TUONG DOI "/api" (khong phai URL tuyet doi gan cung
// "http://localhost:3001/api" nhu truoc) - trinh duyet se tu goi API o CUNG
// origin voi trang web dang mo (vd https://may-van-thu.tail1234.ts.net/api
// khi truy cap qua Tailscale, hoac http://192.168.1.5:3000/api khi truy cap
// qua LAN), duoc Next.js server rewrite() sang backend that (xem
// next.config.ts). Nho vay 1 ban build web dung duoc tu MOI dia chi truy
// cap, khong con phai build rieng cho tung moi truong. Chi dat
// NEXT_PUBLIC_API_URL khi that su can 1 backend o domain KHAC han voi web
// (vd sau nay tach rieng hosting). Xem NHAT_KY_QUYET_DINH.md muc "Truy cap
// tu xa qua Tailscale".
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

export interface ChiTietLoiApi {
  truong: string;
  thongBao: string;
}

export class LoiApi extends Error {
  constructor(
    public status: number,
    message: string,
    public loi?: ChiTietLoiApi[],
  ) {
    super(message);
    this.name = "LoiApi";
  }
}

/**
 * Goi API dung chung - luon gui kem cookie (credentials: include) vi phien
 * dang nhap luu o cookie httpOnly, khong luu token o localStorage.
 */
export async function goiApi<T>(duongDan: string, tuyChon: RequestInit = {}): Promise<T> {
  // Khi body la FormData (vd tai file len), KHONG dat Content-Type thu cong -
  // trinh duyet can tu sinh boundary cho multipart/form-data, dat san se lam hong request.
  const laFormData = typeof FormData !== "undefined" && tuyChon.body instanceof FormData;

  const res = await fetch(`${API_BASE_URL}${duongDan}`, {
    ...tuyChon,
    credentials: "include",
    headers: laFormData
      ? { ...tuyChon.headers }
      : { "Content-Type": "application/json", ...tuyChon.headers },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}) as { message?: string; loi?: ChiTietLoiApi[] });
    throw new LoiApi(res.status, body?.message ?? "Có lỗi xảy ra, vui lòng thử lại", body?.loi);
  }

  // Mot so API (vd xoa) tra ve 200/204 nhung khong co body - goi thang res.json()
  // trong truong hop nay se nem loi parse JSON rong, khien code goi sau (nhu
  // lam moi danh sach) khong bao gio chay du thao tac da thanh cong o backend.
  // Doc dang text truoc, chi parse JSON khi thuc su co noi dung.
  const vanBan = await res.text();
  if (!vanBan) {
    return undefined as T;
  }
  return JSON.parse(vanBan) as T;
}
