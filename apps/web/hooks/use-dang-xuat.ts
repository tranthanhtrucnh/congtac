"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { goiApi } from "@/lib/api";

export function useDangXuat() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => goiApi<{ thanhCong: boolean }>("/auth/dang-xuat", { method: "POST" }),
    onSettled: () => {
      // Du API loi hay khong, van xoa cache va dua ve trang dang nhap - cookie
      // httpOnly da bi backend xoa (hoac da het han), khong con ly do o lai.
      queryClient.clear();
      router.push("/dang-nhap");
      router.refresh();
    },
  });
}
