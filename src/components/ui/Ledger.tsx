import type { ReactNode } from "react";
import { FadeIn } from "./FadeIn";
import { DoubleRule, Rule } from "./Rule";

interface LedgerProps {
  // Close the list as a total, with an accounting double rule.
  total?: boolean;
  children: ReactNode;
}

// A list of ledger rows, closed by a final rule.
export function Ledger({ total = false, children }: LedgerProps) {
  return (
    <div>
      {children}
      {total ? <DoubleRule /> : <Rule />}
    </div>
  );
}

interface LedgerRowProps {
  // Left column, right-aligned on wide screens (e.g. a period).
  aside?: ReactNode;
  // Far-right column (e.g. a year).
  trailing?: ReactNode;
  children: ReactNode;
}

export function LedgerRow({ aside, trailing, children }: LedgerRowProps) {
  return (
    <div>
      <Rule />
      <FadeIn className="grid gap-y-3 py-8 sm:gap-y-4 sm:py-10 md:grid-cols-12 md:gap-x-8">
        <div className="md:col-span-3 md:text-right">{aside}</div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:gap-10 md:col-span-9">
          <div className="min-w-0">{children}</div>
          {trailing && <div className="shrink-0 sm:text-right">{trailing}</div>}
        </div>
      </FadeIn>
    </div>
  );
}
