import { useCallback, useReducer } from "react";
import { apiClient } from "./apiClient";

type State<T> = {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
};

type Action<T> =
  | { type: "loading" }
  | { type: "success"; payload: T }
  | { type: "error"; payload: Error }
  | { type: "reset" };

function createReducer<T>() {
  return (state: State<T>, action: Action<T>): State<T> => {
    switch (action.type) {
      case "loading":
        return { ...state, isLoading: true, error: null };
      case "success":
        return { data: action.payload, isLoading: false, error: null };
      case "error":
        return { data: null, isLoading: false, error: action.payload };
      case "reset":
        return { data: null, isLoading: false, error: null };
      default:
        return state;
    }
  };
}

const initialState = { data: null, isLoading: false, error: null };

export function useApiGet<T>(endpoint: string) {
  const reducer = createReducer<T>();
  const [state, dispatch] = useReducer(reducer, initialState);

  const execute = useCallback(
    async (params?: Record<string, string>) => {
      dispatch({ type: "loading" });
      try {
        const result = await apiClient.get<T>(endpoint, { params });
        dispatch({ type: "success", payload: result });
        return result;
      } catch (error) {
        dispatch({ type: "error", payload: error as Error });
        throw error;
      }
    },
    [endpoint],
  );

  const reset = useCallback(() => {
    dispatch({ type: "reset" });
  }, []);

  return { ...state, execute, reset };
}

export function useApiMutation<T, P = unknown>(method: "POST" | "PUT" | "PATCH" | "DELETE", endpoint: string) {
  const reducer = createReducer<T>();
  const [state, dispatch] = useReducer(reducer, initialState);

  const execute = useCallback(
    async (payload?: P) => {
      dispatch({ type: "loading" });
      try {
        const result = await (() => {
          switch (method) {
            case "POST":
              return apiClient.post<T>(endpoint, payload);
            case "PUT":
              return apiClient.put<T>(endpoint, payload);
            case "PATCH":
              return apiClient.patch<T>(endpoint, payload);
            case "DELETE":
              return apiClient.delete<T>(endpoint);
          }
        })();
        dispatch({ type: "success", payload: result });
        return result;
      } catch (error) {
        dispatch({ type: "error", payload: error as Error });
        throw error;
      }
    },
    [method, endpoint],
  );

  const reset = useCallback(() => {
    dispatch({ type: "reset" });
  }, []);

  return { ...state, execute, reset };
}
