"use client";

import { type FormEvent, useState } from "react";

import { GoldButton } from "@/lib/components/button";
import { Glass } from "@/lib/components/glass";
import { TextField } from "@/lib/components/text-field";

export interface JoinFormProps {
  code: string;
  initialName: string;
  /** False when the link has no invite secret (a new player can't join then). */
  hasInvite: boolean;
  error: string | null;
  busy: boolean;
  onJoin: (name: string) => void;
}

/** Pick a name and take a seat. */
export const JoinForm = ({
  code,
  initialName,
  hasInvite,
  error,
  busy,
  onJoin,
}: JoinFormProps) => {
  const [name, setName] = useState(initialName);
  const trimmed = name.trim();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (trimmed.length > 0) {
      onJoin(trimmed);
    }
  };
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="text-center">
        <p className="text-sm uppercase tracking-widest text-faint">Room</p>
        <h1 className="tabular text-3xl font-black tracking-wider text-gold">{code}</h1>
      </div>
      <Glass>
        <form onSubmit={submit} className="flex flex-col gap-4">
          {!hasInvite && (
            <p className="text-sm text-dim">
              To take a new seat you need the full invite link from the host (it has a
              secret part after <span className="text-text">#</span>). If you already
              joined on this phone, you&apos;ll get your seat back automatically.
            </p>
          )}
          <TextField
            label="Your name"
            hint="e.g. Amit"
            maxLength={20}
            autoComplete="nickname"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={error ?? undefined}
          />
          <GoldButton type="submit" loading={busy} disabled={trimmed.length === 0}>
            Take a seat
          </GoldButton>
        </form>
      </Glass>
    </main>
  );
};
