"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { nhapLenhDieuCongTacFormSchema, type NhapLenhDieuCongTacFormInput } from "@congtac/validation";
import { API_BASE_URL } from "@/lib/api";
import { useDanhSachNhanVien } from "@/hooks/use-danh-sach-nhan-vien";
import { useDanhSachDiaDiem } from "@/hooks/use-danh-sach-dia-diem";
import { useCauHinhDonVi } from "@/hooks/use-cau-hinh-don-vi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";
import { ComboboxVanBan } from "@/components/ui/combobox-van-ban";
import { GOI_Y_MUC_DICH, MUC_DICH_MAC_DINH } from "@/lib/constants/muc-dich";
import { ChonNhanhDiaDiemVeE } from "@/components/chon-nhanh-dia-diem-ve-e";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

function ngayHomNay() {
  return new Date().toISOString().slice(0, 10);
}

function ngayMai() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}



const GIA_TRI_MAC_DINH: NhapLenhDieuCongTacFormInput = {
  soHieu: "",
  ngayKy: new Date(ngayHomNay()),
  ngayDi: new Date(ngayMai()),
  ngayVe: new Date(ngayMai()),
  diaDiemCongTac: "",
  mucDich: MUC_DICH_MAC_DINH,
  loaiMauIn: "TUYEN_THUONG",
  thanhVien: [],
};

/**
 * "Mẫu in nháp" Lệnh điều công tác - Văn thư yêu cầu 2026-08-26 (2 lần):
 * lần 1 chỉ cần "khác gì đó không lưu CSDL", lần 2 làm rõ lại "tất cả y như
 * lệnh điều công tác THẬT, chỉ số hiệu cho gõ tay" - bản đầu tiên (form tự
 * gõ tay hoàn toàn, không autocomplete) CHƯA đạt yêu cầu này. Bản sửa lại
 * đây tái dùng ĐÚNG các mảnh UI của tao-lenh-dieu-cong-tac-dialog.tsx (chọn
 * thành viên từ Danh mục Nhân viên qua Combobox, gợi ý địa điểm từ Danh mục
 * Địa điểm, "Chọn nhanh tuyến thường dùng" cho loại vé ế, tự điền Mục đích
 * mặc định khi chuyển sang vé ế) - nhưng vẫn là 1 dialog RIÊNG (không sửa
 * dialog thật, giữ nguyên quyết định kiến trúc đã chọn 2026-08-26) và có
 * thêm ô "Số hiệu" gõ tay (form thật không có, vì số luôn tự cấp).
 *
 * Khác biệt CÓ CHỦ ĐÍCH so với dialog thật (không cần cho mục đích xem/in
 * thử layout LĐCT, vì mẫu in nháp KHÔNG in kèm trang LĐX):
 * - Không có "Nơi đi" / "Tài xế - Biển số - Lập kèm lệnh điều xe" (2 phần
 *   này chỉ ảnh hưởng Công lệnh/Lệnh điều xe sinh kèm, không ảnh hưởng gì
 *   đến bản in LĐCT). Muốn xem nháp Công lệnh/Lệnh điều xe thì dùng 2 nút
 *   riêng ở trang /mau-nhap.
 * - Không kiểm tra trùng lịch (CanhBaoTrungLichNhanVien) - dữ liệu nháp
 *   không ràng buộc với việc lập chứng từ thật nên không cần chặn/cảnh báo.
 * - Chọn thành viên từ Danh mục chỉ để ĐIỀN SẴN họ tên/chức vụ/CCCD/ngày
 *   sinh (snapshot ngay lúc thêm, giống hệt cách LĐCT thật lưu) - sau đó
 *   vẫn sửa tay tự do được, kể cả với người chưa có trong Danh mục.
 *
 * Xem NHAT_KY_QUYET_DINH.md muc "Mau in nhap".
 */
