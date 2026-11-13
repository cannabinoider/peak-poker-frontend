/** Success body from the backend: `{ message, data }`. */
export interface IGenericResponse<T> {
  message: string;
  data: T;
}

/** Error body from the backend: `{ message, errors? }`. */
export interface ErrorResponse {
  message: string;
  errors?: unknown;
}

/** A non-2xx response, with the backend's message. */
export class ClientError extends Error {
  constructor(
    readonly status: number,
    readonly body: ErrorResponse,
  ) {
    super(body.message);
    this.name = "ClientError";
  }
}
