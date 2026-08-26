"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { suaLenhDieuCongTacSchema, type SuaLenhDieuCongTacInput } from "@congtac/validation";
import {
  NGUONG_CANH_BAO_NHE_DO_DAI_NOI_DI_DEN,
  NGUONG_CANH_BAO_MANH_DO_DAI_NOI_DI_DEN,
} from "@congtac/shared";
import { goiApi, LoiApi } from "@/lib/api";
import {
  useLamMoiDanhSachLenhDieuCongTac,
  type LenhDieuCongTac,
} from "@/hooks/use-danh-sach-lenh-dieu-cong-tac";
import { useLamMoiDanhSachLenhDieuXe } from "@/hooks/use-danh-sach-lenh-dieu-xe";
import { useLamMoiDanhSachGiayDiDuong } from "@/hooks/use-danh-sach-giay-di-duong";
import { useLamMoiDanhSachSoCongLenh } from "@/hooks/use-danh-sach-so-cong-lenh";
import { useDanhSachNhanVien } from "@/hooks/use-danh-sach-nhan-vien";
import { useDanhSachPhuongTien } from "@/hooks/use-danh-sach-phuong-tien";
import { useDanhSachDiaDiem } from "@/hooks/use-danh-sach-dia-diem";
import { useCauHinhDonVi } from "@/hooks/use-cau-hinh-don-vi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
import { ComboboxVanBan } from "@/components/ui/combobox-van-ban";
import { ChonNhanhDiaDiemVeE } from "@/components/chon-nhanh-dia-diem-ve-e";
import { CanhBaoTrungLichNhanVien } from "@/components/canh-bao-trung-lich-nhan-vien";
import { CanhBaoTrungLichLenhDieuXe } from "@/components/canh-bao-trung-lich-lenh-dieu-xe";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

/** So sanh 2 Date theo dung 1 ngay (khong quan tam gio/phut) - xem giai thich
 * o tao-lenh-dieu-cong-tac-dialog.tsx. */
function cungNgay(a?: Date, b?: Date) {
  if (!a || !b) return false;
  return new Date(a).toDateString() === new Date(b).toDateString();
}

/**
 * Sua LDCT - form giong het cau truc Tao (bang dong thanh vien, chon tai
 * xe/bien so), chi khac o cho nap san du lieu hien co va gui PATCH. Xem
 * tao-lenh-dieu-cong-tac-dialog.tsx cho phan giai thich chi tiet tung doan.
 */
