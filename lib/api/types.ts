export type ApiSuccess<T> = { success: true; data: T; message?: string };

export type ApiErrorBody = {
  code: string;
  message: string;
  fields?: Record<string, string[]>;
};

export type ApiError = {
  success: false;
  error: ApiErrorBody;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export function isApiError<T>(res: ApiResponse<T>): res is ApiError {
  return res.success === false;
}
