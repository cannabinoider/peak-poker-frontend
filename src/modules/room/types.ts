/** `GET /rooms/:code`: the room before joining (mirrors the backend's RoomSummary). */
export interface RoomSummary {
  code: string;
  name: string;
  buyInRupees: number;
  blinds: string;
  game: string;
  players: number;
  maxSeats: number;
  /** Empty seat numbers a new player can pick. */
  freeSeats: number[];
  started: boolean;
  ended: boolean;
}
