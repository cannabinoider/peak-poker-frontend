import { Avatar, isAnimal } from "@/lib/components/avatar";

type PlayerAvatarProps = {
  name: string;
  seat: number;
  /** Animal id from the server ("fox"); unknown values fall back to initials. */
  animal?: string;
  size?: number;
};

/** Avatar for a player whose animal comes off the wire as a plain string. */
export const PlayerAvatar = ({ name, seat, animal, size }: PlayerAvatarProps) => (
  <Avatar
    name={name}
    seat={seat}
    animal={isAnimal(animal) ? animal : null}
    size={size}
  />
);
