import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

/**
 * Ket noi PostgreSQL qua Prisma. $connect() duoc goi tuong minh khi module
 * khoi dong de xac nhan ket noi that ngay tu luc bootstrap, khong doi den
 * cau truy van dau tien moi phat hien loi cau hinh DATABASE_URL.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log("Da ket noi PostgreSQL qua Prisma");
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
