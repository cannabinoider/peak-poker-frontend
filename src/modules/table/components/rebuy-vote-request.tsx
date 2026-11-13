import { Icon } from "./icons";

type RebuyVoteRequestProps = {
  name: string;
  /** Which buy-in this would be (2 = first rebuy). */
  buyIn: number;
  approve: number;
  needed: number;
  yourVote: "approve" | "deny" | null;
  onVote: (approve: boolean) => void;
};

/** The broke banker's own rebuy: approve or deny it with the rest of the table. */
export const RebuyVoteRequest = ({
  name,
  buyIn,
  approve,
  needed,
  yourVote,
  onVote,
}: RebuyVoteRequestProps) => (
  <div className="flex items-center gap-2 rounded-[14px] border border-gold/60 bg-gold/[0.12] py-2 pl-3 pr-2">
    <Icon name="bank" size={18} className="shrink-0 text-gold" />
    <div className="min-w-0 flex-1 text-sm text-white">
      <p>
        {name} wants to rebuy (buy-in #{buyIn})
      </p>
      <p className="tabular text-dim">
        Table vote · {approve}/{needed} approvals
        {yourVote && ` · you voted ${yourVote === "approve" ? "yes" : "no"}`}
      </p>
    </div>
    {yourVote === null && (
      <>
        <button
          type="button"
          onClick={() => onVote(false)}
          aria-label={`Vote against ${name}'s rebuy`}
          className="min-h-11 shrink-0 rounded-full px-3 text-sm font-medium text-red outline-none hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-red">
          Deny
        </button>
        <button
          type="button"
          onClick={() => onVote(true)}
          aria-label={`Vote for ${name}'s rebuy`}
          className="min-h-11 shrink-0 rounded-full bg-gold px-4 text-sm font-semibold text-black outline-none focus-visible:ring-2 focus-visible:ring-white">
          Approve
        </button>
      </>
    )}
  </div>
);
