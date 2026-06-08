import React, { forwardRef, useId, useEffect, useRef } from "react";
import "./Checkbox.css";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "id"> {
  /** The visible label beside the checkbox. Always required. */
  label: string;
  /** Shows a dash instead of a tick — means some but not all children are checked. */
  indeterminate?: boolean;
  /** When set, puts the checkbox into an error state and shows this message below. */
  errorMessage?: string;
}

/**
 * Checkbox lets a user toggle a boolean choice or make selections from a list.
 * See checkbox.meta.json for the full agent-readable contract.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, indeterminate = false, errorMessage, disabled, className, ...rest }, ref) => {
    const id = useId();
    const errorId = `${id}-error`;
    const hasError = Boolean(errorMessage);
    const innerRef = useRef<HTMLInputElement>(null);

    const resolvedRef = (ref as React.RefObject<HTMLInputElement>) ?? innerRef;

    useEffect(() => {
      if (resolvedRef.current) {
        resolvedRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate, resolvedRef]);

    return (
      <div className={["habitat-checkbox-field", className].filter(Boolean).join(" ")}>
        <label
          className={[
            "habitat-checkbox__label",
            disabled ? "habitat-checkbox__label--disabled" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          htmlFor={id}
        >
          <input
            ref={resolvedRef}
            id={id}
            type="checkbox"
            className={[
              "habitat-checkbox",
              hasError ? "habitat-checkbox--error" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            disabled={disabled}
            aria-invalid={hasError || undefined}
            aria-describedby={hasError ? errorId : undefined}
            {...rest}
          />
          {label}
        </label>
        {hasError && (
          <span id={errorId} className="habitat-checkbox__error" role="alert">
            {errorMessage}
          </span>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
