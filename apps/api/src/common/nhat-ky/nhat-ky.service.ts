import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

export interface GhiNhatKyDauVao {
  nguoiDungId?: string | null;
  hanhDong: string;
  doiTuong: string;
  doiTuongId?: string;
  giaTriTruoc?: unknown;
  giaTriSau?: unknown;
  diaChiIp?: string;
}

/**
 * Ghi nhat ky he thong cho moi thao tac quan trong (CLAUDE.md quy tac TUYET
 * DOI #7). UI xem nhat ky day du lam o module rieng sau - day chi la duong
 * ghi, dung ngay tu module Xac thuc/Nguoi dung tro di.
 */
@Injectable()
export class NhatKyService {
  constructor(private readonly prisma: PrismaService) {}

  async ghiNhan(duLieu: GhiNhatKyDauVao): Promise<void> {
    await this.prisma.nhatKyHeThong.create({
      data: {
        nguoiDungId: duLieu.nguoiDungId ?? null,
        hanhDong: duLieu.hanhDong,
        doiTuong: duLieu.doiTuong,
        doiTuongId: duLieu.doiTuongId,
        giaTriTruoc: duLieu.giaTriTruoc as never,
        giaTriSau: duLieu.giaTriSau as never,
        diaChiIp: duLieu.diaChiIp,
      },
    });
  }
}
