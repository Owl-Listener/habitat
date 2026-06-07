import React, { forwardRef, useId } from "react";
import "./Textarea.css";

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> {
  /** The visible label. Always required — a field without a label is inaccessible. */
  label: string;
  /** Puts the field into an error state and shows this message below the textarea. */
  errorMessage?: string;
  /** Initial visible row count. Defaults to 4. */
  rows?: number;
}

/**
 * Textarea lets a user enter multi-line text. See textarea.meta.json for the
 * full agent-readable contract.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, errorMessage, disabled, rows = 4, className, ...rest }, ref) => {
    const id = useId();
    const errorId = `${id}-error`;
    const hasError = Boolean(errorMessage);

    return (
      <div className={["habitat-textarea-field", className].filter(Boolean).join(" ")}>
        <label className="habitat-textarea__label" htmlFor={id}>
          {label}
        </label>
        <textarea
          ref={ref}
          id={id}
          rows={rows}
          className={[
            "habitat-textarea",
            hasError ? "habitat-textarea--error" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? errorId : undefined}
          {...rest}
        />
        {hasError && (
          <span id={errorId} className="habitat-textarea__error" role="alert">
            {errorMessage}
          </span>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
