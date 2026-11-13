import type { Metadata } from "next";

import { CreateRoom } from "@/modules/create-room/create-room";

export const metadata: Metadata = { title: "Peak Poker · New room" };

const page = () => <CreateRoom />;

export default page;
