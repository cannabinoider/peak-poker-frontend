"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { OutlineButton } from "@/lib/components/button";
import { Glass } from "@/lib/components/glass";
import { SectionTitle } from "@/lib/components/section-title";
import { TextField } from "@/lib/components/text-field";

import { LinkIcon } from "../components/icons";
import { invitePath, parseInvite } from "../utils";

/** Paste an invite link (or type a room code) and go to the room. */
export const JoinCard = () => {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const invite = parseInvite(value);
    if (invite === null) {
      setError("That doesn't look like an invite link or room code.");
      return;
    }
    const path = invitePath(invite);
    if (invite.secret === null) {
      router.push(path);
    } else {
      // A full load so the room page reads the `#secret` part.
      window.location.assign(path);
    }
  };

  return (
    <Glass padding={20}>
      <form onSubmit={submit} className="flex h-full flex-col" noValidate>
        <SectionTitle as="h2" id="join-title">
          Join a game
        </SectionTitle>
        <TextField
          label="Invite link or room code"
          hint="Paste the link from your host"
          prefixIcon={<LinkIcon />}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          enterKeyHint="go"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          error={error ?? undefined}
          helper="New players need the full link. A code alone works for rooms you've joined on this device."
        />
        <OutlineButton
          type="submit"
          className="mt-4"
          disabled={value.trim().length === 0}>
          Join
        </OutlineButton>
      </form>
    </Glass>
  );
};
