"use client";

import type { User } from "firebase/auth";
import { useCallback } from "react";
import { useUserAuth } from "@/context/AuthContext";

/** Fetch with session cookie and/or Firebase ID token for `/api/*` routes. */
export function useAuthorizedFetch() {
  const { user, isSessionUser } = useUserAuth();

  return useCallback(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      if (!isSessionUser && user && "getIdToken" in user) {
        const token = await (user as User).getIdToken();
        headers.set("Authorization", `Bearer ${token}`);
      }
      return fetch(input, { ...init, headers, credentials: "include" });
    },
    [user, isSessionUser]
  );
}
