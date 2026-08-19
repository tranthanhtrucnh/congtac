import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { NhatKyService } from "../common/nhat-ky/nhat-ky.service";
import { chuanHoaBienSo } from "@congtac/validation";
import type {
  DanhSachPhuongTienInput,
  TaoPhuongTienInput,
  SuaPhuongTienInput,
  XoaNhieuPhuongTienInput,
} from "@congtac/validation";

@Injectable()
export class PhuongTienService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly nhatKy: NhatKyService,
  ) {}

  async danhSach(truyVan: DanhSachPhuongTienInput) {
    const { trang, kichThuoc, tuKhoa, trangThai, sapXepTheo, huongSapXep } = truyVan;

    const where: Prisma.PhuongTienWhereInput = {
      ...(tuKhoa ? { bienSoChuan: { contains: chuanHoaBienSo(tuKhoa) } } : {}),
      ...(trangThai ? { trangThai } : {}),
    };

    const [duLieu, tong] = await this.prisma.$transaction([
      this.prisma.phuongTien.findMany({
        where,
        include: { taiXeThuongDung: { select: { id: true, hoTen: true } } },
        orderBy: { [sapXepTheo ?? "bienSo"]: huongSapXep },
        skip: (trang - 1) * kichThuoc,
        take: kichThuoc,
      }),
      this.prisma.phuongTien.count({ where }),
    ]);

    return { duLieu, tong, trang, kichThuoc };
  }

  async chiTiet(id: string) {
    const phuongTien = await this.prisma.phuongTien.findUnique({
      where: { id },
      include: { taiXeThuongDung: { select: { id: true, hoTen: true } } },
    });
    if (!phuongTien) {
      throw new NotFoundException("Không tìm thấy phương tiện");
    }
    return phuongTien;
  }

  async tao(duLieu: TaoPhuongTienInput, nguoiThucHienId: string) {
    try {
      const phuongTien = await this.prisma.phuongTien.create({
        data: {
          bienSo: duLieu.bienSo,
          bienSoChuan: chuanHoaBienSo(duLieu.bienSo),
          nhanHieu: duLieu.nhanHieu,
          loaiXe: duLieu.loaiXe,
          soCho: duLieu.soCho,
          ghiChu: duLieu.ghiChu,
          taiXeThuongDungId: duLieu.taiXeThuongDungId,
        },
      });

      await this.nhatKy.ghiNhan({
        nguoiDungId: nguoiThucHienId,
        hanhDong: "TAO_PHUONG_TIEN",
        doiTuong: "PhuongTien",
        doiTuongId: phuongTien.id,
        giaTriSau: { bienSo: phuongTien.bienSo, nhanHieu: phuongTien.nhanHieu },
      });

      return phuongTien;
    } catch (loi) {
      if (loi instanceof Prisma.PrismaClientKnownRequestError && loi.code === "P2002") {
        throw new ConflictException("Biển số này đã tồn tại trong danh mục");
      }
      throw loi;
    }
  }

  async sua(id: string, duLieu: SuaPhuongTienInput, nguoiThucHienId: string) {
    const truoc = await this.chiTiet(id);

    try {
      const sau = await this.prisma.phuongTien.update({
        where: { id },
        data: {
          ...duLieu,
          bienSoChuan: duLieu.bienSo ? chuanHoaBienSo(duLieu.bienSo) : undefined,
        },
      });

      await this.nhatKy.ghiNhan({
        nguoiDungId: nguoiThucHienId,
        hanhDong: "SUA_PHUONG_TIEN",
        doiTuong: "PhuongTien",
        doiTuongId: id,
        giaTriTruoc: truoc,
        giaTriSau: sau,
      });

      return sau;
    } catch (loi) {
      if (loi instanceof Prisma.PrismaClientKnownRequestError && loi.code === "P2002") {
        throw new ConflictException("Biển số này đã tồn tại trong danh mục");
      }
      throw loi;
    }
  }

  async xoa(id: string, nguoiThucHienId: string) {
    const phuongTien = await this.chiTiet(id);
    await this.prisma.phuongTien.delete({ where: { id } });

    await this.nhatKy.ghiNhan({
      nguoiDungId: nguoiThucHienId,
      hanhDong: "XOA_PHUONG_TIEN",
      doiTuong: "PhuongTien",
      doiTuongId: id,
      giaTriTruoc: { bienSo: phuongTien.bienSo, nhanHieu: phuongTien.nhanHieu },
    });
  }

  async xoaNhieu(duLieu: XoaNhieuPhuongTienInput, nguoiThucHienId: string) {
    const danhSachXoa = await this.prisma.phuongTien.findMany({
      where: { id: { in: duLieu.ids } },
      select: { id: true, bienSo: true, nhanHieu: true },
    });

    await this.prisma.phuongTien.deleteMany({ where: { id: { in: duLieu.ids } } });

    await this.nhatKy.ghiNhan({
      nguoiDungId: nguoiThucHienId,
      hanhDong: "XOA_NHIEU_PHUONG_TIEN",
      doiTuong: "PhuongTien",
      giaTriTruoc: { danhSach: danhSachXoa },
    });

    return { soLuongDaXoa: danhSachXoa.length };
  }
}
