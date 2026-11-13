import type { Metadata } from "next";
import { Suspense } from "react";

import { RoomScreen } from "@/modules/room/room-screen";

export const metadata: Metadata = { title: "Peak Poker · Table" };

type Params = Promise<{ code: string }>;

/** Reads the room code (request data) inside Suspense so the shell can prerender. */
const Room = async ({ params }: { params: Params }) => {
  const { code } = await params;
  return <RoomScreen code={code} />;
};

const page = ({ params }: { params: Params }) => (
  <Suspense fallback={null}>
    <Room params={params} />
  </Suspense>
);

export default page;
