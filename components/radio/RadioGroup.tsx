import React from "react";
import "./Radio.css";

export interface RadioGroupProps {
  /** Labels the whole group. Rendered as a <legend> inside a <fieldset>. */
  legend: string;
  /** Ties all child Radio inputs together — must be unique within the form. */
  name: string;
  /** The currently selected value. */
  value?: string;
  /** Called with the new value when the user selects a different option. */
  onChange?: (value: string) => void;
  /** When set, puts the group into an error state and shows this message below. */
  errorMessage?: string;
  /** Disables every Radio in the group. */
  disabled?: boolean;
  /** The Radio components. */
  children: React.ReactNode;
}

/**
 * RadioGroup owns the name, legend, and error message for a set of Radio options.
 * See radio.meta.json for the full agent-readable contract.
 */
export const RadioGroup: React.FC<RadioGroupProps> = ({
  legend,
  name,
  value,
  onChange,
  errorMessage,
  disabled = false,
  children,
}) => {
  const errorId = `${name}-error`;
  const hasError = Boolean(errorMessage);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <fieldset
      className={["habitat-radio-group", disabled ? "habitat-radio-group--disabled" : ""]
        .filter(Boolean)
        .join(" ")}
      disabled={disabled}
      aria-describedby={hasError ? errorId : undefined}
    >
      <legend className="habitat-radio-group__legend">{legend}</legend>
      <div
        className="habitat-radio-group__options"
        onChange={handleChange as unknown as React.ChangeEventHandler<HTMLDivElement>}
      >
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return child;
          return React.cloneElement(
            child as React.ReactElement<{ name?: string; checked?: boolean }>,
            {
              name,
              checked:
                value !== undefined ? child.props.value === value : undefined,
            }
          );
        })}
      </div>
      {hasError && (
        <span id={errorId} className="habitat-radio-group__error" role="alert">
          {errorMessage}
        </span>
      )}
    </fieldset>
  );
};

RadioGroup.displayName = "RadioGroup";
