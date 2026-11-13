import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";
const backend = new URL(
  process.env.NEXT_PUBLIC_BACKEND_BASE_URL ?? "http://localhost:4000",
);
const backendWs = `${backend.protocol === "https:" ? "wss:" : "ws:"}//${backend.host}`;

// The page may only talk to itself and the game backend, and can't be framed.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  `connect-src 'self' ${backend.origin} ${backendWs}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "no-referrer" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  headers: async () => [{ source: "/(.*)", headers: securityHeaders }],
};

export default nextConfig;
