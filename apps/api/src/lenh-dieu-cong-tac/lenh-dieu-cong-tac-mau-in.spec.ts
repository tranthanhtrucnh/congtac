import {
  taoHtmlLenhDieuCongTacVaLenhDieuXe,
  taoHtmlGiayDiDuongHangLoat,
  type LenhDieuCongTacDeIn,
  type ThanhVienDeIn,
  type GiayDiDuongDeIn,
} from "./lenh-dieu-cong-tac-mau-in";
import type { CauHinhDonVi } from "@prisma/client";

const CAU_HINH_TEST = {
  id: "mac-dinh",
  donViChuQuan: "UBND TỈNH AN GIANG",
  tenCoQuanDong1: "CÔNG TY TNHH MỘT THÀNH VIÊN",
  tenCoQuanDong2: "XỔ SỐ KIẾN THIẾT AN GIANG",
  tenNgan: "XSKT An Giang",
  diaDanh: "An Giang",
  canCuMauTram: null,
  mucDichMacDinhVeE: null,
  canCuMacDinhVeE: null,
  noiNhanMacDinhVeE: null,
  logoBase64: null,
  logoOpacityPhanTram: 15,
  logoKichThuocMm: 80,
  phongChuMauIn: "TIMES_NEW_ROMAN",
  tyLeXHeightMauIn: null,
  ngayTao: new Date(),
  ngayCapNhat: new Date(),
} as unknown as CauHinhDonVi;

const LENH_TEST: LenhDieuCongTacDeIn = {
  soHieu: "01/LĐCT",
  ngayKy: new Date("2026-10-21"),
  ngayDi: new Date("2026-10-22"),
  ngayVe: new Date("2026-10-23"),
  canCu: "Quyết định số 123",
  diaDiemCongTac: "Cần Thơ",
  mucDich: "Công tác thị trường",
  loaiMauIn: "TUYEN_THUONG",
  nguoiKyHoTen: "Nguyễn Văn Giám Đốc",
  nguoiKyChucDanh: "Giám đốc",
  nguoiKyTheThuc: "GIÁM ĐỐC",
};

describe("lenh-dieu-cong-tac-mau-in driver title handling", () => {
  it("hien thi 'Nhân viên Lái xe' khi thanh vien lai xe co chuc vu 'Nhân viên Lái xe'", () => {
    const thanhVien: ThanhVienDeIn[] = [
      {
        hoTen: "Trần Lái Xe",
        chucVu: "Nhân viên Lái xe",
        cccd: "123456789012",
        ngaySinh: null,
        laTruongDoan: false,
        ngayDiRieng: null,
        ngayVeRieng: null,
        laTaiXe: true,
      },
    ];

    const html = taoHtmlLenhDieuCongTacVaLenhDieuXe(LENH_TEST, thanhVien, null, CAU_HINH_TEST, "A5");
    expect(html).toContain("Trần Lái Xe");
    expect(html).toContain("Nhân viên Lái xe");
  });

  it("hien thi 'Nhân viên Phòng KH-KD' khi van thu chon in chuc vu phong ban cho lai xe", () => {
    const thanhVien: ThanhVienDeIn[] = [
      {
        hoTen: "Lê Văn Tài",
        chucVu: "Nhân viên Phòng Kế hoạch – Kinh doanh",
        cccd: "123456789013",
        ngaySinh: null,
        laTruongDoan: false,
        ngayDiRieng: null,
        ngayVeRieng: null,
        laTaiXe: true,
      },
    ];

    const html = taoHtmlLenhDieuCongTacVaLenhDieuXe(LENH_TEST, thanhVien, null, CAU_HINH_TEST, "A5");
    expect(html).toContain("Lê Văn Tài");
    expect(html).toContain("Nhân viên Phòng KH-KD");
  });

  it("tu dong hien thi 'Nhân viên Lái xe' voi du lieu cu (chucVu = 'Nhân viên', laTaiXe = true)", () => {
    const thanhVien: ThanhVienDeIn[] = [
      {
        hoTen: "Phạm Văn Cũ",
        chucVu: "Nhân viên",
        cccd: "123456789014",
        ngaySinh: null,
        laTruongDoan: false,
        ngayDiRieng: null,
        ngayVeRieng: null,
        laTaiXe: true,
      },
    ];

    const html = taoHtmlLenhDieuCongTacVaLenhDieuXe(LENH_TEST, thanhVien, null, CAU_HINH_TEST, "A5");
    expect(html).toContain("Phạm Văn Cũ");
    expect(html).toContain("Nhân viên Lái xe");
  });
});

