"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const HOURS = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0"),
);
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

interface TimeParts {
  hour12: string;
  minute: string;
  period: "AM" | "PM";
}

// Times are stored and validated as 24-hour "HH:mm" strings everywhere else
// in the app (schema, sorting, comparisons) — this only changes how the
// value is edited, not how it's represented.
function parseTime24(value: string): TimeParts | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hour24 = Number(match[1]);
  const minute = match[2];
  const period: "AM" | "PM" = hour24 >= 12 ? "PM" : "AM";
  const hour12raw = hour24 % 12;
  const hour12 = String(hour12raw === 0 ? 12 : hour12raw).padStart(2, "0");
  return { hour12, minute, period };
}

function buildTime24(hour12: string, minute: string, period: "AM" | "PM"): string {
  let hour24 = Number(hour12) % 12;
  if (period === "PM") hour24 += 12;
  return `${String(hour24).padStart(2, "0")}:${minute}`;
}

interface TimeSelectProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  invalid?: boolean;
  disabled?: boolean;
}

export function TimeSelect({
  value,
  onChange,
  label,
  invalid = false,
  disabled = false,
}: TimeSelectProps) {
  const parsed = parseTime24(value);
  const hour12 = parsed?.hour12;
  const minute = parsed?.minute;
  const period = parsed?.period;

  function handleHourChange(nextHour: string) {
    onChange(buildTime24(nextHour, minute ?? "00", period ?? "AM"));
  }

  function handleMinuteChange(nextMinute: string) {
    onChange(buildTime24(hour12 ?? "09", nextMinute, period ?? "AM"));
  }

  function handlePeriodChange(nextPeriod: "AM" | "PM") {
    onChange(buildTime24(hour12 ?? "09", minute ?? "00", nextPeriod));
  }

  return (
    <div className="flex items-center gap-1.5" role="group" aria-label={label}>
      <Select value={hour12} onValueChange={handleHourChange} disabled={disabled}>
        <SelectTrigger
          aria-label={`${label} hour`}
          aria-invalid={invalid}
          className="h-11 w-16 justify-center rounded-xl px-2"
        >
          <SelectValue placeholder="--" />
        </SelectTrigger>
        <SelectContent>
          {HOURS.map((h) => (
            <SelectItem key={h} value={h}>
              {h}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span className="text-sm text-muted-foreground" aria-hidden="true">
        :
      </span>

      <Select value={minute} onValueChange={handleMinuteChange} disabled={disabled}>
        <SelectTrigger
          aria-label={`${label} minute`}
          aria-invalid={invalid}
          className="h-11 w-16 justify-center rounded-xl px-2"
        >
          <SelectValue placeholder="--" />
        </SelectTrigger>
        <SelectContent>
          {MINUTES.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={period} onValueChange={handlePeriodChange} disabled={disabled}>
        <SelectTrigger
          aria-label={`${label} AM or PM`}
          aria-invalid={invalid}
          className="h-11 w-[4.75rem] justify-center rounded-xl px-2"
        >
          <SelectValue placeholder="AM" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="AM">AM</SelectItem>
          <SelectItem value="PM">PM</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
