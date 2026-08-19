import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { MA_VAI_TRO } from "@congtac/shared";
import { PrismaService } from "../prisma/prisma.service";
import { NhatKyService } from "../common/nhat-ky/nhat-ky.service";

@Injectable()
export class VaiTroService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly nhatKy: NhatKyService,
  ) {}

  // Tra them danh sach quyen (ma/nhom/mo ta) + so nguoi dung dang giu moi vai
  // tro - dung lam COT cua bang ma tran quyen x vai tro tai /vai-tro (xem
  // docs/superpowers/specs/2026-08-17-vai-tro-phan-quyen-design.md). Cac noi
  // dung khac (vd checkbox chon vai tro o /nguoi-dung) chi doc id/ma/ten/moTa,
  // bo qua 2 truong moi - khong anh huong.
  async danhSach() {
    const ds = await this.prisma.vaiTro.findMany({
      select: {
        id: true,
        ma: true,
        ten: true,
        moTa: true,
        heThong: true,
        quyen: { select: { quyen: { select: { ma: true, nhom: true, moTa: true } } } },
        _count: { select: { nguoiDung: true } },
      },
      orderBy: { ngayTao: "asc" },
    });
    return ds.map((vt) => ({
      id: vt.id,
      ma: vt.ma,
      ten: vt.ten,
      moTa: vt.moTa,
      heThong: vt.heThong,
      soNguoiDung: vt._count.nguoiDung,
      quyen: vt.quyen.map((q) => q.quyen),
    }));
  }

  // Toan bo danh muc quyen (ke ca quyen chua vai tro nao co) - dung lam HANG
  // cua bang ma tran o /vai-tro.
  async layToanBoQuyen() {
    return this.prisma.quyen.findMany({
      select: { id: true, ma: true, nhom: true, moTa: true },
      orderBy: [{ nhom: "asc" }, { ma: "asc" }],
    });
  }

  // Thay THE TOAN BO tap quyen cua 1 vai tro (khong phai them/bot tung phan).
  // Chan cung viec sua quyen cua Quan tri he thong o TANG BACKEND (khong chi
  // an checkbox o UI - CLAUDE.md quy tac #3), vi vai tro nay giu co dinh de
  // luon co 1 vai tro du quyen sua lai neu lo cau hinh sai 3 vai tro con lai.
  async suaQuyen(vaiTroId: string, quyenMa: string[], nguoiThucHienId: string) {
    const vaiTro = await this.prisma.vaiTro.findUnique({
      where: { id: vaiTroId },
      select: { id: true, ma: true, quyen: { select: { quyen: { select: { ma: true } } } } },
    });
    if (!vaiTro) {
      throw new NotFoundException("Không tìm thấy vai trò");
    }
    if (vaiTro.ma === MA_VAI_TRO.QUAN_TRI_HE_THONG) {
      throw new BadRequestException("Không thể sửa quyền của Quản trị hệ thống qua giao diện");
    }

    const giaTriTruoc = vaiTro.quyen.map((q) => q.quyen.ma).sort();

    const danhSachQuyen = await this.prisma.quyen.findMany({
      where: { ma: { in: quyenMa } },
      select: { id: true, ma: true },
    });

    await this.prisma.$transaction([
      this.prisma.vaiTroQuyen.deleteMany({ where: { vaiTroId } }),
      this.prisma.vaiTroQuyen.createMany({
        data: danhSachQuyen.map((q) => ({ vaiTroId, quyenId: q.id })),
      }),
    ]);

    const giaTriSau = danhSachQuyen.map((q) => q.ma).sort();

    await this.nhatKy.ghiNhan({
      nguoiDungId: nguoiThucHienId,
      hanhDong: "SUA_QUYEN_VAI_TRO",
      doiTuong: "VaiTro",
      doiTuongId: vaiTroId,
      giaTriTruoc: { quyen: giaTriTruoc },
      giaTriSau: { quyen: giaTriSau },
    });

    const danhSach = await this.danhSach();
    return danhSach.find((vt) => vt.id === vaiTroId);
  }
}
