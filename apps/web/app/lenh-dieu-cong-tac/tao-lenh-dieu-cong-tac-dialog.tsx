"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taoLenhDieuCongTacSchema, type TaoLenhDieuCongTacInput } from "@congtac/validation";
import {
  NGUONG_CANH_BAO_NHE_DO_DAI_NOI_DI_DEN,
  NGUONG_CANH_BAO_MANH_DO_DAI_NOI_DI_DEN,
} from "@congtac/shared";
import { goiApi, LoiApi } from "@/lib/api";
import { useLamMoiDanhSachLenhDieuCongTac, type LenhDieuCongTac } from "@/hooks/use-danh-sach-lenh-dieu-cong-tac";
import { useLamMoiDanhSachLenhDieuXe } from "@/hooks/use-danh-sach-lenh-dieu-xe";
import { useLamMoiDanhSachGiayDiDuong } from "@/hooks/use-danh-sach-giay-di-duong";
import { useLamMoiDanhSachSoCongLenh } from "@/hooks/use-danh-sach-so-cong-lenh";
import { useDanhSachNhanVien } from "@/hooks/use-danh-sach-nhan-vien";
import { useDanhSachPhuongTien } from "@/hooks/use-danh-sach-phuong-tien";
import { useDanhSachDiaDiem } from "@/hooks/use-danh-sach-dia-diem";
import { useGoiYDiaDiemLichSu } from "@/hooks/use-goi-y-dia-diem-lich-su";
import { useCauHinhDonVi } from "@/hooks/use-cau-hinh-don-vi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
import { Textarea } from "@/components/ui/textarea";
import { ComboboxVanBan } from "@/components/ui/combobox-van-ban";
import { GOI_Y_MUC_DICH, MUC_DICH_MAC_DINH } from "@/lib/constants/muc-dich";
import { ChonNhanhDiaDiemVeE } from "@/components/chon-nhanh-dia-diem-ve-e";
import { LoTrinhDaChangInput } from "@/components/lo-trinh-da-chang-input";
import { CanhBaoTrungLichNhanVien } from "@/components/canh-bao-trung-lich-nhan-vien";
import { CanhBaoTrungLichLenhDieuXe } from "@/components/canh-bao-trung-lich-lenh-dieu-xe";
import { CanhBaoNgayLapKhongTheoThuTu } from "@/components/canh-bao-ngay-lap-khong-theo-thu-tu";
import { AlertTriangle, ChevronDown, ChevronUp, X } from "lucide-react";
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

/** Ngay mai - mac dinh cho Ngay di/Ngay ve chung doan khi Lap lenh moi (khac
 * Ngay ky van luon mac dinh la hom nay) - da so chuyen cong tac duoc lap
 * truoc it nhat 1 ngay, hiem khi di ngay trong ngay lap lenh. Nguoi dung yeu
 * cau 2026-08-13, xem NHAT_KY_QUYET_DINH.md. */
function ngayMai() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}


/** So sanh 2 Date theo dung 1 ngay (khong quan tam gio/phut) - dung de biet
 * ngay rieng cua 1 thanh vien co con "bang" ngay chung cua doan hay khong,
 * truoc khi gui len server (xem giai thich o xuLySubmit ben duoi). */
function cungNgay(a?: Date, b?: Date) {
  if (!a || !b) return false;
  return new Date(a).toDateString() === new Date(b).toDateString();
}

