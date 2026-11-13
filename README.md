# Peak Poker frontend

The website for Peak Poker online: a free, private chip tracker for poker
nights with friends. Next.js (App Router), React, TypeScript, Tailwind v3.

> Peak Poker only tracks chips and who owes whom between friends. It takes no
> payments, deposits or withdrawals and charges no rake.

The backend (REST + game WebSocket) is `../poker-backend`. The look is ported
from the Flutter app in `../poker-hotspot`.

## Layout

```
src/app/                    thin routes only (page / layout / loading / error)
src/modules/<feature>/      one folder per feature
  api/                      constants.ts (URLs, tags), fetch.ts ("use server" reads),
                            actions.ts ("use server" mutations), client-actions.ts
  sections/ components/     feature UI
  types.ts utils.ts constants.ts
src/modules/table/api/contracts.ts   copy of the backend's game contracts (generated)
src/lib/components/<concern>/        reusable UI that only needs props
src/lib/fetch/              fetchClient + backend URL
src/lib/{hooks,utils,constants,providers,fonts}/
```

## Setup

```bash
cp .env.example .env.local     # NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:4000
npm install
npm run dev                    # http://localhost:3000 (backend must be running)
```

## Commands

```bash
npm run dev / build / start
npm run lint / lint-fix / typecheck
npm run pretty / pretty-check
npm test                        # node:test unit tests (*.test.ts)
npm run contracts:sync          # copy game contracts from ../poker-backend
npm run contracts:check         # fail if the copy is out of date
```

## Where state lives

- The browser keeps only identity: `{roomCode, sessionToken, playerName}` per
  room and the card-privacy preference (localStorage).
- All game state lives on the server. The page opens a WebSocket straight to
  the backend (`wss://` on https); Next.js only serves pages.

# peak-poker-frontend
