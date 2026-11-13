import { Roboto } from "next/font/google";

/** The app's font (Roboto, as in the Flutter app), self-hosted by next/font at build time. */
export const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-roboto",
  display: "swap",
});
