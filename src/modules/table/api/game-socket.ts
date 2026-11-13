import {
  type ClientMessage,
  type ServerMessage,
  ServerMessageSchema,
} from "@/modules/table/api/contracts";

export type SocketStatus = "idle" | "connecting" | "open" | "reconnecting" | "closed";

export interface GameSocketHandlers {
  /** Called on every (re)connect: return the join message to send first. */
  joinMessage: () => ClientMessage;
  onMessage: (message: ServerMessage) => void;
  onStatus: (status: SocketStatus) => void;
}

const MIN_BACKOFF_MS = 500;
const MAX_BACKOFF_MS = 15_000;

/**
 * One WebSocket to the game server that reconnects by itself (backoff with
 * jitter, and right away when the tab becomes visible or the network comes
 * back). Every connection starts with the join message, so a reconnect gets
 * the same seat back with the saved token.
 */
export class GameSocket {
  private ws: WebSocket | null = null;
  private status: SocketStatus = "idle";
  private attempts = 0;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private stopped = false;

  constructor(
    private readonly url: string,
    private readonly handlers: GameSocketHandlers,
  ) {}

  start() {
    this.stopped = false;
    window.addEventListener("online", this.reconnectNow);
    document.addEventListener("visibilitychange", this.onVisibility);
    this.open();
  }

  /** Stops for good (leaving the page, or a fatal join error). */
  stop() {
    this.stopped = true;
    window.removeEventListener("online", this.reconnectNow);
    document.removeEventListener("visibilitychange", this.onVisibility);
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
    this.ws?.close(1000);
    this.ws = null;
    this.setStatus("closed");
  }

  send(message: ClientMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  private setStatus(status: SocketStatus) {
    this.status = status;
    this.handlers.onStatus(status);
  }

  private open() {
    if (this.stopped) {
      return;
    }
    this.setStatus(this.attempts === 0 ? "connecting" : "reconnecting");
    const ws = new WebSocket(this.url);
    this.ws = ws;
    ws.onopen = () => {
      this.attempts = 0;
      this.setStatus("open");
      ws.send(JSON.stringify(this.handlers.joinMessage()));
    };
    ws.onmessage = (event: MessageEvent<string>) => {
      let raw: unknown;
      try {
        raw = JSON.parse(event.data);
      } catch {
        return;
      }
      const parsed = ServerMessageSchema.safeParse(raw);
      // A newer server may add fields; trust the shape we know if it doesn't parse.
      this.handlers.onMessage(parsed.success ? parsed.data : (raw as ServerMessage));
    };
    ws.onclose = () => {
      if (this.ws === ws) {
        this.ws = null;
        this.scheduleRetry();
      }
    };
    ws.onerror = () => {
      // onclose follows and schedules the retry.
    };
  }

  private scheduleRetry() {
    if (this.stopped) {
      return;
    }
    this.attempts++;
    this.setStatus("reconnecting");
    const base = Math.min(MAX_BACKOFF_MS, MIN_BACKOFF_MS * 2 ** (this.attempts - 1));
    const delay = base / 2 + Math.random() * (base / 2);
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
    this.retryTimer = setTimeout(() => this.open(), delay);
  }

  private readonly reconnectNow = () => {
    if (this.stopped || this.ws) {
      return;
    }
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
    this.open();
  };

  private readonly onVisibility = () => {
    if (document.visibilityState === "visible") {
      this.reconnectNow();
    }
  };

  get currentStatus() {
    return this.status;
  }
}
