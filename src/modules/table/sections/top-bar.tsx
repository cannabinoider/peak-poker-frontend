import { Pill } from "@/lib/components/pill";
import { DealerSwitch } from "@/modules/table/components/dealer-choice";
import { IconButton } from "@/modules/table/components/icon-button";
import { Icon } from "@/modules/table/components/icons";
import { BETTING_LABELS } from "@/modules/table/constants";
import type { Room } from "@/modules/table/types";
import { blindsLabel } from "@/modules/table/utils/room";

type TopBarProps = {
  room: Room;
  onRules: () => void;
  onLedger: () => void;
  onMenu: () => void;
};

/**
 * Room name, blinds and the game being played, the table's state (orbit,
 * paused, last hand) and the rules / ledger / menu buttons (Flutter `_TopBar`).
 */
export const TopBar = ({ room, onRules, onLedger, onMenu }: TopBarProps) => {
  const hand = room.hand;
  const status =
    room.orbitInfo !== undefined || room.paused || room.ending || hand !== null;
  const gameText = hand
    ? `${hand.gameLabel} · ${BETTING_LABELS[hand.betting].short}`
    : "";
  return (
    <header className="safe-top px-3 pb-1 lg:px-6 lg:pt-2">
      <div className="flex items-center gap-1.5">
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <Pill icon={<Icon name="door" />} className="shrink" title="Room">
            {room.name || room.code}
          </Pill>
          <Pill icon={<Icon name="blinds" />} className="shrink-0" title="Blinds">
            {blindsLabel(room.setup)}
          </Pill>
          {hand && (
            <Pill tone="gold" className="hidden shrink sm:inline-flex" title="Game">
              {gameText}
            </Pill>
          )}
        </div>
        <IconButton icon="info" label="How to play" onClick={onRules} />
        <IconButton icon="receipt" label="Ledger" onClick={onLedger} />
        <IconButton icon="more" label="Table menu" onClick={onMenu} />
      </div>
      <div className="mt-1 flex">
        <DealerSwitch />
      </div>
      {status && (
        <div className="mt-1 flex flex-wrap items-center gap-1.5" role="status">
          {hand && (
            <Pill tone="gold" className="sm:hidden" title="Game">
              {gameText}
            </Pill>
          )}
          {hand && <Pill tone="glass">Hand #{hand.handNumber}</Pill>}
          {room.orbitInfo && (
            <Pill tone="orbit" icon={<Icon name="orbit" />}>
              Orbit: {room.orbitInfo}
            </Pill>
          )}
          {room.paused && (
            <Pill tone="blue" icon={<Icon name="pause" />}>
              Paused
            </Pill>
          )}
          {room.ending && (
            <Pill tone="red" icon={<Icon name="flag" />}>
              Last hand
            </Pill>
          )}
        </div>
      )}
    </header>
  );
};
