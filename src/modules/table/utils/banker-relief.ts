/** Shown on the disabled control until the server says the banker is away. */
export const BANKER_STILL_RESPONDING = "The banker is still responding";

/**
 * The "ask for a new banker" control. Enabled only when the server has set
 * `bankerAway` (disconnected, sitting out, or a decision left unanswered).
 */
export const bankerRelief = (bankerAway: boolean | undefined) =>
  bankerAway === true
    ? { enabled: true, reason: null }
    : { enabled: false, reason: BANKER_STILL_RESPONDING };
