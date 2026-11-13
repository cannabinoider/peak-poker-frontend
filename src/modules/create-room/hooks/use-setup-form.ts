"use client";

import { useState } from "react";

import { saveOwnerToken } from "@/modules/session/session-storage";

import { createRoom } from "../api/client-actions";
import type { ChipRowInput, SetupForm, VariantConfigJson } from "../types";
import { createRoomErrorLines } from "../utils/api-errors";
import { MAX_CUSTOM_GAMES, uniqueGameId } from "../utils/custom-game";
import { validateSetup } from "../utils/game-setup";
import {
  allGames,
  createRequestFromForm,
  DEFAULT_FORM,
  setupFromForm,
} from "../utils/setup-form";

/** All state of the setup screen, the derived setup and its validation. */
export const useSetupForm = () => {
  const [form, setForm] = useState<SetupForm>(DEFAULT_FORM);
  const [creating, setCreating] = useState(false);
  const [createErrors, setCreateErrors] = useState<string[]>([]);

  const setup = setupFromForm(form);
  const validation = validateSetup(setup);

  const update = (patch: Partial<SetupForm>) => setForm((f) => ({ ...f, ...patch }));

  const setChipRow = (id: number, patch: Partial<Omit<ChipRowInput, "id">>) =>
    setForm((f) => ({
      ...f,
      chipRows: f.chipRows.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }));

  const addChipRow = () =>
    setForm((f) => ({
      ...f,
      chipRows: [
        ...f.chipRows,
        { id: Math.max(0, ...f.chipRows.map((r) => r.id)) + 1, value: "0", count: "1" },
      ],
    }));

  const removeChipRow = (id: number) =>
    setForm((f) => ({ ...f, chipRows: f.chipRows.filter((r) => r.id !== id) }));

  const toggleGame = (id: string, on: boolean) =>
    setForm((f) => ({
      ...f,
      selectedGames: on
        ? [...f.selectedGames.filter((g) => g !== id), id]
        : f.selectedGames.filter((g) => g !== id),
    }));

  const canAddCustomGame = form.customGames.length < MAX_CUSTOM_GAMES;

  /** Adds a game from the builder, renaming its id if another game already has it. */
  const addCustomGame = (game: VariantConfigJson) =>
    setForm((f) => {
      const id = uniqueGameId(
        game.id,
        allGames(f).map((v) => v.id),
      );
      return {
        ...f,
        customGames: [...f.customGames, { ...game, id }],
        selectedGames: [...f.selectedGames, id],
      };
    });

  const removeCustomGame = (id: string) =>
    setForm((f) => ({
      ...f,
      customGames: f.customGames.filter((g) => g.id !== id),
      selectedGames: f.selectedGames.filter((g) => g !== id),
    }));

  const submit = async () => {
    if (!validation.errors.length && !creating) {
      setCreating(true);
      setCreateErrors([]);
      try {
        const room = await createRoom(createRequestFromForm(form));
        saveOwnerToken(room.code, room.ownerToken);
        // A full page load keeps the `#secret` part of the share path.
        window.location.assign(room.sharePath);
      } catch (err) {
        setCreateErrors(createRoomErrorLines(err));
        setCreating(false);
      }
    }
  };

  return {
    form,
    setup,
    validation,
    creating,
    createErrors,
    canAddCustomGame,
    update,
    setChipRow,
    addChipRow,
    removeChipRow,
    toggleGame,
    addCustomGame,
    removeCustomGame,
    submit,
  };
};

export type SetupFormApi = ReturnType<typeof useSetupForm>;
