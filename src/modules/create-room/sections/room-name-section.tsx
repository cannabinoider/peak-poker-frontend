import { TextField } from "@/lib/components/text-field";

import { EditIcon } from "../components/icons";
import { ROOM_NAME_MAX_LENGTH } from "../utils/setup-form";

type RoomNameSectionProps = {
  value: string;
  onChange: (value: string) => void;
};

/** Optional room name, shown to everyone in the room. */
export const RoomNameSection = ({ value, onChange }: RoomNameSectionProps) => (
  <TextField
    label="Room name (optional)"
    hint="Friday big game"
    maxLength={ROOM_NAME_MAX_LENGTH}
    autoCapitalize="sentences"
    autoComplete="off"
    prefixIcon={<EditIcon />}
    className="text-lg"
    value={value}
    onChange={(e) => onChange(e.target.value)}
  />
);
