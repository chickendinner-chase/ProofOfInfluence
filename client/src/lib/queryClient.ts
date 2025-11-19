import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Read demoUserId from localStorage if available
  const demoUserId = typeof window !== "undefined" 
    ? localStorage.getItem("demoUserId")
    : null;

  const headers: Record<string, string> = data ? { "Content-Type": "application/json" } : {};
  
  // Add demo user header if present (dev/staging only)
  if (demoUserId && (import.meta.env.DEV || import.meta.env.MODE === "development")) {
    headers["x-demo-user-id"] = demoUserId;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Handle queryKey that may contain objects (e.g., for demo user filtering)
    const urlParts: string[] = [];
    const queryParams: string[] = [];
    
    for (const part of queryKey) {
      if (typeof part === "string") {
        urlParts.push(part);
      } else if (typeof part === "object" && part !== null) {
        // Extract query parameters from object
        for (const [key, value] of Object.entries(part)) {
          if (value !== undefined && value !== null) {
            queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
          }
        }
      }
    }
    
    let url = urlParts.join("/");
    if (queryParams.length > 0) {
      url += `?${queryParams.join("&")}`;
    }
    
    // Read demoUserId from localStorage if available
    const demoUserId = typeof window !== "undefined" 
      ? localStorage.getItem("demoUserId")
      : null;

    const headers: Record<string, string> = {};
    
    // Add demo user header if present (dev/staging only)
    if (demoUserId && (import.meta.env.DEV || import.meta.env.MODE === "development")) {
      headers["x-demo-user-id"] = demoUserId;
    }
    
    const res = await fetch(url, {
      credentials: "include",
      headers,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
