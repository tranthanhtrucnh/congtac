import { SetMetadata } from "@nestjs/common";
import { IS_PUBLIC_KEY } from "../constants/metadata-keys";

/** Danh dau route khong can dang nhap (vd dang-nhap, lam-moi token). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
