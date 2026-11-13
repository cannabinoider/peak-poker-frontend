import type { timeTone } from "@/modules/table/utils/countdown";

/** CSS color for a countdown tone. */
export const TONE_COLOR: Record<ReturnType<typeof timeTone>, string> = {
  green: "rgb(var(--green))",
  gold: "rgb(var(--gold))",
  red: "rgb(var(--red))",
};
