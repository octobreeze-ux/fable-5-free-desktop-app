import { apiClient } from "./apiClient";
import type {
  CreateUserPayload,
  HealthCheckResponse,
  LoginPayload,
  LoginResponse,
  PaginatedResponse,
  UpdateUserPayload,
  User,
} from "./apiTypes";

export const endpoints = {
  health: {
    check: () => apiClient.get<HealthCheckResponse>("/health"),
  },

  auth: {
    login: (payload: LoginPayload) =>
      apiClient.post<LoginResponse>("/auth/login", payload),

    logout: () => apiClient.post<void>("/auth/logout"),

    refresh: () => apiClient.post<LoginResponse>("/auth/refresh"),

    me: () => apiClient.get<User>("/auth/me"),
  },

  users: {
    list: (params?: { page?: number; limit?: number }) =>
      apiClient.get<PaginatedResponse<User>>("/users", { params: params as Record<string, string> }),

    get: (id: string) => apiClient.get<User>(`/users/${id}`),

    create: (payload: CreateUserPayload) =>
      apiClient.post<User>("/users", payload),

    update: (id: string, payload: UpdateUserPayload) =>
      apiClient.patch<User>(`/users/${id}`, payload),

    remove: (id: string) => apiClient.delete<void>(`/users/${id}`),
  },
};
