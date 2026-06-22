import React, { forwardRef, useId } from "react";
import "./Radio.css";

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "id"> {
  /** The visible label beside this option. Always required. */
  label: string;
  /** The value submitted when this option is selected. */
  value: string;
}

/**
 * A single radio option. Must be used inside a RadioGroup — a Radio rendered
 * alone has no name attribute and is not connected to any group.
 * See radio.meta.json for the full agent-readable contract.
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, value, disabled, className, ...rest }, ref) => {
    const id = useId();

    return (
      <label
        className={[
          "habitat-radio__label",
          disabled ? "habitat-radio__label--disabled" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        htmlFor={id}
      >
        <input
          ref={ref}
          id={id}
          type="radio"
          value={value}
          disabled={disabled}
          className="habitat-radio"
          {...rest}
        />
        {label}
      </label>
    );
  }
);

Radio.displayName = "Radio";
