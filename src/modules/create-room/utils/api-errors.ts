/**
 * Turns a failed `POST /rooms` into lines to show the host. The backend sends
 * `{ message, errors }` where `errors` is a list of strings (setup problems) or
 * Zod issues (`{ path, message }`).
 */

interface ZodIssueLike {
  path?: (string | number)[];
  message: string;
}

const isIssue = (e: unknown): e is ZodIssueLike =>
  typeof e === "object" &&
  e !== null &&
  typeof (e as { message?: unknown }).message === "string";

const issueText = (e: unknown): string | null => {
  if (typeof e === "string") {
    return e;
  }
  if (isIssue(e)) {
    const path = (e.path ?? []).filter((p) => p !== "setup").join(".");
    return path.length > 0 ? `${path}: ${e.message}` : e.message;
  }
  return null;
};

/** Error lines from whatever was thrown (a `ClientError`, a network failure, …). */
export const createRoomErrorLines = (err: unknown): string[] => {
  const status = (err as { status?: unknown } | null)?.status;
  const body = (err as { body?: unknown } | null)?.body as
    { message?: unknown; errors?: unknown } | undefined;

  if (typeof status === "number" && body !== undefined) {
    if (status === 429) {
      return ["Too many rooms made from this network. Wait a minute and try again."];
    }
    const lines = Array.isArray(body.errors)
      ? body.errors.map(issueText).filter((t): t is string => t !== null)
      : [];
    if (lines.length > 0) {
      return lines;
    }
    if (typeof body.message === "string" && body.message.length > 0) {
      return [body.message];
    }
    return [`Could not create the room (error ${status}).`];
  }

  const name = (err as { name?: unknown } | null)?.name;
  if (name === "TimeoutError" || name === "AbortError") {
    return ["The server took too long to answer. Try again."];
  }
  return ["Could not reach the server. Check your connection and try again."];
};
