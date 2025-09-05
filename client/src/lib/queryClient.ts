import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { response } from "express";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text || res.statusText}`);
  }
}

export async function apiRequest(method: string, url: string, data?: unknown): Promise<any> {
  console.log(`Making ${method} request to ${url}`, data);
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });
  console.log(`Response status: ${res.status}`);

  await throwIfResNotOk(res);
  
  // Handle responses with no content (like DELETE operations)
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    console.log('Response has no content (204 or empty)');
    return null;
  }
  
  // Check if response has JSON content
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const json = await res.json();
    console.log(`Response JSON:`, json);
    return json;
  }
  
  // For non-JSON responses, return the text
  const text = await res.text();
  console.log(`Response text:`, text);
  return text;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
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
      staleTime: 0, // Make data stale immediately so it refetches properly
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