export function TaoLenhDieuCongTacDialog({
  open,
  onOpenChange,
  duLieuSaoChep,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Khac null khi mo dialog nay tu nut "Sao chep" o danh sach (khong phai
   * nut "Lap lenh dieu cong tac" thong thuong) - dien san 1 so truong tu
   * lenh nay vao form Tao, xem useEffect "seed tu duLieuSaoChep" ben duoi.
   * Xem docs/superpowers/specs/2026-08-10-clone-lenh-dieu-cong-tac-design.md. */
  duLieuSaoChep?: LenhDieuCongTac | null;
}) {
  const lamMoiDanhSach = useLamMoiDanhSachLenhDieuCongTac();
  // Tao LDCT sinh kem GDD cho tung thanh vien + LDX (neu co tai xe) - phai
  // lam moi ca 3 danh sach nay, khong chi danh sach LDCT, neu khong cac trang
  // /giay-di-duong, /so-cong-lenh, /lenh-dieu-xe se hien du lieu cu (xem giai
  // thich day du o sua-lenh-dieu-cong-tac-dialog.tsx va NHAT_KY_QUYET_DINH.md
  // muc "GDD/LDX khong cap nhat sau khi sua LDCT").
  const lamMoiLenhDieuXe = useLamMoiDanhSachLenhDieuXe();
  const lamMoiGiayDiDuong = useLamMoiDanhSachGiayDiDuong();
  const lamMoiSoCongLenh = useLamMoiDanhSachSoCongLenh();
  const [loiChung, setLoiChung] = useState<string | null>(null);
  // Combobox them thanh vien - chua nam trong React Hook Form, chi dung de
  // chon roi append vao mang thanhVien (reset ve rong ngay sau khi chon).
  const [dangChonThanhVien, setDangChonThanhVien] = useState("");

  // Lay toi da 100 nguoi dang lam viec - dung chung cho ca combobox them
  // thanh vien lan hien thi ho ten/chuc vu/co tai xe cua nguoi da them (giong
  // cach LDX lam voi lai xe/phuong tien - xem tao-lenh-dieu-xe-dialog.tsx).
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

  // Gop them goi y "Noi den" tu LICH SU cac LDCT da lap truoc day (nguoi dung
  // yeu cau 2026-09-04, xem NHAT_KY_QUYET_DINH.md va doc comment day du o
  // LenhDieuCongTacService.goiYDiaDiemLichSu()). CHI dung rieng cho o "Noi
  // den" (diaDiemCongTac) - o "Noi di" van chi dung goiYDiaDiem (Danh muc)
  // nhu cu, vi lich su chi lay tu truong diaDiemCongTac. Loc trung voi
  // goiYDiaDiem theo value (uu tien giu ban ghi Danh muc vi co "phu" - cac
  // ten tat - con lich su thi khong).
  const { data: diaDiemLichSu } = useGoiYDiaDiemLichSu();
  const cacGiaTriDaCoTrongDanhMuc = new Set(goiYDiaDiem.map((g) => g.value));
  const goiYNoiDenGomLichSu = [
    ...goiYDiaDiem,
    ...(diaDiemLichSu ?? [])
      .filter((dd) => !cacGiaTriDaCoTrongDanhMuc.has(dd))
      .map((dd) => ({ value: dd })),
  ];

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
  } = useForm<TaoLenhDieuCongTacInput>({
    resolver: zodResolver(taoLenhDieuCongTacSchema),
    defaultValues: {
      ngayKy: new Date(ngayHomNay()),
      ngayDi: new Date(ngayMai()),
      ngayVe: new Date(ngayMai()),
      mucDich: MUC_DICH_MAC_DINH,
      cacChang: null,
      thanhVien: [],
      loaiMauIn: "TUYEN_THUONG",
    },
  });

  const { fields, append, insert, remove, swap } = useFieldArray({ control, name: "thanhVien" });
  const loaiMauIn = watch("loaiMauIn");
  const coTruongDoan = loaiMauIn === "TRAM" || loaiMauIn === "PHAT_HANH_THU_HOI_VE_E";

  // Tu dien "Muc dich" theo gia tri MAC DINH RIENG cho loai "Phat hanh, thu
  // hoi ve e" (CauHinhDonVi.mucDichMacDinhVeE, sua tai /cau-hinh-don-vi) - CHI
  // khi nguoi dung VUA CHUYEN loaiMauIn SANG loai nay (phat hien bang
  // useRef luu loai truoc do, giong cach lam voi "Trong doan co tai xe" o
  // duoi) VA o Muc dich hien dang la gia tri mac dinh chung "Cong tac" chua
  // sua (khong ghi de neu nguoi dung da tu go noi dung rieng truoc khi doi
  // loai). Neu chua cau hinh gia tri rieng (rong/null) thi khong lam gi, giu
  // nguyen "Cong tac". Nguoi dung yeu cau 2026-08-14, xem NHAT_KY_QUYET_DINH.md.
  const loaiMauInTruoc = useRef(loaiMauIn);
  useEffect(() => {
    const vuaChuyenSangVeE = loaiMauIn === "PHAT_HANH_THU_HOI_VE_E" && loaiMauInTruoc.current !== "PHAT_HANH_THU_HOI_VE_E";
    loaiMauInTruoc.current = loaiMauIn;
    if (!vuaChuyenSangVeE) return;
    const macDinhVeE = cauHinhDonVi?.mucDichMacDinhVeE?.trim();
    if (macDinhVeE && getValues("mucDich") === MUC_DICH_MAC_DINH) {
      setValue("mucDich", macDinhVeE, { shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaiMauIn, cauHinhDonVi]);

  // Seed form tu lenh duoc "Sao chep" (neu co) moi khi dialog vua mo - dialog
  // nay o mount 1 lan duy nhat va chi bat/tat qua prop "open" (xem dong() o
  // duoi cung dat reset() ve gia tri rong luc dong), nen phai dung effect
  // theo doi [open, duLieuSaoChep] thay vi chi dua vao defaultValues cua
  // useForm (chi ap dung 1 lan luc mount).
  //
  // CHI copy: diaDiemCongTac/mucDich/canCu/ngayDi/ngayVe/loaiMauIn. KHONG
  // copy taiXeNhanVienId/phuongTienId du spec ban dau co du dinh - phat hien
  // luc code: backend tao() gia dinh tai xe PHAI la 1 thanhVien trong doan
  // (`duLieu.thanhVien.find(tv => tv.nhanVienId === taiXeNhanVienId)!`, xem
  // lenh-dieu-cong-tac.service.ts) va o "Tai xe/Bien so" trong form nay chi
  // hien khi co it nhat 1 thanhVien la tai xe (taiXeUngVien.length > 0) - vi
  // thanhVien LUON de rong khi sao chep (nguoi dung da chon ro), giu lai gia
  // tri tai xe/xe cu se tao trang thai an, khong sua duoc qua giao dien, va
  // co the gay loi luc Luu neu nguoi dung khong tinh co them dung nguoi do
  // lam thanh vien. An toan hon la KHONG copy, nguoi dung tu chon lai tai xe
  // sau khi them thanh vien (dung luong lai UX binh thuong cua "Tao moi").
  // Xem NHAT_KY_QUYET_DINH.md.
  useEffect(() => {
    if (!open || !duLieuSaoChep) return;
    reset({
      diaDiemCongTac: duLieuSaoChep.diaDiemCongTac,
      mucDich: duLieuSaoChep.mucDich,
      canCu: duLieuSaoChep.canCu ?? undefined,
      ngayDi: new Date(duLieuSaoChep.ngayDi),
      ngayVe: new Date(duLieuSaoChep.ngayVe),
      ngayKy: new Date(ngayHomNay()),
      loaiMauIn: duLieuSaoChep.loaiMauIn,
      thanhVien: [],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, duLieuSaoChep]);

  // Dien san "Noi di" = dia diem dang danh dau "diem di mac dinh" trong Danh
  // muc Dia diem (diemDiMacDinh) - CHI khi dialog vua mo VA truong nay dang
  // rong (getValues, khong phai watch, de khong lap lai moi lan render) -
  // tranh ghi de neu nguoi dung da tu go gia tri khac, hoac neu buoc seed tu
  // duLieuSaoChep o tren (chay TRUOC effect nay, cung theo doi "open") da
  // dien gia tri khac roi. diaDiemDs tai bat dong bo nen effect nay co the
  // chay LAN 2 sau khi du lieu ve (deps co diaDiemDs) - van an toan vi van
  // kiem tra "dang rong" truoc khi dien. Nguoi dung yeu cau 2026-08-10, xem
  // NHAT_KY_QUYET_DINH.md.
  useEffect(() => {
    if (!open || !diaDiemDs || getValues("noiDi")) return;
    const macDinh = diaDiemDs.duLieu.find((dd) => dd.diemDiMacDinh);
    if (macDinh) setValue("noiDi", macDinh.tenDayDu);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, diaDiemDs]);

  const ngayKyDangNhap = watch("ngayKy");
  const ngayDiDangNhap = watch("ngayDi");
  const ngayVeDangNhap = watch("ngayVe");
  const ngayDiMin = ngayDiDangNhap ? new Date(ngayDiDangNhap).toISOString().slice(0, 10) : undefined;
  const taiXeDaChon = watch("taiXeNhanVienId");
  const phuongTienDaChonLdx = watch("phuongTienId");

  // Canh bao SOM (ngay khi go, chua can luu) neu Noi di + Noi den qua dai -
  // dung CHUNG 2 nguong voi mau in GDD (noiDungMatTruocGdd trong
  // lenh-dieu-cong-tac-mau-in.ts, packages/shared) de khong bi lech: vuot nhe
  // thi backend TU thu gon ban in (van in duoc, chi la thong bao), vuot nguong
  // manh hon thi kha nang cao van anh huong bo cuc du da thu gon - khuyen
  // nguoi dung rut gon. KHONG chan luu (chi la canh bao/huong dan, khong phai
  // loi validation cung) - nguoi dung van co the luu neu thuc su can noi dung
  // dai. Nguoi dung yeu cau 2026-08-14, xem NHAT_KY_QUYET_DINH.md.
  const noiDiDangNhap = watch("noiDi");
  const diaDiemDangNhap = watch("diaDiemCongTac");
  const doDaiNoiDiDen = (noiDiDangNhap?.length ?? 0) + (diaDiemDangNhap?.length ?? 0);
  const canhBaoManhNoiDiDen = doDaiNoiDiDen > NGUONG_CANH_BAO_MANH_DO_DAI_NOI_DI_DEN;
  const canhBaoNheNoiDiDen = !canhBaoManhNoiDiDen && doDaiNoiDiDen > NGUONG_CANH_BAO_NHE_DO_DAI_NOI_DI_DEN;

  // Keo Ngay ve theo Ngay di khi Ngay di doi sang sau Ngay ve dang co - giong
  // tao-lenh-dieu-xe-dialog.tsx.
  useEffect(() => {
    if (ngayDiDangNhap && ngayVeDangNhap && new Date(ngayVeDangNhap) < new Date(ngayDiDangNhap)) {
      setValue("ngayVe", ngayDiDangNhap, { shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ngayDiDangNhap]);

  // Danh sach nguoi mang co tai xe TRONG SO cac thanh vien da chon - chi hien
  // o Tai xe/Bien so khi doan co it nhat 1 nguoi nhu vay.
  const thanhVienForm = watch("thanhVien") ?? [];
  const taiXeUngVien = thanhVienForm
    .map((tv) => (tv?.nhanVienId ? nhanVienMap.get(tv.nhanVienId) : undefined))
    .filter((nv): nv is NonNullable<typeof nv> => !!nv && nv.laTaiXe);

  // Checkbox "Lap kem lenh dieu xe" - MAC DINH BAT khi doan co tai xe (nguoi
  // dung xac nhan 2026-08-13: da so chuyen di dung xe cong ty, chi it truong
  // hop dung xe thue/tai xe khong lai xe chuyen nay). Bo check thi an han 2 o
  // Tai xe/Bien so va XOA gia tri truoc khi gui len server (xem effect ben
  // duoi va onSubmit) - de dam bao KHONG tao LDX du doan co tai xe. Dung
  // useRef de chi tu dong bat lai checkbox khi so tai xe ung vien chuyen tu 0
  // sang > 0 (lan dau xuat hien tai xe trong doan) - khong ghi de lua chon
  // thu cong cua nguoi dung khi ho da bo check roi them/bot thanh vien khac
  // (khong phai tai xe) sau do. Xem NHAT_KY_QUYET_DINH.md.
  const [coLapLenhDieuXe, setCoLapLenhDieuXe] = useState(true);
  const soTaiXeUngVienTruoc = useRef(0);
  useEffect(() => {
    if (taiXeUngVien.length > 0 && soTaiXeUngVienTruoc.current === 0) {
      setCoLapLenhDieuXe(true);
    }
    soTaiXeUngVienTruoc.current = taiXeUngVien.length;
  }, [taiXeUngVien.length]);

  useEffect(() => {
    if (!coLapLenhDieuXe) {
      setValue("taiXeNhanVienId", undefined);
      setValue("phuongTienId", undefined);
      return;
    }
    // Bat lai checkbox (vd nguoi dung bo check nham roi check lai) - tu dong
    // dien lai tai xe dau tien trong danh sach ung vien + xe thuong dung cua
    // ho (neu co), giong y het hanh vi luc them thanh vien vao doan (xem
    // onChange cua Combobox them thanh vien ben duoi). CHI dien khi CHUA co
    // ai duoc chon (khong ghi de neu nguoi dung da tu tay chon 1 nguoi khac
    // truoc do, ap dung cho doan co nhieu hon 1 tai xe). Nguoi dung phan hoi
    // 2026-08-13: truoc day bo check roi check lai KHONG tu dien lai, phai tu
    // chon lai tu dau - xem NHAT_KY_QUYET_DINH.md.
    if (!getValues("taiXeNhanVienId") && taiXeUngVien.length > 0) {
      const nv = taiXeUngVien[0];
      setValue("taiXeNhanVienId", nv.id, { shouldValidate: true });
      const xeThuongDung = phuongTienDs?.duLieu.find((pt) => pt.taiXeThuongDungId === nv.id);
      if (xeThuongDung) {
        setValue("phuongTienId", xeThuongDung.id, { shouldValidate: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coLapLenhDieuXe]);

  // Bo tai xe/bien so da chon neu nguoi do bi xoa khoi danh sach thanh vien.
  useEffect(() => {
    if (taiXeDaChon && !taiXeUngVien.some((nv) => nv.id === taiXeDaChon)) {
      setValue("taiXeNhanVienId", undefined);
      setValue("phuongTienId", undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields.length]);

  const tuyChonThemThanhVien = (nhanVienDs?.duLieu ?? [])
    .filter((nv) => !thanhVienForm.some((tv) => tv?.nhanVienId === nv.id))
    .map((nv) => ({ value: nv.id, label: nv.hoTen, moTa: nv.laTaiXe ? `${nv.chucVu} · Tài xế` : nv.chucVu }));

  async function xuLySubmit(duLieu: TaoLenhDieuCongTacInput) {
    setLoiChung(null);
    try {
      // O nhap ngay rieng tung nguoi mac dinh HIEN THI trung voi ngay chung
      // de khong trong trong (xem cho "append" ben duoi) - nhung neu nguoi
      // dung khong sua gi them thi van la "theo doan", KHONG phai 1 override
      // that su. Truoc khi gui len server, gia tri nao con TRUNG voi ngay
      // chung thi bo ve undefined, de GDD van doc dong dung theo LDCT khi
      // sua sau nay (xem NHAT_KY_QUYET_DINH.md).
      const duLieuGuiDi: TaoLenhDieuCongTacInput = {
        ...duLieu,
        thanhVien: duLieu.thanhVien.map((tv) => ({
          ...tv,
          ngayDiRieng: cungNgay(tv.ngayDiRieng, duLieu.ngayDi) ? undefined : tv.ngayDiRieng,
          ngayVeRieng: cungNgay(tv.ngayVeRieng, duLieu.ngayVe) ? undefined : tv.ngayVeRieng,
        })),
      };
      await goiApi("/lenh-dieu-cong-tac", { method: "POST", body: JSON.stringify(duLieuGuiDi) });
      await Promise.all([lamMoiDanhSach(), lamMoiLenhDieuXe(), lamMoiGiayDiDuong(), lamMoiSoCongLenh()]);
      dong();
    } catch (loi) {
      setLoiChung(loi instanceof LoiApi ? loi.message : "Không thể lập lệnh điều công tác, vui lòng thử lại");
    }
  }

  function dong() {
    onOpenChange(false);
    reset({
      ngayKy: new Date(ngayHomNay()),
      ngayDi: new Date(ngayMai()),
      ngayVe: new Date(ngayMai()),
      mucDich: MUC_DICH_MAC_DINH,
      cacChang: null,
      thanhVien: [],
      loaiMauIn: "TUYEN_THUONG",
    });
    setDangChonThanhVien("");
    setLoiChung(null);
    setCoLapLenhDieuXe(true);
    soTaiXeUngVienTruoc.current = 0;
    loaiMauInTruoc.current = "TUYEN_THUONG";
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : dong())}>
      <DialogContent className="flex max-h-[85vh] max-w-3xl flex-col overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lập lệnh điều công tác</DialogTitle>
          <DialogDescription>
            {duLieuSaoChep ? (
              <>
                Đã điền sẵn địa điểm/mục đích/ngày đi-về từ lệnh <strong>{duLieuSaoChep.soHieu}</strong> — chọn lại
                thành viên và kiểm tra lại thông tin trước khi lưu.
              </>
            ) : (
              "Lưu sẽ tạo cùng lúc lệnh điều công tác, công lệnh/giấy đi đường cho từng thành viên, và lệnh điều xe nếu đoàn có tài xế."
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(xuLySubmit)} className="space-y-4" noValidate>
          {/* Thu tu toan form (2026-08-10, nguoi dung yeu cau, xem
              NHAT_KY_QUYET_DINH.md): Loai mau in -> Ngay lap -> Noi di ->
              Noi den -> Muc dich -> Ngay di/ve chung doan -> Danh sach nhan
              vien -> Tai xe. Loai mau in len dau vi anh huong UI thanh vien
              ben duoi (checkbox Truong doan). Ngay lap dat ngay sau do (gon,
              max-w rieng) - tach khoi Ngay di/Ngay ve (y nghia khac han:
              ngay ky van ban, khong phai ngay cong tac thuc te). */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="mauInTramLdct">Loại lệnh điều công tác</Label>
              <Controller
                control={control}
                name="loaiMauIn"
                render={({ field }) => (
                  <Select id="mauInTramLdct" value={field.value} onChange={(e) => field.onChange(e.target.value)}>
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
              <Label htmlFor="ngayKyLdct">Ngày lập</Label>
              <Controller
                control={control}
                name="ngayKy"
                render={({ field }) => (
                  <Input
                    id="ngayKyLdct"
                    type="date"
                    aria-invalid={!!errors.ngayKy}
                    value={field.value ? new Date(field.value).toISOString().slice(0, 10) : ""}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                  />
                )}
              />
              {errors.ngayKy && <p className="text-sm text-destructive">{errors.ngayKy.message}</p>}
              <CanhBaoNgayLapKhongTheoThuTu loaiChungTu="LDCT" ngayKy={ngayKyDangNhap} />
            </div>
          </div>

          {/* "Noi di" (2026-08-10) - truoc gio KHONG co o form nay, luon tu
              dong lay "noi di mac dinh" tu Danh muc Dia diem (diemDiMacDinh)
              cho MOI Giay di duong sinh kem, khong sua duoc tru phi vao tung
              GDD rieng le (thuc te chua co man hinh sua GDD). Nguoi dung yeu
              cau them o day de ghi de 1 lan cho CA lenh (ap dung cho moi GDD
              cua doan) - gia tri nhap se luu vao GiayDiDuong.noiDiRieng cua
              tung thanh vien luc tao (xem lenh-dieu-cong-tac.service.ts). De
              trong thi giu nguyen hanh vi cu (fallback ve noi di mac dinh).
              Gia tri hien thi san = dia diem dang danh dau "diem di mac
              dinh" trong Danh muc, xem effect "dien san Noi di" ben duoi -
              KHONG hardcode chuoi "P. Long Xuyen, An Giang" trong code, vi
              gia tri nay co the doi qua giao dien /dia-diem bat cu luc nao.
              Xem NHAT_KY_QUYET_DINH.md. */}
          <div className="space-y-1.5">
            <Label htmlFor="noiDiLdct">Nơi đi</Label>
            <Controller
              control={control}
              name="noiDi"
              render={({ field }) => (
                <ComboboxVanBan
                  id="noiDiLdct"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  ariaInvalid={!!errors.noiDi}
                  goiY={goiYDiaDiem}
                  choPhepNhieu
                />
              )}
            />
            {errors.noiDi && <p className="text-sm text-destructive">{errors.noiDi.message}</p>}
          </div>

          <div className="space-y-1.5">
            {/* Nhan doi tu "Dia diem cong tac" sang "Noi den" (2026-08-10) de
                di dung cap voi "Noi di" moi them o tren - KHONG doi ten
                truong diaDiemCongTac trong schema/DB, chi doi nhan hien thi
                (gia tri nay van la "dia diem cong tac" dung trong cau van
                LDCT + la "noiDen" mac dinh cua moi GDD/LDX sinh kem, giu
                nguyen y nghia cu). Xem NHAT_KY_QUYET_DINH.md. */}
            <Label htmlFor="diaDiemLdct">Nơi đến</Label>
            {/* Chon nhanh tuyen thuong dung - CHI hien cho loai "Phat hanh,
                thu hoi ve e" (cac loai khac khong co khai niem tuyen co dinh
                lap lai). Chon 1 muc se THAY THE toan bo o "Noi den", khong
                ghep them - nguoi dung van sua tay lai duoc sau do. Danh sach
                quan ly tai /cau-hinh-don-vi. Nguoi dung yeu cau 2026-08-17,
                xem NHAT_KY_QUYET_DINH.md. */}
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
                  id="diaDiemLdct"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  ariaInvalid={!!errors.diaDiemCongTac}
                  goiY={goiYNoiDenGomLichSu}
                  choPhepNhieu
                />
              )}
            />
            {errors.diaDiemCongTac && (
              <p className="text-sm text-destructive">{errors.diaDiemCongTac.message}</p>
            )}
            {/* Canh bao do dai Noi di + Noi den (2026-08-14) - xem giai thich
                day du o khai bao doDaiNoiDiDen ben tren. */}
            {canhBaoManhNoiDiDen && (
              <p className="flex items-start gap-1.5 text-sm text-destructive">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                Nơi đi + Nơi đến khá dài ({doDaiNoiDiDen} ký tự) — bản in Công lệnh/Giấy đi đường có thể bị ảnh
                hưởng bố cục. Nên rút gọn nếu được.
              </p>
            )}
            {canhBaoNheNoiDiDen && (
              <p className="flex items-start gap-1.5 text-sm text-amber-600 dark:text-amber-400">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                Nơi đi + Nơi đến hơi dài ({doDaiNoiDiDen} ký tự) — hệ thống sẽ tự thu gọn bản in Công lệnh/Giấy đi
                đường để vừa 1 trang.
              </p>
            )}
          </div>

          <Controller
            control={control}
            name="cacChang"
            render={({ field }) => (
              <LoTrinhDaChangInput
                cacChang={field.value}
                onChange={field.onChange}
                noiDiMacDinh={watch("noiDi") || diaDiemDs?.duLieu.find((dd) => dd.diemDiMacDinh)?.tenDayDu || "P. Long Xuyên, An Giang"}
                noiDenMacDinh={watch("diaDiemCongTac")}
                ngayDiMacDinh={watch("ngayDi") ? new Date(watch("ngayDi") as any).toISOString().slice(0, 10) : ""}
                ngayVeMacDinh={watch("ngayVe") ? new Date(watch("ngayVe") as any).toISOString().slice(0, 10) : ""}
                goiYDiaDiem={goiYDiaDiem}
              />
            )}
          />

          <div className="space-y-1.5">
            <Label htmlFor="mucDichLdct">Mục đích</Label>
            <Controller
              control={control}
              name="mucDich"
              render={({ field }) => (
                <ComboboxVanBan
                  id="mucDichLdct"
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
            <Label htmlFor="ghiChuLdct">Ghi chú (nội bộ, không in ra chứng từ)</Label>
            <Textarea
              id="ghiChuLdct"
              rows={2}
              aria-invalid={!!errors.ghiChu}
              {...register("ghiChu")}
            />
            {errors.ghiChu && <p className="text-sm text-destructive">{errors.ghiChu.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ngayDiLdct">Ngày đi (chung đoàn)</Label>
              <Controller
                control={control}
                name="ngayDi"
                render={({ field }) => (
                  <Input
                    id="ngayDiLdct"
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
              <Label htmlFor="ngayVeLdct">Ngày về (chung đoàn)</Label>
              <Controller
                control={control}
                name="ngayVe"
                render={({ field }) => (
                  <Input
                    id="ngayVeLdct"
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
            {/* Chu thich tai xe - nguoi dung lan dau khong biet phai them tai
                xe vao DAY thi o "Tai xe/Bien so" moi tu hien ra ben duoi (chi
                hien khi taiXeUngVien.length > 0, tinh tu chinh danh sach nay).
                Nguoi dung yeu cau 2026-08-10, xem NHAT_KY_QUYET_DINH.md. */}
            <p className="text-xs text-muted-foreground">
              Nếu đoàn có tài xế, thêm người đó vào danh sách bên dưới — ô chọn xe sẽ tự hiện ra.
            </p>

            <Combobox
              value={dangChonThanhVien}
              onChange={(nhanVienId) => {
                // Ngay rieng mac dinh HIEN THI trung voi ngay chung cua doan
                // (khong de trong nhin nhu hong) - se tu dong bo lai thanh
                // "theo doan" (undefined) luc gui len neu nguoi dung khong
                // sua gi them, xem cungNgay() o xuLySubmit.
                const nv = nhanVienMap.get(nhanVienId);
                const giaTriMoi = {
                  nhanVienId,
                  chucVu: nv?.laTaiXe ? "Nhân viên Lái xe" : undefined,
                  ngayDiRieng: getValues("ngayDi"),
                  ngayVeRieng: getValues("ngayVe"),
                  laTruongDoan: false,
                };
                if (nv?.laTaiXe) {
                  append(giaTriMoi);
                } else {
                  const viTriTaiXeDauTien = thanhVienForm.findIndex((tv) => {
                    const n = tv?.nhanVienId ? nhanVienMap.get(tv.nhanVienId) : undefined;
                    return n?.laTaiXe;
                  });
                  if (viTriTaiXeDauTien !== -1) {
                    insert(viTriTaiXeDauTien, giaTriMoi);
                  } else {
                    append(giaTriMoi);
                  }
                }
                setDangChonThanhVien("");

                // Them 1 nguoi mang co tai xe, va chua ai duoc chon lam tai
                // xe truoc do -> tu dong chon nguoi nay lam tai xe + dien san
                // xe thuong dung cua ho (neu co) - giong chonLaiXe() cua LDX.
                if (nv?.laTaiXe && coLapLenhDieuXe && !getValues("taiXeNhanVienId")) {
                  setValue("taiXeNhanVienId", nv.id, { shouldValidate: true });
                  const xeThuongDung = phuongTienDs?.duLieu.find((pt) => pt.taiXeThuongDungId === nv.id);
                  if (xeThuongDung) {
                    setValue("phuongTienId", xeThuongDung.id, { shouldValidate: true });
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
                  // Ngay hieu luc CUA CHINH THANH VIEN NAY (rieng neu form da
                  // nhap, khong thi moi ve ngay chung cua doan) - dung
                  // watch() (khong phai field.value tu useFieldArray, vi gia
                  // tri do KHONG tu cap nhat khi nguoi dung go lai ngay rieng,
                  // chi cap nhat khi them/xoa/sap xep dong) de lay dung gia
                  // tri MOI NHAT tren form luc render, truyen cho API kiem
                  // tra trung lich. Nguoi dung yeu cau 2026-08-19, xem
                  // NHAT_KY_QUYET_DINH.md.
                  const ngayDiRiengHienTai = watch(`thanhVien.${index}.ngayDiRieng`);
                  const ngayVeRiengHienTai = watch(`thanhVien.${index}.ngayVeRieng`);
                  const ngayDiHieuLuc = ngayDiRiengHienTai ? new Date(ngayDiRiengHienTai) : ngayDiDangNhap;
                  const ngayVeHieuLuc = ngayVeRiengHienTai ? new Date(ngayVeRiengHienTai) : ngayVeDangNhap;
                  return (
                    <div
                      key={field.id}
                      className="flex flex-wrap items-center gap-2 rounded-md border border-border/60 bg-muted/30 px-2.5 py-2 text-sm"
                    >
                      <div className="flex items-center gap-0.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7 text-muted-foreground hover:text-foreground disabled:opacity-30"
                          disabled={index === 0}
                          onClick={() => swap(index, index - 1)}
                          title="Chuyển lên trên"
                        >
                          <ChevronUp className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7 text-muted-foreground hover:text-foreground disabled:opacity-30"
                          disabled={index === fields.length - 1}
                          onClick={() => swap(index, index + 1)}
                          title="Chuyển xuống dưới"
                        >
                          <ChevronDown className="size-4" />
                        </Button>
                      </div>

                      <span className="w-4 text-center text-xs font-semibold text-muted-foreground">
                        {index + 1}
                      </span>

                      <span className="min-w-[8.5rem] font-medium">
                        {nv?.hoTen ?? "(không rõ)"}
                        {nv?.laTaiXe && (
                          <span className="ml-1 text-xs font-normal text-blue-700 dark:text-blue-300">
                            · Lái xe
                          </span>
                        )}
                      </span>

                      {nv?.laTaiXe ? (
                        <div className="w-[14.5rem]">
                          <Controller
                            control={control}
                            name={`thanhVien.${index}.chucVu` as const}
                            render={({ field: fChucVu }) => {
                              const optPhongBan = `${nv.chucVu.trim()} ${nv.donViCongTac?.trim() || "Phòng Kế hoạch – Kinh doanh"}`;
                              const giaTriHienTai = fChucVu.value || "Nhân viên Lái xe";
                              return (
                                <Select
                                  className="h-8 py-1 pr-7 text-xs"
                                  title="Chọn chức vụ hiển thị trong lệnh điều công tác"
                                  value={giaTriHienTai}
                                  onChange={(e) => fChucVu.onChange(e.target.value)}
                                >
                                  <option value="Nhân viên Lái xe">Nhân viên Lái xe (mặc định)</option>
                                  <option value={optPhongBan}>{optPhongBan}</option>
                                </Select>
                              );
                            }}
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">{nv?.chucVu}</span>
                      )}

                      {coTruongDoan && (
                        <Controller
                          control={control}
                          name={`thanhVien.${index}.laTruongDoan` as const}
                          render={({ field: fTruongDoan }) => (
                            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Checkbox
                                checked={!!fTruongDoan.value}
                                onCheckedChange={(checked) => {
                                  // Toi da 1 truong doan/doan - chon 1 nguoi
                                  // tu dong bo chon nguoi truoc do (radio).
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
                        {/* Dung Controller (khong phai register()) de tu chuyen
                            chuoi rong "" thanh undefined - z.coerce.date() coi
                            "" la Invalid Date chu khong phai "de trong". */}
                        <Controller
                          control={control}
                          name={`thanhVien.${index}.ngayDiRieng` as const}
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
                          name={`thanhVien.${index}.ngayVeRieng` as const}
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
                          onClick={() => remove(index)}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>

                      {/* w-full trong khung flex-wrap cua dong cha -> tu
                          xuong hang rieng ben duoi thay vi chen giua cac o
                          khac. Khong truyen loaiTruLenhId (dang Lap chung tu
                          MOI, chua co id) - xem CanhBaoTrungLichNhanVien. */}
                      <CanhBaoTrungLichNhanVien
                        nhanVienId={field.nhanVienId}
                        ngayDi={ngayDiHieuLuc}
                        ngayVe={ngayVeHieuLuc}
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
                    <Label htmlFor="taiXeLdct">Tài xế</Label>
                    <Controller
                      control={control}
                      name="taiXeNhanVienId"
                      render={({ field }) => (
                        <Combobox
                          id="taiXeLdct"
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          placeholder="-- Không lập lệnh điều xe --"
                          options={taiXeUngVien.map((nv) => ({ value: nv.id, label: nv.hoTen, moTa: nv.chucVu }))}
                        />
                      )}
                    />
                    {errors.taiXeNhanVienId && (
                      <p className="text-sm text-destructive">{errors.taiXeNhanVienId.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phuongTienLdct">Biển số xe</Label>
                    <Controller
                      control={control}
                      name="phuongTienId"
                      render={({ field }) => (
                        <Combobox
                          id="phuongTienLdct"
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          disabled={!taiXeDaChon}
                          placeholder="-- Chọn biển số --"
                          ariaInvalid={!!errors.phuongTienId}
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
                    {errors.phuongTienId && (
                      <p className="text-sm text-destructive">{errors.phuongTienId.message}</p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <CanhBaoTrungLichLenhDieuXe
                      laiXeId={taiXeDaChon}
                      phuongTienId={phuongTienDaChonLdx}
                      ngayDi={ngayDiDangNhap ? new Date(ngayDiDangNhap) : undefined}
                      ngayVe={ngayVeDangNhap ? new Date(ngayVeDangNhap) : undefined}
                    />
                  </div>
                </div>
              ) : (
                // Vd: doan di xe thue - tai xe cua cong ty (neu co trong doan)
                // chi di nhu 1 thanh vien binh thuong, khong lai xe chuyen nay.
                <p className="text-xs text-muted-foreground">
                  Sẽ không lập lệnh điều xe (ví dụ: đoàn đi xe thuê, tài xế đi như thành viên bình thường).
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
            <Button type="button" variant="outline" onClick={dong}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
