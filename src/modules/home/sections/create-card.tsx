"use client";

import { useRouter } from "next/navigation";

import { GoldButton } from "@/lib/components/button";
import { Glass } from "@/lib/components/glass";
import { SectionTitle } from "@/lib/components/section-title";

import { AddIcon } from "../components/icons";

/** Host a game: pick the chips and games, then share the invite link. */
export const CreateCard = () => {
  const router = useRouter();
  return (
    <Glass padding={20} className="flex flex-col">
      <SectionTitle>Host a game</SectionTitle>
      <p className="mb-4 text-sm text-dim md:flex-1">
        Set the buy-in, chips and games, then send the invite link to your friends.
      </p>
      <GoldButton
        icon={<AddIcon />}
        onClick={() => router.push("/create")}
        onMouseEnter={() => router.prefetch("/create")}>
        Create a room
      </GoldButton>
    </Glass>
  );
};
