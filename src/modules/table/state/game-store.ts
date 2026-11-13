"use client";

import { create } from "zustand";

import { GAME_WS_URL } from "@/lib/fetch/backend-url";
import {
  forgetOwnerToken,
  forgetRoomSession,
  getOwnerToken,
  getRoomSession,
  saveRoomSession,
} from "@/modules/session/session-storage";
import type {
  ActionMessage,
  ChooseMessage,
  ClientMessage,
  StateMessage,
  WelcomeMessage,
} from "@/modules/table/api/contracts";
import { GameSocket, type SocketStatus } from "@/modules/table/api/game-socket";

export interface Toast {
  id: number;
  text: string;
}

interface JoinRequest {
  code: string;
  /** Needed for a new player; not for rejoining with a saved token. */
  name?: string;
  secret?: string | null;
  token?: string | null;
}

interface GameStore {
  code: string | null;
  status: SocketStatus;
  me: WelcomeMessage | null;
  room: StateMessage | null;
  /** Why joining failed (shown on the join form). */
  joinError: string | null;
  /** Errors after joining ("Minimum is 100"), shown briefly. */
  toast: Toast | null;
  /** Set when the server closed the room for good (e.g. the host closed it). */
  closedReason: string | null;

  /** Connects and joins (or rejoins with the saved token). */
  join: (request: JoinRequest) => void;
  /** Leaves the room on this device (closes the socket). */
  disconnect: () => void;
  /** Forgets this device's seat in the room. */
  forgetSeat: () => void;
  dismissToast: () => void;

  act: (type: ActionMessage["type"], amount?: number) => void;
  discard: (card: string) => void;
  split: (assignment: number[]) => void;
  choose: (choice: Omit<ChooseMessage, "t">) => void;
  startGame: () => void;
  makeBanker: (seat: number) => void;
  /** Ask the server to replace an unresponsive banker. The server picks who. */
  relieveBanker: () => void;
  rebuy: () => void;
  decideRebuy: (seat: number, approve: boolean) => void;
  /** Vote on the broke banker's own rebuy. */
  voteRebuy: (seat: number, approve: boolean) => void;
  /** Ask to leave with your whole chip stack. */
  requestCashOut: () => void;
  /** Banker (or the owner, for the banker's own request): agree or refuse. */
  decideCashOut: (seat: number, approve: boolean) => void;
  endGame: () => void;
  setPaused: (paused: boolean) => void;
  /** Banker: skip the wait between hands. */
  dealNow: () => void;
  askMoreTime: () => void;
  setSittingOut: (value: boolean, seat?: number) => void;
}

let socket: GameSocket | null = null;
let toastId = 0;

/** The creator's one-time owner token for `code`, if this device made the room. */
const ownerTokenField = (code: string) => {
  const ownerToken = getOwnerToken(code);
  return ownerToken ? { ownerToken } : {};
};

/**
 * The one live room this tab is in. Holds only what the server sent; every
 * button just sends a message and waits for the next state.
 */
export const useGameStore = create<GameStore>()((set, get) => {
  const send = (message: ClientMessage) => {
    if (!socket?.send(message)) {
      set({ toast: { id: ++toastId, text: "Not connected — reconnecting…" } });
    }
  };

  return {
    code: null,
    status: "idle",
    me: null,
    room: null,
    joinError: null,
    toast: null,
    closedReason: null,

    join: ({ code, name, secret, token }) => {
      socket?.stop();
      const upper = code.trim().toUpperCase();
      let sessionToken = token ?? null;
      let joinedName = name?.trim() ?? "";
      set({
        code: upper,
        me: null,
        room: null,
        joinError: null,
        closedReason: null,
        status: "connecting",
      });

      const s = new GameSocket(GAME_WS_URL, {
        joinMessage: () => ({
          t: "join",
          room: upper,
          ...(sessionToken
            ? { token: sessionToken }
            : {
                name: joinedName,
                ...(secret ? { secret } : {}),
                ...ownerTokenField(upper),
              }),
        }),
        onStatus: (status) => {
          if (socket === s) {
            set({ status });
          }
        },
        onMessage: (m) => {
          if (socket !== s) {
            return;
          }
          switch (m.t) {
            case "welcome": {
              sessionToken = m.token;
              const saved = getRoomSession(upper);
              if (!joinedName) {
                joinedName = saved?.name ?? "";
              }
              saveRoomSession({
                code: upper,
                token: m.token,
                name: joinedName,
                joinedAt: Date.now(),
                isOwner: m.isOwner,
              });
              forgetOwnerToken(upper);
              set({ me: m, joinError: null });
              break;
            }
            case "state":
              set({ room: m });
              break;
            case "error":
              if (get().me === null) {
                // Joining failed: a stale token means "join again as new".
                if (sessionToken && !secret) {
                  forgetRoomSession(upper);
                }
                s.stop();
                socket = null;
                set({ joinError: m.message, status: "idle" });
              } else {
                set({ toast: { id: ++toastId, text: m.message } });
              }
              break;
            case "closed":
              // Gone for good: stop reconnecting and drop it from "your rooms".
              s.stop();
              socket = null;
              forgetRoomSession(upper);
              set({ closedReason: m.reason, status: "idle" });
              break;
          }
        },
      });
      socket = s;
      s.start();
    },

    disconnect: () => {
      socket?.stop();
      socket = null;
      set({ status: "idle", me: null, room: null, closedReason: null });
    },

    forgetSeat: () => {
      const code = get().code;
      if (code) {
        forgetRoomSession(code);
      }
      get().disconnect();
    },

    dismissToast: () => set({ toast: null }),

    act: (type, amount = 0) => send({ t: "action", type, amount }),
    discard: (card) => send({ t: "action", type: "discard", card }),
    split: (assignment) => send({ t: "action", type: "split", split: assignment }),
    choose: (choice) => send({ t: "choose", ...choice }),
    startGame: () => send({ t: "start" }),
    makeBanker: (seat) => send({ t: "banker", seat }),
    relieveBanker: () => send({ t: "relieveBanker" }),
    rebuy: () => send({ t: "rebuy" }),
    decideRebuy: (seat, approve) => send({ t: "rebuyDecision", seat, approve }),
    voteRebuy: (seat, approve) => send({ t: "rebuyVote", seat, approve }),
    requestCashOut: () => send({ t: "cashOut" }),
    decideCashOut: (seat, approve) => send({ t: "cashOutDecision", seat, approve }),
    endGame: () => send({ t: "endGame" }),
    setPaused: (paused) => send({ t: "pause", paused }),
    dealNow: () => send({ t: "dealNow" }),
    askMoreTime: () => send({ t: "moreTime" }),
    setSittingOut: (value, seat) =>
      send({ t: "sitOut", value, ...(seat !== undefined ? { seat } : {}) }),
  };
});
