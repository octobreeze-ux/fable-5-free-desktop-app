import { ApiError } from "./apiClient";

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (typeof error.data === "string") {
      return error.data;
    }
    if (error.data && typeof error.data === "object" && "message" in (error.data as Record<string, unknown>)) {
      return (error.data as Record<string, unknown>).message as string;
    }
    return `Request failed with status ${error.status}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
}

export function getStatusGroup(status: number): "info" | "success" | "redirect" | "client_error" | "server_error" {
  if (status >= 100 && status < 200) return "info";
  if (status >= 200 && status < 300) return "success";
  if (status >= 300 && status < 400) return "redirect";
  if (status >= 400 && status < 500) return "client_error";
  return "server_error";
}

export function buildQueryString(params: Record<string, string | number | boolean | undefined | null>): string {
  const entries = Object.entries(params).filter(
    (entry): entry is [string, string | number | boolean] =>
      entry[1] !== undefined && entry[1] !== null,
  );

  if (entries.length === 0) return "";

  const searchParams = new URLSearchParams();
  for (const [key, value] of entries) {
    searchParams.append(key, String(value));
  }

  return `?${searchParams.toString()}`;
}

export function retry<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; delayMs?: number; shouldRetry?: (error: Error) => boolean } = {},
): Promise<T> {
  const { maxRetries = 3, delayMs = 1000, shouldRetry = () => true } = options;

  async function attempt(remaining: number): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (remaining <= 1 || !shouldRetry(error as Error)) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return attempt(remaining - 1);
    }
  }

  return attempt(maxRetries);
}
