"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { triggerPageTransition } from "@/shared/components/providers/PageTransitionProvider";

/**
 * Gunakan hook ini sebagai pengganti `useRouter()` di seluruh aplikasi.
 * Setiap navigasi akan diawali animasi transisi mewah secara otomatis.
 */
export function useTransitionRouter() {
  const router = useRouter();

  const push = useCallback(
    (href: string, options?: Parameters<ReturnType<typeof useRouter>["push"]>[1]) => {
      triggerPageTransition(() => {
        router.push(href, options);
      });
    },
    [router]
  );

  const replace = useCallback(
    (href: string, options?: Parameters<ReturnType<typeof useRouter>["replace"]>[1]) => {
      triggerPageTransition(() => {
        router.replace(href, options);
      });
    },
    [router]
  );

  return {
    ...router,
    push,
    replace,
  };
}
