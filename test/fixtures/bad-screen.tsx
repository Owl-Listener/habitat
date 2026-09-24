// A screen written the way an AI writes one without the design system.
// Every line below the imports breaks one checkable rule, on purpose.
import React from "react";
import { OldInput } from "./legacy";

export function InvoiceScreen() {
  return (
    <form style={{ padding: "24px", color: "#16201f" }}>
      <OldInput label="Customer" />
      <input placeholder="Amount" />
      <button style={{ background: "rgb(31, 111, 107)" }}>Send</button>
      <div style={{ gap: "var(--space-huge)" }}>Issue #123 is not a colour</div>
    </form>
  );
}
