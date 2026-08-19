import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { chromium, type Browser } from "playwright";

export type KhoGiayIn = "A5" | "A4";

/**
 * Dung PDF tu HTML/CSS qua Chromium headless (Playwright) - CLAUDE.md quy
 * tac TUYET DOI #2: khong dung window.print() (bo cuc sai khac nhau tuy
 * trinh duyet/may in/ty le thu phong, khong chap nhan duoc cho chung tu
 * hanh chinh can dung khho A5/A4).
 *
 * Giu 1 trinh duyet Chromium song suot vong doi ung dung (khoi tao 1 lan,
 * dung chung cho moi lan in) thay vi mo Chromium moi cho tung yeu cau - mo
 * Chromium ton ~1-2s, lam moi lan in cham va ton tai nguyen khong can thiet.
 */
@Injectable()
export class PdfService implements OnModuleInit, OnModuleDestroy {
  private readonly log = new Logger(PdfService.name);
  private trinhDuyet: Browser | null = null;

  async onModuleInit() {
    this.trinhDuyet = await chromium.launch({ headless: true });
  }

  async onModuleDestroy() {
    await this.trinhDuyet?.close();
  }

  /**
   * html phai la 1 trang HTML day du, tu chua toan bo CSS va anh (base64
   * inline) - khong tham chieu file/URL ngoai de khong phu thuoc mang luc in.
   */
  async xuatPdfTuHtml(html: string, khoGiay: KhoGiayIn = "A5"): Promise<Buffer> {
    if (!this.trinhDuyet) {
      // Phong truong hop goi truoc khi onModuleInit chay xong (khong nen xay
      // ra trong NestJS binh thuong, nhung van tu khoi tao lai cho an toan).
      this.trinhDuyet = await chromium.launch({ headless: true });
    }

    const trang = await this.trinhDuyet.newPage();
    try {
      await trang.setContent(html, { waitUntil: "load" });
      const buffer = await trang.pdf({
        format: khoGiay,
        printBackground: true,
        margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
      });
      return buffer;
    } catch (loi) {
      this.log.error("Loi xuat PDF", loi instanceof Error ? loi.stack : loi);
      throw loi;
    } finally {
      await trang.close();
    }
  }
}