export function SuaLenhDieuCongTacDialog({
  open,
  onOpenChange,
  lenhDieuCongTac,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lenhDieuCongTac: LenhDieuCongTac | null;
}) {
  const lamMoiDanhSach = useLamMoiDanhSachLenhDieuCongTac();
  // Sua LDCT (them/bot thanh vien, doi tai xe...) co the CASCADE tao/huy GDD
  // va LDX o backend (xem lenh-dieu-cong-tac.service.ts sua()/dongBoLenhDieuXe())
  // - phai lam moi ca 3 danh sach nay, khong chi danh sach LDCT, neu khong cac
  // trang /giay-di-duong, /so-cong-lenh, /lenh-dieu-xe se hien du lieu cu toi
  // 30s (staleTime mac dinh). Nguoi dung phat hien 2026-08-20, xem
  // NHAT_KY_QUYET_DINH.md.
  const lamMoiLenhDieuXe = useLamMoiDanhSachLenhDieuXe();
  const lamMoiGiayDiDuong = useLamMoiDanhSachGiayDiDuong();
  const lamMoiSoCongLenh = useLamMoiDanhSachSoCongLenh();
  const [loiChung, setLoiChung] = useState<string | null>(null);
  const [dangChonThanhVien, setDangChonThanhVien] = useState("");
  // Checkbox "Lap kem lenh dieu xe" - xem giai thich chi tiet o
  // tao-lenh-dieu-cong-tac-dialog.tsx. Khac voi dialog Tao (luon mac dinh
  // BAT cho lenh moi), dialog Sua khoi tao gia tri checkbox theo DUNG trang
  // thai da luu cua lenh dang sua (co LDX dang hoat dong hay khong) - xem
  // effect "reset() khi mo dialog" ben duoi - de khong tu y doi hanh vi cua
  // 1 lenh da luu chi vi mo lai form sua. Nguoi dung yeu cau 2026-08-13, xem
  // NHAT_KY_QUYET_DINH.md.
  const [coLapLenhDieuXe, setCoLapLenhDieuXe] = useState(true);
  const soTaiXeUngVienTruoc = useRef(0);
  const daGhiNhanTaiXeBanDau = useRef(false);

  const { data: nhanVienDs } = useDanhSachNhanVien({
    trang: 1,
    kichThuoc: 100,
    tuKhoa: "",
    chiTaiXe: false,
    trangThai: "DANG_LAM_VIEC",
  });
  const { data: phuongTienDs } = useDanhSachPhuongTien({
    trang: 1,
    kichThuoc: 100,
    tuKhoa: "",
    trangThai: "DANG_SU_DUNG",
  });
  const { data: diaDiemDs } = useDanhSachDiaDiem({ trang: 1, kichThuoc: 100, tuKhoa: "" });
  const { data: cauHinhDonVi } = useCauHinhDonVi();

  const goiYDiaDiem =
    diaDiemDs?.duLieu.map((dd) => ({
      value: dd.tenDayDu,
      phu: dd.cacTenTat.length > 0 ? dd.cacTenTat.join(", ") : undefined,
    })) ?? [];

  const nhanVienMap = new Map((nhanVienDs?.duLieu ?? []).map((nv) => [nv.id, nv]));

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SuaLenhDieuCongTacInput>({ resolver: zodResolver(suaLenhDieuCongTacSchema) });

  const { fields, append, remove } = useFieldArray({ control, name: "thanhVien" });
  const loaiMauIn = watch("loaiMauIn");
  const coTruongDoan = loaiMauIn === "TRAM" || loaiMauIn === "PHAT_HANH_THU_HOI_VE_E";

  const ngayDiDangNhap = watch("ngayDi");
  const ngayVeDangNhap = watch("ngayVe");
  const ngayDiMin = ngayDiDangNhap ? new Date(ngayDiDangNhap).toISOString().slice(0, 10) : undefined;
  const taiXeDaChon = watch("taiXeNhanVienId");
  const phuongTienDaChonLdx = watch("phuongTienId");
  // LDX dang gan voi LDCT nay (chua huy, neu co) - dung de loai tru khoi ket
  // qua kiem tra trung lich cua chinh no (khong tu bao trung voi ban than).
  const ldxHienTaiId = lenhDieuCongTac?.lenhDieuXe?.find((l) => !l.daHuy)?.id;

  // Canh bao SOM neu Dia diem cong tac (= "Noi den" mac dinh cua moi GDD sinh
  // kem) qua dai - CHI dua vao truong nay (khac dialog Tao co ca "Noi di"):
  // dialog Sua KHONG co truong "Noi di" rieng (sua o day khong doi duoc, chi
  // dat 1 lan luc Tao qua GiayDiDuong.noiDiRieng - xem doc comment o dialog
  // Tao), nen chi tinh 1 chieu, van du huu ich de canh bao som. Nguong dung
  // CHUNG voi dialog Tao/mau in GDD (packages/shared) du chi tinh 1 phan cua
  // tong do dai thuc te (co the con Noi di rieng cua tung thanh vien nua) -
  // chap nhan la tin hieu GAN DUNG, khong can chinh xac tuyet doi vi day chi
  // la canh bao/huong dan, khong phai loi validation cung.
  const diaDiemDangNhap = watch("diaDiemCongTac");
  const doDaiNoiDiDen = diaDiemDangNhap?.length ?? 0;
  const canhBaoManhNoiDiDen = doDaiNoiDiDen > NGUONG_CANH_BAO_MANH_DO_DAI_NOI_DI_DEN;
  const canhBaoNheNoiDiDen = !canhBaoManhNoiDiDen && doDaiNoiDiDen > NGUONG_CANH_BAO_NHE_DO_DAI_NOI_DI_DEN;

  useEffect(() => {
    if (open && lenhDieuCongTac) {
      const ldxDangHoatDong = lenhDieuCongTac.lenhDieuXe?.find((l) => !l.daHuy);
      // Nguoi chua co ngay rieng (null) hien thi mac dinh TRUNG voi ngay
      // chung cua doan (khong de trong) - se tu dong bo lai ve "theo doan"
      // luc gui len neu khong sua gi them, xem cungNgay() o xuLySubmit.
      reset({
        diaDiemCongTac: lenhDieuCongTac.diaDiemCongTac,
        mucDich: lenhDieuCongTac.mucDich,
        ghiChu: lenhDieuCongTac.ghiChu ?? undefined,
        ngayDi: new Date(lenhDieuCongTac.ngayDi),
        ngayVe: new Date(lenhDieuCongTac.ngayVe),
        ngayKy: new Date(lenhDieuCongTac.ngayKy),
        thanhVien: (lenhDieuCongTac.thanhVien ?? [])
          .filter((tv) => !tv.daLoaiKhoiDoan)
          .map((tv) => ({
            id: tv.id,
            nhanVienId: tv.nhanVienId ?? "",
            ngayDiRieng: tv.ngayDiRieng ? new Date(tv.ngayDiRieng) : new Date(lenhDieuCongTac.ngayDi),
            ngayVeRieng: tv.ngayVeRieng ? new Date(tv.ngayVeRieng) : new Date(lenhDieuCongTac.ngayVe),
            laTruongDoan: tv.laTruongDoan,
          })),
        taiXeNhanVienId: ldxDangHoatDong?.laiXeId ?? undefined,
        phuongTienId: ldxDangHoatDong?.phuongTienId ?? undefined,
        loaiMauIn: lenhDieuCongTac.loaiMauIn,
      });
      setCoLapLenhDieuXe(Boolean(ldxDangHoatDong));
      // Chua ghi nhan so tai xe ung vien "nen" cho lenh nay - effect ben duoi
      // (theo doi taiXeUngVien.length) se tu ghi nhan o lan chay dau tien SAU
      // reset nay, khong ap dung logic tu bat lai checkbox cho lan do (tranh
      // ghi de gia tri coLapLenhDieuXe vua tinh chinh xac o tren).
      daGhiNhanTaiXeBanDau.current = false;
      setLoiChung(null);
      setDangChonThanhVien("");
    }
  }, [open, lenhDieuCongTac, reset]);

  useEffect(() => {
    if (ngayDiDangNhap && ngayVeDangNhap && new Date(ngayVeDangNhap) < new Date(ngayDiDangNhap)) {
      setValue("ngayVe", ngayDiDangNhap, { shouldValidate: true, shouldDirty: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ngayDiDangNhap]);

  const taiXeUngVien = fields
    .map((f) => nhanVienMap.get(f.nhanVienId))
    .filter((nv): nv is NonNullable<typeof nv> => !!nv && nv.laTaiXe);

  // Lan chay dau tien SAU moi lan reset() chi ghi nhan "nen" (khong ap dung
  // logic tu bat lai), cac lan sau moi tu bat lai checkbox khi so tai xe ung
  // vien chuyen tu 0 sang > 0 (nguoi dung them 1 tai xe moi trong khi dang
  // sua) - xem giai thich day du o tao-lenh-dieu-cong-tac-dialog.tsx.
  useEffect(() => {
    if (!daGhiNhanTaiXeBanDau.current) {
      soTaiXeUngVienTruoc.current = taiXeUngVien.length;
      daGhiNhanTaiXeBanDau.current = true;
      return;
    }
    if (taiXeUngVien.length > 0 && soTaiXeUngVienTruoc.current === 0) {
      setCoLapLenhDieuXe(true);
    }
    soTaiXeUngVienTruoc.current = taiXeUngVien.length;
  }, [taiXeUngVien.length]);

  useEffect(() => {
    if (!coLapLenhDieuXe) {
      setValue("taiXeNhanVienId", null);
      setValue("phuongTienId", null);
      return;
    }
    // Bat lai checkbox - tu dong dien lai tai xe dau tien trong danh sach
    // ung vien + xe thuong dung cua ho (neu co), giong het hanh vi luc them
    // thanh vien vao doan. CHI dien khi CHUA co ai duoc chon (khong ghi de
    // gia tri da nap san tu ldxDangHoatDong luc mo dialog, cung khong ghi de
    // neu nguoi dung da tu tay chon 1 nguoi khac). Xem giai thich day du o
    // tao-lenh-dieu-cong-tac-dialog.tsx va NHAT_KY_QUYET_DINH.md.
    if (!getValues("taiXeNhanVienId") && taiXeUngVien.length > 0) {
      const nv = taiXeUngVien[0];
      setValue("taiXeNhanVienId", nv.id, { shouldValidate: true, shouldDirty: true });
      const xeThuongDung = phuongTienDs?.duLieu.find((pt) => pt.taiXeThuongDungId === nv.id);
      if (xeThuongDung) {
        setValue("phuongTienId", xeThuongDung.id, { shouldValidate: true, shouldDirty: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coLapLenhDieuXe]);

  useEffect(() => {
    if (taiXeDaChon && !taiXeUngVien.some((nv) => nv.id === taiXeDaChon)) {
      setValue("taiXeNhanVienId", null);
      setValue("phuongTienId", null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields.length]);

  const tuyChonThemThanhVien = (nhanVienDs?.duLieu ?? [])
    .filter((nv) => !fields.some((f) => f.nhanVienId === nv.id))
    .map((nv) => ({ value: nv.id, label: nv.hoTen, moTa: nv.laTaiXe ? `${nv.chucVu} · Tài xế` : nv.chucVu }));

  if (!lenhDieuCongTac) return null;

  async function xuLySubmit(duLieu: SuaLenhDieuCongTacInput) {
    if (!lenhDieuCongTac) return;
    setLoiChung(null);
    try {
      const duLieuGuiDi: SuaLenhDieuCongTacInput = {
        ...duLieu,
        thanhVien: duLieu.thanhVien?.map((tv) => ({
          ...tv,
          ngayDiRieng: cungNgay(tv.ngayDiRieng, duLieu.ngayDi) ? undefined : tv.ngayDiRieng,
          ngayVeRieng: cungNgay(tv.ngayVeRieng, duLieu.ngayVe) ? undefined : tv.ngayVeRieng,
        })),
      };
      await goiApi(`/lenh-dieu-cong-tac/${lenhDieuCongTac.id}`, {
        method: "PATCH",
        body: JSON.stringify(duLieuGuiDi),
      });
      await Promise.all([lamMoiDanhSach(), lamMoiLenhDieuXe(), lamMoiGiayDiDuong(), lamMoiSoCongLenh()]);
      onOpenChange(false);
    } catch (loi) {
      setLoiChung(loi instanceof LoiApi ? loi.message : "Không thể lưu thay đổi, vui lòng thử lại");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-3xl flex-col overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sửa lệnh điều công tác {lenhDieuCongTac.soHieu}</DialogTitle>
          <DialogDescription>
            Bớt thành viên sẽ hỏi thêm để hủy công lệnh/giấy đi đường của người đó. Sửa được đến khi chứng từ bị
            hủy.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(xuLySubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="diaDiemSuaLdct">Địa điểm công tác</Label>
            {/* Chon nhanh tuyen thuong dung - xem giai thich day du o
                tao-lenh-dieu-cong-tac-dialog.tsx. Nguoi dung yeu cau
                2026-08-17, xem NHAT_KY_QUYET_DINH.md. */}
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
                  id="diaDiemSuaLdct"
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
            {/* Canh bao do dai (2026-08-14) - xem giai thich tai khai bao
                doDaiNoiDiDen ben tren. */}
            {canhBaoManhNoiDiDen && (
              <p className="flex items-start gap-1.5 text-sm text-destructive">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                Địa điểm công tác khá dài ({doDaiNoiDiDen} ký tự) — bản in Công lệnh/Giấy đi đường có thể bị ảnh
                hưởng bố cục. Nên rút gọn nếu được.
              </p>
            )}
            {canhBaoNheNoiDiDen && (
              <p className="flex items-start gap-1.5 text-sm text-amber-600 dark:text-amber-400">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                Địa điểm công tác hơi dài ({doDaiNoiDiDen} ký tự) — hệ thống sẽ tự thu gọn bản in Công lệnh/Giấy đi
                đường để vừa 1 trang.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="mucDichSuaLdct">Mục đích</Label>
            <Input id="mucDichSuaLdct" aria-invalid={!!errors.mucDich} {...register("mucDich")} />
            {errors.mucDich && <p className="text-sm text-destructive">{errors.mucDich.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ghiChuSuaLdct">Ghi chú (nội bộ, không in ra chứng từ)</Label>
            <Textarea
              id="ghiChuSuaLdct"
              rows={2}
              aria-invalid={!!errors.ghiChu}
              {...register("ghiChu")}
            />
            {errors.ghiChu && <p className="text-sm text-destructive">{errors.ghiChu.message}</p>}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ngayKySuaLdct">Ngày lập</Label>
              <Controller
                control={control}
                name="ngayKy"
                render={({ field }) => (
                  <Input
                    id="ngayKySuaLdct"
                    type="date"
                    value={field.value ? new Date(field.value).toISOString().slice(0, 10) : ""}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                  />
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ngayDiSuaLdct">Ngày đi (chung đoàn)</Label>
              <Controller
                control={control}
                name="ngayDi"
                render={({ field }) => (
                  <Input
                    id="ngayDiSuaLdct"
                    type="date"
                    value={field.value ? new Date(field.value).toISOString().slice(0, 10) : ""}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                  />
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ngayVeSuaLdct">Ngày về (chung đoàn)</Label>
              <Controller
                control={control}
                name="ngayVe"
                render={({ field }) => (
                  <Input
                    id="ngayVeSuaLdct"
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

          <div className="space-y-1.5">
            <Label htmlFor="mauInTramSuaLdct">Loại mẫu in</Label>
            <Controller
              control={control}
              name="loaiMauIn"
              render={({ field }) => (
                <Select
                  id="mauInTramSuaLdct"
                  value={field.value ?? "TUYEN_THUONG"}
                  onChange={(e) => field.onChange(e.target.value)}
                >
                  <option value="TUYEN_THUONG">Tuyến thường</option>
                  <option value="TRAM">Trạm (có trưởng đoàn + CCCD trong mẫu in)</option>
                  <option value="PHAT_HANH_THU_HOI_VE_E">
                    Phát hành, thu hồi vé ế (có thêm tiêu đề dưới tên lệnh)
                  </option>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2 rounded-md border border-border p-3">
            <div className="flex items-center justify-between">
              <Label>Danh sách nhân viên đi công tác</Label>
              <span className="text-xs text-muted-foreground">Đã chọn {fields.length} người</span>
            </div>

            <Combobox
              value={dangChonThanhVien}
              onChange={(nhanVienId) => {
                append({
                  nhanVienId,
                  ngayDiRieng: getValues("ngayDi"),
                  ngayVeRieng: getValues("ngayVe"),
                  laTruongDoan: false,
                });
                setDangChonThanhVien("");

                const nv = nhanVienMap.get(nhanVienId);
                if (nv?.laTaiXe && coLapLenhDieuXe && !getValues("taiXeNhanVienId")) {
                  setValue("taiXeNhanVienId", nv.id, { shouldValidate: true, shouldDirty: true });
                  const xeThuongDung = phuongTienDs?.duLieu.find((pt) => pt.taiXeThuongDungId === nv.id);
                  if (xeThuongDung) {
                    setValue("phuongTienId", xeThuongDung.id, { shouldValidate: true, shouldDirty: true });
                  }
                }
              }}
              placeholder="-- Gõ tên để thêm thành viên --"
              searchPlaceholder="Gõ tên để tìm..."
              emptyText="Không tìm thấy nhân viên nào."
              options={tuyChonThemThanhVien}
            />
            {errors.thanhVien && typeof errors.thanhVien.message === "string" && (
              <p className="text-sm text-destructive">{errors.thanhVien.message}</p>
            )}

            {fields.length > 0 && (
              <div className="space-y-2">
                {fields.map((field, index) => {
                  const nv = nhanVienMap.get(field.nhanVienId);
                  // Xem giai thich day du o tao-lenh-dieu-cong-tac-dialog.tsx
                  // - khac 1 diem: co truyen loaiTruLenhId (id chinh LDCT dang
                  // sua) de khong tu bao trung voi ban than no.
                  const ngayDiRiengHienTai = watch(`thanhVien.${index}.ngayDiRieng`);
                  const ngayVeRiengHienTai = watch(`thanhVien.${index}.ngayVeRieng`);
                  const ngayDiHieuLuc = ngayDiRiengHienTai ? new Date(ngayDiRiengHienTai) : ngayDiDangNhap;
                  const ngayVeHieuLuc = ngayVeRiengHienTai ? new Date(ngayVeRiengHienTai) : ngayVeDangNhap;
                  return (
                    <div
                      key={field.id}
                      className="flex flex-wrap items-center gap-2 rounded-md border border-border/60 bg-muted/30 px-2.5 py-2 text-sm"
                    >
                      <span className="min-w-[9rem] font-medium">
                        {nv?.hoTen ?? "(không rõ)"}
                        {nv?.laTaiXe && (
                          <span className="ml-1 text-xs font-normal text-blue-700 dark:text-blue-300">
                            · Tài xế
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground">{nv?.chucVu}</span>

                      {coTruongDoan && (
                        <Controller
                          control={control}
                          name={`thanhVien.${index}.laTruongDoan` as const}
                          render={({ field: fTruongDoan }) => (
                            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Checkbox
                                checked={!!fTruongDoan.value}
                                onCheckedChange={(checked) => {
                                  fields.forEach((_, i) =>
                                    setValue(`thanhVien.${i}.laTruongDoan`, i === index && !!checked, {
                                      shouldDirty: true,
                                    }),
                                  );
                                }}
                              />
                              Trưởng đoàn
                            </label>
                          )}
                        />
                      )}

                      <div className="ml-auto flex items-center gap-2">
                        <Controller
                          control={control}
                          name={`thanhVien.${index}.ngayDiRieng` as const}
                          render={({ field: f }) => (
                            <Input
                              type="date"
                              className="h-8 w-[9.5rem] text-xs"
                              title="Ngày đi riêng (để trống = theo đoàn)"
                              value={f.value ? new Date(f.value).toISOString().slice(0, 10) : ""}
                              onChange={(e) => f.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                            />
                          )}
                        />
                        <Controller
                          control={control}
                          name={`thanhVien.${index}.ngayVeRieng` as const}
                          render={({ field: f }) => (
                            <Input
                              type="date"
                              className="h-8 w-[9.5rem] text-xs"
                              title="Ngày về riêng (để trống = theo đoàn)"
                              value={f.value ? new Date(f.value).toISOString().slice(0, 10) : ""}
                              onChange={(e) => f.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                            />
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-destructive"
                          title="Loại khỏi đoàn (sẽ hủy công lệnh/giấy đi đường của người này)"
                          onClick={() => remove(index)}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>

                      <CanhBaoTrungLichNhanVien
                        nhanVienId={field.nhanVienId}
                        ngayDi={ngayDiHieuLuc}
                        ngayVe={ngayVeHieuLuc}
                        loaiTruLenhId={lenhDieuCongTac?.id}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {taiXeUngVien.length > 0 && (
            <div className="space-y-3 rounded-md border border-border p-3">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox
                  checked={coLapLenhDieuXe}
                  onCheckedChange={(checked) => setCoLapLenhDieuXe(!!checked)}
                />
                Trong đoàn có tài xế — lập kèm lệnh điều xe
              </label>

              {coLapLenhDieuXe ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="taiXeSuaLdct">Tài xế</Label>
                    <Controller
                      control={control}
                      name="taiXeNhanVienId"
                      render={({ field }) => (
                        <Combobox
                          id="taiXeSuaLdct"
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          placeholder="-- Không có lệnh điều xe --"
                          options={taiXeUngVien.map((nv) => ({ value: nv.id, label: nv.hoTen, moTa: nv.chucVu }))}
                        />
                      )}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phuongTienSuaLdct">Biển số xe</Label>
                    <Controller
                      control={control}
                      name="phuongTienId"
                      render={({ field }) => (
                        <Combobox
                          id="phuongTienSuaLdct"
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          disabled={!taiXeDaChon}
                          placeholder="-- Chọn biển số --"
                          options={
                            phuongTienDs?.duLieu.map((pt) => ({
                              value: pt.id,
                              label: pt.bienSo,
                              moTa: pt.nhanHieu,
                            })) ?? []
                          }
                        />
                      )}
                    />
                  </div>
                  <div className="col-span-2">
                    <CanhBaoTrungLichLenhDieuXe
                      laiXeId={taiXeDaChon ?? undefined}
                      phuongTienId={phuongTienDaChonLdx ?? undefined}
                      ngayDi={ngayDiDangNhap ? new Date(ngayDiDangNhap) : undefined}
                      ngayVe={ngayVeDangNhap ? new Date(ngayVeDangNhap) : undefined}
                      loaiTruId={ldxHienTaiId}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Sẽ không có lệnh điều xe (ví dụ: đoàn đi xe thuê, tài xế đi như thành viên bình thường). Bỏ chọn
                  sẽ hủy lệnh điều xe đang có (nếu có).
                </p>
              )}
            </div>
          )}

          {loiChung && (
            <div role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {loiChung}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
