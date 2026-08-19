import { SetMetadata } from "@nestjs/common";
import { SKIP_PASSWORD_CHECK_KEY } from "../constants/metadata-keys";

/** Cho phep goi route ngay ca khi tai khoan dang bi bat buoc doi mat khau. */
export const BoQuaKiemTraDoiMatKhau = () => SetMetadata(SKIP_PASSWORD_CHECK_KEY, true);
