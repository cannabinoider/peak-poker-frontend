/** 1500 → "1,500" (Western grouping, as in the app). */
export const fmt = (n: number) => {
  const s = String(Math.abs(Math.trunc(n)));
  let out = n < 0 ? "-" : "";
  for (let i = 0; i < s.length; i++) {
    if (i > 0 && (s.length - i) % 3 === 0) {
      out += ",";
    }
    out += s[i];
  }
  return out;
};

/** Exact rupees with up to 2 decimals (rounding to ₹1 happens only at settlement). */
export const rupees = (v: number) => `₹${Number.isInteger(v) ? fmt(v) : v.toFixed(2)}`;

/** "Amit Shah" → "AS", "bina" → "B". */
export const initials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  const first = (p: string) => [...p][0]?.toUpperCase() ?? "";
  return parts.length === 1 ? first(parts[0]) : first(parts[0]) + first(parts.at(-1)!);
};
