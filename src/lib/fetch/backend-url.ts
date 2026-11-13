/** Backend base URL, e.g. `http://localhost:4000` or `https://api.example.com`. */
export const BACKEND_BASE_URL = (
  process.env.NEXT_PUBLIC_BACKEND_BASE_URL ?? "http://localhost:4000"
).replace(/\/+$/, "");

/** The game WebSocket on the same host: http → ws, https → wss. */
export const GAME_WS_URL = `${BACKEND_BASE_URL.replace(/^http/, "ws")}/ws`;
