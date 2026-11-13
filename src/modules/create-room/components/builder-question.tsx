import { type ReactNode, useId } from "react";

import { ChipGroup } from "@/lib/components/choice-chip";

type BuilderQuestionProps = {
  question: string;
  children: ReactNode;
};

/** One question of the game builder: a bold line and its answer chips. */
export const BuilderQuestion = ({ question, children }: BuilderQuestionProps) => {
  const id = useId();
  return (
    <div className="pt-[18px]">
      <p id={id} className="mb-2 font-bold text-text">
        {question}
      </p>
      <ChipGroup aria-labelledby={id}>{children}</ChipGroup>
    </div>
  );
};
