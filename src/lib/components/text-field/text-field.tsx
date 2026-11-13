import { type ComponentProps, type ReactNode, useId } from "react";

import { cn } from "@/lib/utils/styles";

type TextFieldProps = Omit<ComponentProps<"input">, "placeholder" | "size"> & {
  /** Floating label (rests inside the field, moves onto the border when focused or filled). */
  label?: ReactNode;
  /** Hint text; with a label it shows only while focused and empty (Material behavior). */
  hint?: string;
  /** Error message below the field; also turns the border red and sets `aria-invalid`. */
  error?: ReactNode;
  /** Helper text below the field (hidden while there is an error). */
  helper?: ReactNode;
  /** Leading icon (24px, dim), like `prefixIcon`. */
  prefixIcon?: ReactNode;
  /** Fixed text before the value, like `prefixText: "₹ "` (shown once the label floats). */
  prefix?: string;
  /** Compact 48px height (`isDense: true`). Default 56px. */
  dense?: boolean;
  /** No fill and no border (the raise-amount field), keeping the rest. */
  bare?: boolean;
  /** Classes for the wrapper. `className` goes to the `<input>`. */
  containerClassName?: string;
};

/**
 * Text input styled like the app's Material `InputDecorationTheme`: glass fill, 14px
 * rounded 1px glass border (1.5px gold when focused), dim floating label notched into
 * the border, red error text below. Native input props are forwarded to `<input>`.
 */
export const TextField = ({
  label,
  hint,
  error,
  helper,
  prefixIcon,
  prefix,
  dense = false,
  bare = false,
  id,
  disabled,
  className,
  containerClassName,
  "aria-describedby": describedBy,
  ...props
}: TextFieldProps) => {
  const autoId = useId();
  const inputId = id ?? autoId;
  const noteId = `${inputId}-note`;
  const hasError = error !== undefined && error !== null && error !== false;
  const note = hasError ? error : helper;
  const hasLabel = label !== undefined && label !== null && label !== false;
  const hasIcon = prefixIcon !== undefined;

  // The label "floats" while the field is focused or has a value; the value is detected
  // with `:placeholder-shown`, so the input always gets a placeholder (" " if no hint).
  return (
    <div
      className={cn("flex flex-col", disabled && "opacity-[0.38]", containerClassName)}>
      <div
        className={cn(
          "group/tf relative flex items-center",
          dense ? "min-h-12" : "min-h-14",
        )}>
        {!bare && (
          <fieldset
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-x-0 -top-[5px] bottom-0 m-0 rounded-input border bg-glass px-2 py-0 text-left",
              hasError
                ? "border-red group-focus-within/tf:border-[1.5px]"
                : "border-glass group-focus-within/tf:border-[1.5px] group-focus-within/tf:border-gold",
            )}>
            {hasLabel && (
              <legend
                className={cn(
                  "invisible block h-[11px] w-auto max-w-[0.01px] overflow-hidden whitespace-nowrap p-0 text-xs",
                  "transition-[max-width] duration-100",
                  "group-focus-within/tf:max-w-full group-has-[input:not(:placeholder-shown)]/tf:max-w-full",
                )}>
                <span className="inline-block px-1 opacity-0">{label}</span>
              </legend>
            )}
          </fieldset>
        )}

        {hasIcon && (
          <span
            aria-hidden
            className="relative flex size-12 shrink-0 items-center justify-center text-dim [&>svg]:size-6">
            {prefixIcon}
          </span>
        )}

        {prefix !== undefined && (
          <span
            aria-hidden
            className={cn(
              "tabular relative shrink-0 text-base text-dim",
              hasIcon ? "pl-0" : "pl-3",
              hasLabel &&
                "invisible group-focus-within/tf:visible group-has-[input:not(:placeholder-shown)]/tf:visible",
            )}>
            {prefix}
          </span>
        )}

        <input
          id={inputId}
          disabled={disabled}
          placeholder={hint ?? " "}
          aria-invalid={hasError || undefined}
          aria-describedby={cn(describedBy, note !== undefined && noteId) || undefined}
          className={cn(
            "relative min-w-0 flex-1 self-stretch bg-transparent text-base text-text outline-none",
            "placeholder:text-white/60 disabled:cursor-not-allowed",
            hasLabel && "placeholder:text-transparent focus:placeholder:text-white/60",
            prefix !== undefined || hasIcon ? "pr-3" : "px-3",
            className,
          )}
          {...props}
        />

        {hasLabel && (
          <label
            htmlFor={inputId}
            className={cn(
              "pointer-events-none absolute top-1/2 max-w-[calc(100%-24px)] -translate-y-1/2 truncate text-base leading-tight text-dim",
              "origin-left transition-all duration-150",
              hasIcon ? "left-12" : "left-3",
              "group-focus-within/tf:left-3 group-focus-within/tf:top-0 group-focus-within/tf:text-xs",
              "group-has-[input:not(:placeholder-shown)]/tf:left-3 group-has-[input:not(:placeholder-shown)]/tf:top-0 group-has-[input:not(:placeholder-shown)]/tf:text-xs",
            )}>
            {label}
          </label>
        )}
      </div>

      {note !== undefined && note !== null && note !== false && (
        <p
          id={noteId}
          className={cn(
            "px-3 pt-1 text-xs leading-tight",
            hasError ? "text-red" : "text-dim",
          )}>
          {note}
        </p>
      )}
    </div>
  );
};
