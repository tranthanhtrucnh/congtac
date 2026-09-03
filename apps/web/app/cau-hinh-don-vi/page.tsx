"use client";

import { useRef, useState } from "react";
import { AlertTriangle, Building2, ImageOff, Plus, Save, Trash2, Upload, X } from "lucide-react";
import { MA_QUYEN } from "@congtac/shared";
import { suaCauHinhDonViSchema, type SuaCauHinhDonViInput } from "@congtac/validation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNguoiDungHienTai, coQuyen } from "@/hooks/use-nguoi-dung-hien-tai";
import { useCauHinhDonVi, useLuuCauHinhDonVi } from "@/hooks/use-cau-hinh-don-vi";
import { LoiApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Danh sach ma phong chu hop le + nhan hien thi - KHOP CHINH XAC voi
// MA_PHONG_CHU_MAU_IN o apps/api/src/common/mau-in/mau-in-dung-chung.ts va
// enum trong sua-cau-hinh-don-vi.schema.ts (khong dung chung 1 hang so qua
// package rieng - packages/validation khong phu thuoc apps/api, va day chi
// la nhan hien thi frontend). Them/bot lua chon can sua CA 3 noi. Nguoi dung
// yeu cau 2026-08-28, xem NHAT_KY_QUYET_DINH.md.
const DANH_SACH_PHONG_CHU_MAU_IN: { ma: string; nhan: string }[] = [
  { ma: "BE_VIETNAM_PRO", nhan: "Be Vietnam Pro (mặc định, giống giao diện web)" },
  { ma: "ROBOTO", nhan: "Roboto" },
  { ma: "ROBOTO_CONDENSED", nhan: "Roboto Condensed (hẹp, in vừa nhiều nội dung hơn)" },
  { ma: "TIMES_NEW_ROMAN", nhan: "Times New Roman (chữ có chân, kiểu văn bản hành chính truyền thống)" },
];

// Khop voi DUNG_LUONG_LOGO_TOI_DA_KY_TU o packages/validation - kiem tra
// truoc o trinh duyet cho nguoi dung biet ngay (khong phai doi luc bam Luu
// moi bao loi tu backend).
const DUNG_LUONG_ANH_TOI_DA_BYTE = 2 * 1024 * 1024;

function TruongNhap({
  id,
  nhan,
  ghiChu,
  disabled,
  loi,
  ...phanConLai
}: {
  id: string;
  nhan: string;
  ghiChu?: string;
  disabled: boolean;
  loi?: string;
} & React.ComponentPropsWithoutRef<typeof Input>) {
  return (
    <div>
      <Label htmlFor={id}>{nhan}</Label>
      <Input id={id} className="mt-1.5" disabled={disabled} aria-invalid={!!loi} {...phanConLai} />
      {ghiChu && !loi && <p className="mt-1 text-xs text-muted-foreground">{ghiChu}</p>}
      {loi && <p className="mt-1 text-xs text-destructive">{loi}</p>}
    </div>
  );
}

export default function TrangCauHinhDonVi() {
  const { data: nguoiDungHienTai } = useNguoiDungHienTai();
  const { data, isLoading, isError, error } = useCauHinhDonVi();
  const luuCauHinh = useLuuCauHinhDonVi();
  const coQuyenSua = coQuyen(nguoiDungHienTai, MA_QUYEN.DON_VI_SUA);

  const [loiChung, setLoiChung] = useState<string | null>(null);
  const [thanhCong, setThanhCong] = useState(false);
  const [loiAnh, setLoiAnh] = useState<string | null>(null);
  const oChonFile = useRef<HTMLInputElement>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SuaCauHinhDonViInput>({
    resolver: zodResolver(suaCauHinhDonViSchema),
    values: data
      ? {
          donViChuQuan: data.donViChuQuan,
          tenCoQuanDong1: data.tenCoQuanDong1,
          tenCoQuanDong2: data.tenCoQuanDong2,
          tenNgan: data.tenNgan,
          diaDanh: data.diaDanh,
          canCuMauTram: data.canCuMauTram ?? "",
          mucDichMacDinhVeE: data.mucDichMacDinhVeE ?? "",
          logoBase64: data.logoBase64 ?? "",
          logoOpacityPhanTram: data.logoOpacityPhanTram,
          logoKichThuocMm: data.logoKichThuocMm,
          chuoiDiaDiemThuongDungVeE: data.chuoiDiaDiemThuongDungVeE ?? [],
          phongChuMauIn: data.phongChuMauIn,
          tyLeXHeightMauIn: data.tyLeXHeightMauIn,
        }
      : undefined,
  });

  // Danh sach "chuoi dia diem thuong dung" cho LDCT loai Phat hanh, thu hoi
  // ve e - dong bo Luu voi CA form (khong co nut Luu rieng cho tung dong,
  // giong cach canCuMauTram/mucDichMacDinhVeE dang lam chung 1 nut "Luu thay
  // doi" o cuoi trang). Nguoi dung yeu cau 2026-08-17, xem NHAT_KY_QUYET_DINH.md.
  const {
    fields: chuoiDiaDiemFields,
    append: themChuoiDiaDiem,
    remove: xoaChuoiDiaDiem,
  } = useFieldArray({ control, name: "chuoiDiaDiemThuongDungVeE" });

  const logoBase64HienTai = watch("logoBase64");
  const doMoXemTruoc = watch("logoOpacityPhanTram");

  function xuLyChonAnh(su: React.ChangeEvent<HTMLInputElement>) {
    setLoiAnh(null);
    const file = su.target.files?.[0];
    su.target.value = ""; // cho chon lai dung file cu duoc (change event van bat)
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setLoiAnh("Vui lòng chọn tệp hình ảnh (PNG, JPEG, WEBP)");
      return;
    }
    if (file.size > DUNG_LUONG_ANH_TOI_DA_BYTE) {
      setLoiAnh("Ảnh quá lớn (tối đa 2MB), vui lòng chọn ảnh nhỏ hơn");
      return;
    }
    const doc = new FileReader();
    doc.onload = () => {
      setValue("logoBase64", String(doc.result), { shouldDirty: true, shouldValidate: true });
    };
    doc.onerror = () => setLoiAnh("Không đọc được tệp ảnh, vui lòng thử lại");
    doc.readAsDataURL(file);
  }

  function xuLyXoaAnh() {
    setLoiAnh(null);
    setValue("logoBase64", "", { shouldDirty: true, shouldValidate: true });
  }

  async function xuLySubmit(duLieu: SuaCauHinhDonViInput) {
    setLoiChung(null);
    setThanhCong(false);
    try {
      await luuCauHinh(duLieu);
      setThanhCong(true);
      reset(duLieu);
    } catch (loi) {
      setLoiChung(loi instanceof LoiApi ? loi.message : "Không thể lưu, vui lòng thử lại");
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">Thông tin đơn vị</h1>
        <p className="text-sm text-muted-foreground">
          Tên cơ quan chủ quản, tên công ty và địa danh dùng chung cho toàn bộ mẫu in chứng từ và giao diện. Đổi 1
          lần ở đây, mọi nơi tự cập nhật theo — không cần sửa code khi đơn vị đổi tên (ví dụ khi sáp nhập).
        </p>
      </div>

      {!coQuyenSua && !isLoading && !isError && (
        <div className="mb-4 rounded-md border border-border bg-muted/40 px-4 py-2.5 text-sm text-muted-foreground">
          Bạn chỉ có quyền xem — chỉ Quản trị hệ thống mới sửa được thông tin đơn vị.
        </div>
      )}

      {isLoading && (
        <div className="py-10 text-center text-muted-foreground">
          <Building2 className="mx-auto mb-2 size-6 animate-pulse text-muted-foreground/50" />
          Đang tải...
        </div>
      )}

      {isError && (
        <div className="py-10 text-center">
          <AlertTriangle className="mx-auto mb-2 size-6 text-destructive/70" />
          <p className="text-sm text-destructive">
            {error instanceof LoiApi ? error.message : "Không tải được dữ liệu, vui lòng thử lại"}
          </p>
        </div>
      )}

      {data && (
        <form
          onSubmit={handleSubmit(xuLySubmit)}
          className="space-y-4 rounded-lg border border-border bg-background p-5"
        >
          <TruongNhap
            id="donViChuQuan"
            nhan="Cơ quan chủ quản"
            ghiChu='Dòng trên cùng, chữ thường, in hoa (ví dụ "UBND TỈNH AN GIANG").'
            disabled={!coQuyenSua}
            loi={errors.donViChuQuan?.message}
            {...register("donViChuQuan")}
          />
          <TruongNhap
            id="tenCoQuanDong1"
            nhan="Tên cơ quan ban hành — dòng 1"
            ghiChu='Không gạch chân (ví dụ "CÔNG TY TNHH MỘT THÀNH VIÊN").'
            disabled={!coQuyenSua}
            loi={errors.tenCoQuanDong1?.message}
            {...register("tenCoQuanDong1")}
          />
          <TruongNhap
            id="tenCoQuanDong2"
            nhan="Tên cơ quan ban hành — dòng 2"
            ghiChu='Có gạch chân khi in (ví dụ "XỔ SỐ KIẾN THIẾT AN GIANG").'
            disabled={!coQuyenSua}
            loi={errors.tenCoQuanDong2?.message}
            {...register("tenCoQuanDong2")}
          />
          <TruongNhap
            id="tenNgan"
            nhan="Tên rút gọn"
            ghiChu='Hiển thị ở menu bên trái (ví dụ "XSKT An Giang").'
            disabled={!coQuyenSua}
            loi={errors.tenNgan?.message}
            {...register("tenNgan")}
          />
          <TruongNhap
            id="diaDanh"
            nhan="Địa danh"
            ghiChu='Dùng trong dòng ngày ký trên chứng từ (ví dụ "An Giang, ngày... tháng... năm...").'
            disabled={!coQuyenSua}
            loi={errors.diaDanh?.message}
            {...register("diaDanh")}
          />

          <div>
            <Label htmlFor="canCuMauTram">Căn cứ — mẫu in Lệnh điều công tác Trạm TP.HCM</Label>
            <Textarea
              id="canCuMauTram"
              className="mt-1.5"
              rows={3}
              disabled={!coQuyenSua}
              aria-invalid={!!errors.canCuMauTram}
              placeholder={
                'Mỗi dòng 1 căn cứ, gõ đầy đủ (kể cả chữ "Căn cứ" và dấu ";" nếu muốn), ví dụ:\nCăn cứ Quyết định số 07/QĐ-XSKT ngày 23/01/2026 của...;\nCăn cứ Quyết định số 15/QĐ-XSKT ngày 27/02/2026 của...;'
              }
              {...register("canCuMauTram")}
            />
            {!errors.canCuMauTram && (
              <p className="mt-1 text-xs text-muted-foreground">
                Mỗi dòng in thành 1 đoạn riêng ở đầu mẫu in Lệnh điều công tác Trạm TP.HCM, in NGUYÊN VĂN đúng như
                gõ (hệ thống không tự thêm chữ "Căn cứ" hay dấu ";"). Dùng chung cho mọi lệnh loại Trạm, không nhập
                lại theo từng lệnh.
              </p>
            )}
            {errors.canCuMauTram && <p className="mt-1 text-xs text-destructive">{errors.canCuMauTram.message}</p>}
          </div>

          <div>
            <Label htmlFor="mucDichMacDinhVeE">Mục đích mặc định — mẫu Phát hành, thu hồi vé ế</Label>
            <Input
              id="mucDichMacDinhVeE"
              className="mt-1.5"
              disabled={!coQuyenSua}
              aria-invalid={!!errors.mucDichMacDinhVeE}
              placeholder='Ví dụ: phát hành vé số, thu hồi vé số ế, thu tiền và nhận vé trúng thưởng'
              {...register("mucDichMacDinhVeE")}
            />
            {!errors.mucDichMacDinhVeE && (
              <p className="mt-1 text-xs text-muted-foreground">
                Khi lập lệnh điều công tác chọn loại "Phát hành, thu hồi vé ế", ô "Mục đích" sẽ tự điền sẵn giá trị
                này (vẫn sửa được riêng cho từng lệnh). Để trống thì dùng lại mặc định chung "Công tác" như các loại
                khác.
              </p>
            )}
            {errors.mucDichMacDinhVeE && (
              <p className="mt-1 text-xs text-destructive">{errors.mucDichMacDinhVeE.message}</p>
            )}
          </div>

          <div className="border-t border-border pt-4">
            <h2 className="text-sm font-semibold text-foreground">
              Chuỗi địa điểm thường dùng — mẫu Phát hành, thu hồi vé ế
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Khi lập lệnh điều công tác chọn loại "Phát hành, thu hồi vé ế", có thể chọn nhanh 1 trong các chuỗi
              này để điền nguyên vào ô "Nơi đến" thay vì gõ tay lại mỗi lần (vẫn sửa được sau khi chọn). Mỗi mục
              gồm 1 nhãn ngắn để nhận biết và nội dung đầy đủ đã định dạng sẵn, ví dụ nội dung: "P. Ninh Kiều, Vị
              Tân (TP Cần Thơ), P. Rạch Giá (An Giang)".
            </p>

            <div className="mt-3 space-y-3">
              {chuoiDiaDiemFields.map((truong, chiSo) => (
                <div key={truong.id} className="flex items-start gap-2 rounded-md border border-border p-3">
                  <div className="flex-1 space-y-2">
                    <div>
                      <Label htmlFor={`chuoiDiaDiem-${chiSo}-nhan`}>Nhãn</Label>
                      <Input
                        id={`chuoiDiaDiem-${chiSo}-nhan`}
                        className="mt-1.5"
                        disabled={!coQuyenSua}
                        placeholder='Ví dụ: Tuyến Cần Thơ - An Giang'
                        aria-invalid={!!errors.chuoiDiaDiemThuongDungVeE?.[chiSo]?.nhan}
                        {...register(`chuoiDiaDiemThuongDungVeE.${chiSo}.nhan`)}
                      />
                      {errors.chuoiDiaDiemThuongDungVeE?.[chiSo]?.nhan && (
                        <p className="mt-1 text-xs text-destructive">
                          {errors.chuoiDiaDiemThuongDungVeE[chiSo]?.nhan?.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor={`chuoiDiaDiem-${chiSo}-noiDung`}>Nội dung điền vào "Nơi đến"</Label>
                      <Textarea
                        id={`chuoiDiaDiem-${chiSo}-noiDung`}
                        className="mt-1.5"
                        rows={2}
                        disabled={!coQuyenSua}
                        placeholder='Ví dụ: P. Ninh Kiều, Vị Tân (TP Cần Thơ), P. Rạch Giá (An Giang)'
                        aria-invalid={!!errors.chuoiDiaDiemThuongDungVeE?.[chiSo]?.noiDung}
                        {...register(`chuoiDiaDiemThuongDungVeE.${chiSo}.noiDung`)}
                      />
                      {errors.chuoiDiaDiemThuongDungVeE?.[chiSo]?.noiDung && (
                        <p className="mt-1 text-xs text-destructive">
                          {errors.chuoiDiaDiemThuongDungVeE[chiSo]?.noiDung?.message}
                        </p>
                      )}
                    </div>
                  </div>
                  {coQuyenSua && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Xóa chuỗi địa điểm này"
                      title="Xóa chuỗi địa điểm này"
                      onClick={() => xoaChuoiDiaDiem(chiSo)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}

              {chuoiDiaDiemFields.length === 0 && (
                <p className="text-xs text-muted-foreground">Chưa có chuỗi địa điểm nào được lưu.</p>
              )}

              {errors.chuoiDiaDiemThuongDungVeE?.message && (
                <p className="text-xs text-destructive">{errors.chuoiDiaDiemThuongDungVeE.message}</p>
              )}

              {coQuyenSua && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => themChuoiDiaDiem({ nhan: "", noiDung: "" })}
                >
                  <Plus className="size-4" />
                  Thêm chuỗi địa điểm
                </Button>
              )}
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h2 className="text-sm font-semibold text-foreground">Phông chữ mẫu in</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Áp dụng cho thân nội dung của mọi mẫu in PDF (Lệnh điều xe, Lệnh điều công tác — cả 3 loại mẫu, Công
              lệnh/Giấy đi đường, Sổ theo dõi công lệnh, Báo cáo phương tiện). Không ảnh hưởng phông giao diện web
              (luôn cố định Be Vietnam Pro) và không đổi phông riêng của cột Năm sinh/Số CCCD ở mẫu Trạm TP.HCM (vẫn
              cố định kiểu chữ đều để dễ đọc số).
            </p>
            <div className="mt-3 grid max-w-xs grid-cols-1 gap-4 sm:max-w-none sm:grid-cols-2">
              <div>
                <Label htmlFor="phongChuMauIn">Phông chữ</Label>
                <Select id="phongChuMauIn" className="mt-1.5" disabled={!coQuyenSua} {...register("phongChuMauIn")}>
                  {DANH_SACH_PHONG_CHU_MAU_IN.map((f) => (
                    <option key={f.ma} value={f.ma}>
                      {f.nhan}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="tyLeXHeightMauIn">Tỷ lệ cỡ chữ (nâng cao)</Label>
                <Input
                  id="tyLeXHeightMauIn"
                  type="number"
                  min={0.3}
                  max={0.8}
                  step={0.01}
                  className="mt-1.5"
                  disabled={!coQuyenSua}
                  aria-invalid={!!errors.tyLeXHeightMauIn}
                  {...register("tyLeXHeightMauIn", { valueAsNumber: true })}
                />
                {!errors.tyLeXHeightMauIn && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Mặc định 0.53 (khớp Be Vietnam Pro). Chỉnh số này nếu sau khi in thử thấy chữ của phông vừa chọn
                    còn to/nhỏ hơn phông trước — tăng lên nếu chữ đang nhỏ hơn, giảm xuống nếu chữ đang to hơn.
                  </p>
                )}
                {errors.tyLeXHeightMauIn && (
                  <p className="mt-1 text-xs text-destructive">{errors.tyLeXHeightMauIn.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h2 className="text-sm font-semibold text-foreground">Logo mờ (watermark) trên mẫu in</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Áp dụng thống nhất cho mọi mẫu in chứng từ (Lệnh điều xe, Lệnh điều công tác — cả 3 loại mẫu, Công
              lệnh/Giấy đi đường).
            </p>

            <div className="mt-3 flex items-start gap-4">
              <div
                className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-md border border-dashed border-border bg-muted/30"
                aria-label="Xem trước logo watermark"
              >
                {logoBase64HienTai ? (
                  // eslint-disable-next-line @next/next/no-img-element -- xem truoc anh base64 tam thoi, khong phai anh tinh cua Next
                  <img
                    src={logoBase64HienTai}
                    alt="Logo watermark"
                    className="size-full object-contain"
                    style={{ opacity: (doMoXemTruoc ?? 8) / 100 }}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 px-2 text-center text-muted-foreground">
                    <ImageOff className="size-5" />
                    <span className="text-[10px] leading-tight">Đang dùng logo mặc định hệ thống</span>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <input
                  ref={oChonFile}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  disabled={!coQuyenSua}
                  onChange={xuLyChonAnh}
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!coQuyenSua}
                    onClick={() => oChonFile.current?.click()}
                  >
                    <Upload className="size-4" />
                    Tải logo mới
                  </Button>
                  {logoBase64HienTai && (
                    <Button type="button" variant="ghost" size="sm" disabled={!coQuyenSua} onClick={xuLyXoaAnh}>
                      <X className="size-4" />
                      Dùng logo mặc định
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">PNG/JPEG/WEBP, tối đa 2MB.</p>
                {(loiAnh || errors.logoBase64) && (
                  <p className="text-xs text-destructive">{loiAnh ?? errors.logoBase64?.message}</p>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="logoOpacityPhanTram">Độ mờ (%)</Label>
                <Input
                  id="logoOpacityPhanTram"
                  type="number"
                  min={0}
                  max={100}
                  className="mt-1.5"
                  disabled={!coQuyenSua}
                  aria-invalid={!!errors.logoOpacityPhanTram}
                  {...register("logoOpacityPhanTram", { valueAsNumber: true })}
                />
                {errors.logoOpacityPhanTram && (
                  <p className="mt-1 text-xs text-destructive">{errors.logoOpacityPhanTram.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="logoKichThuocMm">Kích thước (mm)</Label>
                <Input
                  id="logoKichThuocMm"
                  type="number"
                  min={20}
                  max={250}
                  className="mt-1.5"
                  disabled={!coQuyenSua}
                  aria-invalid={!!errors.logoKichThuocMm}
                  {...register("logoKichThuocMm", { valueAsNumber: true })}
                />
                {errors.logoKichThuocMm && (
                  <p className="mt-1 text-xs text-destructive">{errors.logoKichThuocMm.message}</p>
                )}
              </div>
            </div>
          </div>

          {loiChung && <p className="text-sm text-destructive">{loiChung}</p>}
          {thanhCong && !isDirty && <p className="text-sm text-emerald-600 dark:text-emerald-400">Đã lưu.</p>}

          {coQuyenSua && (
            <div className="flex justify-end pt-1">
              <Button type="submit" disabled={isSubmitting || !isDirty}>
                <Save className="size-4" />
                Lưu thay đổi
              </Button>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
