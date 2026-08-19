"use client";

import { Select } from "@/components/ui/select";

interface ChuoiDiaDiem {
  nhan: string;
  noiDung: string;
}

/**
 * Dropdown "Chọn nhanh tuyến thường dùng" - điền NGUYÊN chuỗi địa điểm đã
 * lưu sẵn (Cấu hình đơn vị -> Chuỗi địa điểm thường dùng, /cau-hinh-don-vi)
 * vào ô "Nơi đến" khi lập LDCT loại "Phát hành, thu hồi vé ế" - THAY THẾ
 * toàn bộ giá trị đang có trong ô (không ghép thêm), người dùng vẫn sửa tay
 * lại được bình thường sau khi chọn. Ẩn hẳn nếu chưa cấu hình chuỗi nào,
 * tránh chiếm chỗ vô ích. Dùng <select> thay vì combobox tự do vì đây là
 * hành động "áp dụng nguyên mẫu có sẵn", không phải nhập liệu tự do (khác
 * với ComboboxVanBan bên dưới, vẫn giữ nguyên để gõ/sửa tay). Value của
 * <select> luôn reset về rỗng sau khi chọn - dùng lại được nhiều lần liên
 * tiếp mà không cần đổi lựa chọn trước đó. Người dùng yêu cầu 2026-08-17
 * (kèm 4 ví dụ chuỗi địa điểm thực tế), xem NHAT_KY_QUYET_DINH.md.
 */
export function ChonNhanhDiaDiemVeE({
  chuoiDiaDiem,
  onChon,
  disabled,
}: {
  chuoiDiaDiem: ChuoiDiaDiem[];
  onChon: (noiDung: string) => void;
  disabled?: boolean;
}) {
  if (chuoiDiaDiem.length === 0) return null;

  return (
    <Select
      aria-label="Chọn nhanh chuỗi địa điểm thường dùng"
      value=""
      disabled={disabled}
      onChange={(su) => {
        const noiDung = su.target.value;
        if (noiDung) onChon(noiDung);
      }}
    >
      <option value="">— Chọn nhanh tuyến thường dùng —</option>
      {chuoiDiaDiem.map((cdd, chiSo) => (
        <option key={chiSo} value={cdd.noiDung}>
          {cdd.nhan}
        </option>
      ))}
    </Select>
  );
}