describe("Giay di duong cac chặng", () => {
  const gddMacDinh: GiayDiDuongDeIn = {
    soHieu: "01/GĐĐ",
    ngayKy: new Date("2026-10-21"),
    hoTen: "Nguyễn Văn A",
    chucVu: "Chuyên viên",
    noiDi: "Long Xuyên",
    noiDen: "Rạch Giá",
    ngayDi: new Date("2026-10-22"),
    ngayVe: new Date("2026-10-23"),
    nguoiKyHoTen: "Nguyễn Văn Giám Đốc",
    nguoiKyChucDanh: "Giám đốc",
    nguoiKyTheThuc: "GIÁM ĐỐC",
  };

  it("mac dinh 2 chang: render 4 hang (2 hang du lieu + 2 hang trong)", () => {
    const html = taoHtmlGiayDiDuongHangLoat([gddMacDinh], CAU_HINH_TEST);
    const tbody = html.split("<tbody>")[1].split("</tbody>")[0];
    const soHang = (tbody.match(/<tr/g) || []).length;
    expect(soHang).toBe(4);
    expect(html).toContain("gdd-mat-truoc");
    expect(html).toContain("bang-tu-dong");
  });

  it("co 3 chang: in 3 chang va hien lai hang 4 trong (tong 4 hang)", () => {
    const gdd3Chang: GiayDiDuongDeIn = {
      ...gddMacDinh,
      cacChang: [
        { noiDi: "Long Xuyên", noiDen: "Rạch Giá", ngay: "2026-10-22" },
        { noiDi: "Rạch Giá", noiDen: "Cà Mau", ngay: "2026-10-22" },
        { noiDi: "Cà Mau", noiDen: "Long Xuyên", ngay: "2026-10-23" },
      ],
    };
    const html = taoHtmlGiayDiDuongHangLoat([gdd3Chang], CAU_HINH_TEST);
    const tbody = html.split("<tbody>")[1].split("</tbody>")[0];
    const soHang = (tbody.match(/<tr/g) || []).length;
    expect(soHang).toBe(4);
    expect(html).toContain("Cà Mau");
  });

  it("co 4 chang: render dung 4 hang", () => {
    const gdd4Chang: GiayDiDuongDeIn = {
      ...gddMacDinh,
      cacChang: [
        { noiDi: "Long Xuyên", noiDen: "Rạch Giá", ngay: "2026-10-22" },
        { noiDi: "Rạch Giá", noiDen: "Cà Mau", ngay: "2026-10-22" },
        { noiDi: "Cà Mau", noiDen: "Bạc Liêu", ngay: "2026-10-23" },
        { noiDi: "Bạc Liêu", noiDen: "Long Xuyên", ngay: "2026-10-23" },
      ],
    };
    const html = taoHtmlGiayDiDuongHangLoat([gdd4Chang], CAU_HINH_TEST);
    const tbody = html.split("<tbody>")[1].split("</tbody>")[0];
    const soHang = (tbody.match(/<tr/g) || []).length;
    expect(soHang).toBe(4);
    expect(html).toContain("Bạc Liêu");
  });

  it("chieuCaoHangMm tuy chinh: ap dung dung chieu cao cho ca 4 hang trong table", () => {
    const html = taoHtmlGiayDiDuongHangLoat([gddMacDinh], CAU_HINH_TEST, 18);
    const tbody = html.split("<tbody>")[1].split("</tbody>")[0];
    // Ca 4 hang phai co style="height:18mm;"
    const soHang18mm = (tbody.match(/height:18mm/g) || []).length;
    expect(soHang18mm).toBe(4);
  });

  it("coChuPt tuy chinh: ap dung dung co chu cho bang noi di va den", () => {
    const html = taoHtmlGiayDiDuongHangLoat([gddMacDinh], CAU_HINH_TEST, null, 11);
    expect(html).toContain("font-size: 11pt;");
  });
});
