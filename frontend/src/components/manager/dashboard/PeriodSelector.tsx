"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PERIOD_LABELS, periodToRangeLabel } from "@/utils/analyticsFormatters";
import type { AnalyticsPeriod } from "@/types/analytics";

const PERIOD_VALUES: AnalyticsPeriod[] = [
  "daily",
  "weekly",
  "monthly",
  "four_monthly",
  "semesterly",
];

interface PeriodSelectorProps {
  value: AnalyticsPeriod;
  onChange: (period: AnalyticsPeriod) => void;
  disabled?: boolean;
}

export function PeriodSelector({ value, onChange, disabled }: PeriodSelectorProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
        Periodo
      </span>
      <Select
        value={value}
        onValueChange={(next: string) => onChange(next as AnalyticsPeriod)}
        disabled={disabled}
      >
        <SelectTrigger className="w-44" data-testid="period-trigger">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PERIOD_VALUES.map((period) => (
            <SelectItem key={period} value={period}>
              {PERIOD_LABELS[period]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-muted-foreground text-xs">
        {periodToRangeLabel(value)}
      </span>
    </div>
  );
}
