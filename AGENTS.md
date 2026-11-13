<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Peak Poker frontend: rules for agents

Read `README.md` first.

- Next.js 16 App Router, React 19, TypeScript, Tailwind v3 (tokens in
  `tailwind.config.ts` + `src/app/globals.css`). No MUI, no auth, no tenants.
- `src/app/` holds thin route files only; they fetch data and render a module.
- Features live in `src/modules/<feature>/` (`api/`, `sections/`,
  `components/`, `types.ts`, `utils.ts`, `constants.ts`, a top-level component).
- A component that renders from props alone goes in
  `src/lib/components/<concern>/` (with an `index.ts`), not in a feature module.
- Don't dump code in one big file; add a file in the right folder.
- Arrow-function components and consts (`func-style: expression`), double
  quotes, Prettier width 88, kebab-case file names, `I`-prefixed API interfaces.
- `src/modules/table/api/contracts.ts` is generated: change the backend's
  `src/svc/modules/game/contracts.ts`, then `npm run contracts:sync`.
- The browser stores identity only (room code, session token, name) plus two
  device preferences (card privacy, sound on/off). Never store or compute game
  state client-side beyond display.
- Sounds are synthesised with Web Audio in `src/lib/sound/` (no audio files).
  Which sound to play is worked out from state changes in
  `modules/table/utils/sound-events.ts`; the winner celebration is
  `modules/table/components/winner-celebration.tsx` (try every animal at
  `/preview` in dev).
- Playing-card suits and animal avatars are drawn as inline SVG (no emoji or
  font glyphs).
- Unit tests: `*.test.ts` next to the code, `node:test`; imports inside tests
  use explicit `.ts` extensions.
- Don't commit or push unless the owner asks.
- Legal guardrail: free private tracker. No payments, deposits, withdrawals,
  rake or real-money wording; flag anything that could look like gambling.
