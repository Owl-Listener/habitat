import React, { forwardRef, useId } from "react";
import "./Input.css";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "id"> {
  /** The visible label. Always required — a field without a label is inaccessible. */
  label: string;
  /** Puts the field into an error state and shows this message below the input. */
  errorMessage?: string;
}

/**
 * Input lets a user enter a short piece of text. See input.meta.json for the
 * full agent-readable contract.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, errorMessage, disabled, className, ...rest }, ref) => {
    const id = useId();
    const errorId = `${id}-error`;
    const hasError = Boolean(errorMessage);

    return (
      <div className={["habitat-input-field", className].filter(Boolean).join(" ")}>
        <label className="habitat-input__label" htmlFor={id}>
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          className={[
            "habitat-input",
            hasError ? "habitat-input--error" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? errorId : undefined}
          {...rest}
        />
        {hasError && (
          <span id={errorId} className="habitat-input__error" role="alert">
            {errorMessage}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
