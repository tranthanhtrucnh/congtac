import { Injectable, type PipeTransform, BadRequestException } from "@nestjs/common";
import type { ZodSchema } from "zod";

/**
 * Dung schema Zod tu packages/validation de kiem tra du lieu vao API -
 * cung mot schema dung o React Hook Form phia web, khong viet luat kiem tra
 * 2 lan (xem NHAT_KY_QUYET_DINH.md).
 */
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown) {
    const ketQua = this.schema.safeParse(value);
    if (!ketQua.success) {
      throw new BadRequestException({
        message: "Dữ liệu không hợp lệ",
        loi: ketQua.error.issues.map((v) => ({ truong: v.path.join("."), thongBao: v.message })),
      });
    }
    return ketQua.data;
  }
}
