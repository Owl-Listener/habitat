import React, { forwardRef, useId } from "react";
import "./Select.css";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "id"> {
  /** The visible label. Always required — a field without a label is inaccessible. */
  label: string;
  /** The list of choices. */
  options: SelectOption[];
  /** Empty first option shown before a choice is made, e.g. 'Choose a country'. */
  placeholder?: string;
  /** Puts the field into an error state and shows this message below the select. */
  errorMessage?: string;
}

/**
 * Select lets a user choose one option from a list. See select.meta.json for
 * the full agent-readable contract.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, placeholder, errorMessage, disabled, className, ...rest }, ref) => {
    const id = useId();
    const errorId = `${id}-error`;
    const hasError = Boolean(errorMessage);

    return (
      <div className={["habitat-select-field", className].filter(Boolean).join(" ")}>
        <label className="habitat-select__label" htmlFor={id}>
          {label}
        </label>
        <div className="habitat-select__wrapper">
          <select
            ref={ref}
            id={id}
            className={[
              "habitat-select",
              hasError ? "habitat-select--error" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            disabled={disabled}
            aria-invalid={hasError || undefined}
            aria-describedby={hasError ? errorId : undefined}
            {...rest}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="habitat-select__chevron" aria-hidden="true" />
        </div>
        {hasError && (
          <span id={errorId} className="habitat-select__error" role="alert">
            {errorMessage}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
