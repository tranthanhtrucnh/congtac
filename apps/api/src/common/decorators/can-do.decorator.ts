import { SetMetadata } from "@nestjs/common";
import type { MaQuyen } from "@congtac/shared";
import { PERMISSIONS_KEY } from "../constants/metadata-keys";

/**
 * Khai bao quyen bat buoc de goi route. Backend luon tu kiem tra quyen nay
 * o PermissionsGuard - khong chi an nut o giao dien (CLAUDE.md quy tac #3).
 */
export const CanDo = (...maQuyen: MaQuyen[]) => SetMetadata(PERMISSIONS_KEY, maQuyen);
