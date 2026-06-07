import React, { forwardRef } from "react";
import "./Button.css";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual emphasis. Use 'primary' for the single main action in a view. */
  variant?: ButtonVariant;
  /** Control size. 'md' by default; 'sm' for dense or secondary contexts. */
  size?: ButtonSize;
  /** When true, shows a busy state and blocks interaction without removing the control from the tab order's intent. */
  loading?: boolean;
}

/**
 * Button lets a user commit to an action. It is the most direct way to make
 * something happen. See button.meta.json for the full agent-readable contract,
 * including the variants' decision rules and the anti-patterns that keep usage honest.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      className,
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    const classes = [
      "habitat-button",
      `habitat-button--${variant}`,
      `habitat-button--${size}`,
      loading ? "is-loading" : "",
      className ?? "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        ref={ref}
        className={classes}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        {...rest}
      >
        {loading && (
          <span className="habitat-button__spinner" aria-hidden="true" />
        )}
        <span className="habitat-button__label">{children}</span>
      </button>
    );
  }
);

Button.displayName = "Button";
