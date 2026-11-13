/** Animal avatars a player can pick; must match the backend's list. */
export const ANIMALS = [
  "lion",
  "monkey",
  "panda",
  "fox",
  "rabbit",
  "bear",
  "cat",
  "owl",
  "frog",
  "koala",
  "elephant",
  "snake",
  "pig",
] as const;

export type Animal = (typeof ANIMALS)[number];

export const isAnimal = (value: unknown): value is Animal =>
  typeof value === "string" && (ANIMALS as readonly string[]).includes(value);
