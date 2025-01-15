export interface ApiErrorBody {
  message: string;
  code: number;
  customCode?: number;
}

export class ApiError extends Error {
  message: string;
  code: number;
  customCode?: number;
  name = 'ApiError';

  constructor(body: ApiErrorBody) {
    super(body.message);
    this.message = body.message;
    this.code = body.code;
    this.customCode = body.customCode;
  }
}
