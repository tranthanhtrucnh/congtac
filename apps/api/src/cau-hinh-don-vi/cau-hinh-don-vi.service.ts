import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NhatKyService } from "../common/nhat-ky/nhat-ky.service";
import type { SuaCauHinhDonViInput } from "@congtac/validation";

/** Id co dinh - CauHinhDonVi chi co DUY NHAT 1 dong (xem schema.prisma). */
const ID_MAC_DINH = "mac-dinh";

@Injectable()
export class CauHinhDonViService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly nhatKy: NhatKyService,
  ) {}

  /**
   * Lay cau hinh - tu tao dong mac dinh (theo @default trong schema) neu
   * chua co, de cac noi goi (mau in, sidebar) luon nhan duoc du lieu ma
   * khong phai tu xu ly truong hop "chua thiet lap".
   */
  async layCauHinh() {
    const hienCo = await this.prisma.cauHinhDonVi.findUnique({ where: { id: ID_MAC_DINH } });
    if (hienCo) return hienCo;
    return this.prisma.cauHinhDonVi.create({ data: { id: ID_MAC_DINH } });
  }

  async suaCauHinh(duLieu: SuaCauHinhDonViInput, nguoiThucHienId: string) {
    const truoc = await this.layCauHinh();

    const sau = await this.prisma.cauHinhDonVi.update({
      where: { id: ID_MAC_DINH },
      data: duLieu,
    });

    await this.nhatKy.ghiNhan({
      nguoiDungId: nguoiThucHienId,
      hanhDong: "SUA_CAU_HINH_DON_VI",
      doiTuong: "CauHinhDonVi",
      doiTuongId: sau.id,
      giaTriTruoc: truoc,
      giaTriSau: sau,
    });

    return sau;
  }
}
