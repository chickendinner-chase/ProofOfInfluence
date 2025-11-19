import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { isDevEnvironment } from "@/lib/env";

interface DemoUser {
  userId: string;
  walletAddress: string;
  label?: string | null;
  username?: string | null;
  scenario?: string | null;
}

const DEMO_USER_STORAGE_KEY = "demoUserId";

export function useDemoUser() {
  const [location, setLocation] = useLocation();
  const [selectedDemoUserId, setSelectedDemoUserIdState] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(DEMO_USER_STORAGE_KEY) || null;
    }
    return null;
  });

  // Fetch demo users list
  const { data: demoUsers = [], isLoading } = useQuery<DemoUser[]>({
    queryKey: ["/api/test/demo-users"],
    enabled: typeof window !== "undefined" && isDevEnvironment(),
  });

  // Sync with URL query param
  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const urlDemoUserId = urlParams.get("demoUserId");

    if (urlDemoUserId && urlDemoUserId !== selectedDemoUserId) {
      setSelectedDemoUserIdState(urlDemoUserId);
      localStorage.setItem(DEMO_USER_STORAGE_KEY, urlDemoUserId);
    } else if (!urlDemoUserId && selectedDemoUserId) {
      // Remove from URL if not present but we have it in state
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("demoUserId");
      setLocation(newUrl.pathname + newUrl.search, { replace: true });
    }
  }, [location, selectedDemoUserId, setLocation]);

  // Sync localStorage to URL when selectedDemoUserId changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (selectedDemoUserId) {
      const url = new URL(window.location.href);
      url.searchParams.set("demoUserId", selectedDemoUserId);
      setLocation(url.pathname + url.search, { replace: true });
    }
  }, [selectedDemoUserId, setLocation]);

  const setSelectedDemoUserId = useCallback((userId: string | null) => {
    if (userId) {
      localStorage.setItem(DEMO_USER_STORAGE_KEY, userId);
    } else {
      localStorage.removeItem(DEMO_USER_STORAGE_KEY);
    }
    setSelectedDemoUserIdState(userId);
  }, []);

  const clearDemoUser = useCallback(() => {
    localStorage.removeItem(DEMO_USER_STORAGE_KEY);
    setSelectedDemoUserIdState(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("demoUserId");
    setLocation(url.pathname + url.search, { replace: true });
  }, [setLocation]);

  const selectedDemoUser = selectedDemoUserId
    ? demoUsers.find((u) => u.userId === selectedDemoUserId || u.walletAddress === selectedDemoUserId)
    : null;

  const isUsingDemoUser = !!selectedDemoUserId;

  return {
    selectedDemoUserId,
    selectedDemoUser,
    demoUsers,
    isLoading,
    setSelectedDemoUserId,
    clearDemoUser,
    isUsingDemoUser,
    isDev: isDevEnvironment(),
  };
}