export function NhapLenhDieuCongTacDialog({
  open,
  onOpenChange,
  onXemTruoc,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onXemTruoc: (url: string, tieuDe: string) => void;
}) {
  const [dangChonThanhVien, setDangChonThanhVien] = useState("");

  const { data: nhanVienDs } = useDanhSachNhanVien({
    trang: 1,
    kichThuoc: 100,
    tuKhoa: "",
    chiTaiXe: false,
    trangThai: "DANG_LAM_VIEC",
  });
  const { data: diaDiemDs } = useDanhSachDiaDiem({ trang: 1, kichThuoc: 100, tuKhoa: "" });
  const { data: cauHinhDonVi } = useCauHinhDonVi();

  const goiYDiaDiem =
    diaDiemDs?.duLieu.map((dd) => ({
      value: dd.tenDayDu,
      phu: dd.cacTenTat.length > 0 ? dd.cacTenTat.join(", ") : undefined,
    })) ?? [];

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<NhapLenhDieuCongTacFormInput>({
    resolver: zodResolver(nhapLenhDieuCongTacFormSchema),
    defaultValues: GIA_TRI_MAC_DINH,
  });

  const { fields, append, remove } = useFieldArray({ control, name: "thanhVien" });
  const loaiMauIn = watch("loaiMauIn");
  const coTruongDoan = loaiMauIn === "TRAM" || loaiMauIn === "PHAT_HANH_THU_HOI_VE_E";

  // Tu dien "Muc dich" theo gia tri mac dinh rieng cho loai "Phat hanh, thu
  // hoi ve e" - giong het hanh vi cua dialog "Lap lenh dieu cong tac" that
  // (tao-lenh-dieu-cong-tac-dialog.tsx), CHI khi vua chuyen sang loai nay VA
  // Muc dich hien dang la gia tri mac dinh chung "Cong tac" chua sua.
  const loaiMauInTruoc = useRef(loaiMauIn);
  useEffect(() => {
    const vuaChuyenSangVeE =
      loaiMauIn === "PHAT_HANH_THU_HOI_VE_E" && loaiMauInTruoc.current !== "PHAT_HANH_THU_HOI_VE_E";
    loaiMauInTruoc.current = loaiMauIn;
    if (!vuaChuyenSangVeE) return;
    const macDinhVeE = cauHinhDonVi?.mucDichMacDinhVeE?.trim();
    if (macDinhVeE && getValues("mucDich") === MUC_DICH_MAC_DINH) {
      setValue("mucDich", macDinhVeE, { shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaiMauIn, cauHinhDonVi]);

  const ngayDiDangNhap = watch("ngayDi");
  const ngayVeDangNhap = watch("ngayVe");
  const ngayDiMin = ngayDiDangNhap ? new Date(ngayDiDangNhap).toISOString().slice(0, 10) : undefined;

  useEffect(() => {
    if (ngayDiDangNhap && ngayVeDangNhap && new Date(ngayVeDangNhap) < new Date(ngayDiDangNhap)) {
      setValue("ngayVe", ngayDiDangNhap, { shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ngayDiDangNhap]);

  const tuyChonThemThanhVien = (nhanVienDs?.duLieu ?? []).map((nv) => ({
    value: nv.id,
    label: nv.hoTen,
    moTa: nv.laTaiXe ? `${nv.chucVu} · Tài xế` : nv.chucVu,
  }));

  function themThanhVien(nhanVienId: string) {
    const nv = (nhanVienDs?.duLieu ?? []).find((n) => n.id === nhanVienId);
    if (!nv) return;
    append({
      hoTen: nv.hoTen,
      chucVu: nv.chucVu,
      cccd: nv.cccd ?? "",
      ngaySinh: nv.ngaySinh ? new Date(nv.ngaySinh) : undefined,
      laTruongDoan: false,
      laTaiXe: nv.laTaiXe ?? false,
      ngayDiRieng: getValues("ngayDi"),
      ngayVeRieng: getValues("ngayVe"),
    });
    setDangChonThanhVien("");
  }

  function dong() {
    onOpenChange(false);
    reset(GIA_TRI_MAC_DINH);
    setDangChonThanhVien("");
    loaiMauInTruoc.current = "TUYEN_THUONG";
  }

  function xuLySubmit(duLieu: NhapLenhDieuCongTacFormInput) {
    const thamSo = new URLSearchParams({
      soHieu: duLieu.soHieu,
      ngayKy: duLieu.ngayKy.toISOString(),
      ngayDi: duLieu.ngayDi.toISOString(),
      ngayVe: duLieu.ngayVe.toISOString(),
      diaDiemCongTac: duLieu.diaDiemCongTac,
      mucDich: duLieu.mucDich,
      loaiMauIn: duLieu.loaiMauIn,
      thanhVien: JSON.stringify(duLieu.thanhVien),
      ...(duLieu.canCu ? { canCu: duLieu.canCu } : {}),
    });
    onXemTruoc(
      `${API_BASE_URL}/lenh-dieu-cong-tac/nhap-pdf?${thamSo.toString()}`,
      `Nháp lệnh điều công tác ${duLieu.soHieu}`,
    );
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : dong())}>
      <DialogContent className="flex max-h-[85vh] max-w-3xl flex-col overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nháp Lệnh điều công tác</DialogTitle>
          <DialogDescription>
            Y như form Lập lệnh thật - chỉ khác Số hiệu gõ tay và không lưu vào hệ thống. Người ký lấy theo người
            ký chính thức hiện tại.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(xuLySubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="loaiMauInLdctNhap">Loại lệnh điều công tác</Label>
              <Controller
                control={control}
                name="loaiMauIn"
                render={({ field }) => (
                  <Select id="loaiMauInLdctNhap" value={field.value} onChange={(e) => field.onChange(e.target.value)}>
                    <option value="TUYEN_THUONG">Tuyến thường</option>
                    <option value="TRAM">Trạm (có trưởng đoàn + CCCD trong mẫu in)</option>
                    <option value="PHAT_HANH_THU_HOI_VE_E">
                      Phát hành, thu hồi vé ế (có thêm tiêu đề dưới tên lệnh)
                    </option>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="soHieuLdctNhap">Số hiệu</Label>
              <Input
                id="soHieuLdctNhap"
                placeholder="Ví dụ: 15/LĐCT"
                aria-invalid={!!errors.soHieu}
                {...register("soHieu")}
              />
              {errors.soHieu && <p className="text-sm text-destructive">{errors.soHieu.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="diaDiemLdctNhap">Nơi đến</Label>
            {loaiMauIn === "PHAT_HANH_THU_HOI_VE_E" && (
              <ChonNhanhDiaDiemVeE
                chuoiDiaDiem={cauHinhDonVi?.chuoiDiaDiemThuongDungVeE ?? []}
                onChon={(noiDung) => setValue("diaDiemCongTac", noiDung, { shouldValidate: true, shouldDirty: true })}
              />
            )}
            <Controller
              control={control}
              name="diaDiemCongTac"
              render={({ field }) => (
                <ComboboxVanBan
                  id="diaDiemLdctNhap"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  ariaInvalid={!!errors.diaDiemCongTac}
                  goiY={goiYDiaDiem}
                  choPhepNhieu
                />
              )}
            />
            {errors.diaDiemCongTac && (
              <p className="text-sm text-destructive">{errors.diaDiemCongTac.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="mucDichLdctNhap">Mục đích</Label>
            <Controller
              control={control}
              name="mucDich"
              render={({ field }) => (
                <ComboboxVanBan
                  id="mucDichLdctNhap"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  ariaInvalid={!!errors.mucDich}
                  goiY={GOI_Y_MUC_DICH}
                  placeholder={MUC_DICH_MAC_DINH}
                />
              )}
            />
            {errors.mucDich && <p className="text-sm text-destructive">{errors.mucDich.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="canCuLdctNhap">Căn cứ (tuỳ chọn)</Label>
            <Textarea
              id="canCuLdctNhap"
              rows={2}
              placeholder='Mỗi dòng 1 căn cứ, ví dụ: Căn cứ Quyết định số... ngày... của...;'
              {...register("canCu")}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ngayKyLdctNhap">Ngày lập</Label>
              <Controller
                control={control}
                name="ngayKy"
                render={({ field }) => (
                  <Input
                    id="ngayKyLdctNhap"
                    type="date"
                    aria-invalid={!!errors.ngayKy}
                    value={field.value ? new Date(field.value).toISOString().slice(0, 10) : ""}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                  />
                )}
              />
              {errors.ngayKy && <p className="text-sm text-destructive">{errors.ngayKy.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ngayDiLdctNhap">Ngày đi (chung đoàn)</Label>
              <Controller
                control={control}
                name="ngayDi"
                render={({ field }) => (
                  <Input
                    id="ngayDiLdctNhap"
                    type="date"
                    aria-invalid={!!errors.ngayDi}
                    value={field.value ? new Date(field.value).toISOString().slice(0, 10) : ""}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                  />
                )}
              />
              {errors.ngayDi && <p className="text-sm text-destructive">{errors.ngayDi.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ngayVeLdctNhap">Ngày về (chung đoàn)</Label>
              <Controller
                control={control}
                name="ngayVe"
                render={({ field }) => (
                  <Input
                    id="ngayVeLdctNhap"
                    type="date"
                    min={ngayDiMin}
                    aria-invalid={!!errors.ngayVe}
                    value={field.value ? new Date(field.value).toISOString().slice(0, 10) : ""}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                  />
                )}
              />
              {errors.ngayVe && <p className="text-sm text-destructive">{errors.ngayVe.message}</p>}
            </div>
          </div>

          <div className="space-y-2 rounded-md border border-border p-3">
            <div className="flex items-center justify-between">
              <Label>Danh sách nhân viên đi công tác</Label>
              <span className="text-xs text-muted-foreground">Đã chọn {fields.length} người</span>
            </div>

            <Combobox
              value={dangChonThanhVien}
              onChange={themThanhVien}
              placeholder="-- Gõ tên để thêm thành viên (từ Danh mục Nhân viên) --"
              searchPlaceholder="Gõ tên để tìm..."
              emptyText="Không tìm thấy nhân viên nào."
              options={tuyChonThemThanhVien}
            />
            {errors.thanhVien?.message && <p className="text-sm text-destructive">{errors.thanhVien.message}</p>}
            {errors.thanhVien?.root?.message && (
              <p className="text-sm text-destructive">{errors.thanhVien.root.message}</p>
            )}

            {fields.length > 0 && (
              <div className="space-y-2">
                {fields.map((truong, chiSo) => (
                  <div
                    key={truong.id}
                    className="flex flex-wrap items-center gap-2 rounded-md border border-border/60 bg-muted/30 px-2.5 py-2 text-sm"
                  >
                    <Input
                      className="h-8 w-40 text-xs"
                      placeholder="Họ tên"
                      aria-invalid={!!errors.thanhVien?.[chiSo]?.hoTen}
                      {...register(`thanhVien.${chiSo}.hoTen`)}
                    />
                    <Input
                      className="h-8 w-36 text-xs"
                      placeholder="Chức vụ"
                      aria-invalid={!!errors.thanhVien?.[chiSo]?.chucVu}
                      {...register(`thanhVien.${chiSo}.chucVu`)}
                    />
                    <Input
                      className="h-8 w-28 text-xs"
                      placeholder="CCCD"
                      {...register(`thanhVien.${chiSo}.cccd`)}
                    />

                    {coTruongDoan && (
                      <Controller
                        control={control}
                        name={`thanhVien.${chiSo}.laTruongDoan`}
                        render={({ field }) => (
                          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
                            Trưởng đoàn
                          </label>
                        )}
                      />
                    )}
                    <Controller
                      control={control}
                      name={`thanhVien.${chiSo}.laTaiXe`}
                      render={({ field }) => (
                        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
                          Lái xe
                        </label>
                      )}
                    />

                    <div className="ml-auto flex items-center gap-2">
                      <Controller
                        control={control}
                        name={`thanhVien.${chiSo}.ngayDiRieng`}
                        render={({ field }) => (
                          <Input
                            type="date"
                            className="h-8 w-[9.5rem] text-xs"
                            title="Ngày đi riêng (để trống = theo đoàn)"
                            value={field.value ? new Date(field.value).toISOString().slice(0, 10) : ""}
                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                          />
                        )}
                      />
                      <Controller
                        control={control}
                        name={`thanhVien.${chiSo}.ngayVeRieng`}
                        render={({ field }) => (
                          <Input
                            type="date"
                            className="h-8 w-[9.5rem] text-xs"
                            title="Ngày về riêng (để trống = theo đoàn)"
                            value={field.value ? new Date(field.value).toISOString().slice(0, 10) : ""}
                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                          />
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        onClick={() => remove(chiSo)}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={dong}>
              Đóng
            </Button>
            <Button type="submit">Xem/In nháp</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
