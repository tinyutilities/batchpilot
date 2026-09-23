import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Grade } from "@/types/marks";

interface GradeBadgeProps {
  grade: Grade;
  className?: string;
}

// A best-to-worst gradient across the palette's semantic roles rather than
// a literal traffic-light scheme: success → primary → secondary → warning
// → accent → danger.
const GRADE_CLASSES: Record<Grade, string> = {
  "A+": "bg-success-soft text-success hover:bg-success-soft",
  A: "bg-primary-soft text-primary hover:bg-primary-soft",
  "B+": "bg-secondary-soft text-secondary-foreground hover:bg-secondary-soft",
  B: "bg-warning-soft text-warning hover:bg-warning-soft",
  C: "bg-accent-soft text-accent hover:bg-accent-soft",
  D: "bg-danger-soft text-destructive hover:bg-danger-soft",
  F: "bg-danger-soft text-destructive hover:bg-danger-soft",
};

export default function GradeBadge({ grade, className }: GradeBadgeProps) {
  return (
    <Badge
      className={cn(
        "rounded-full border-transparent",
        GRADE_CLASSES[grade],
        className
      )}
    >
      {grade}
    </Badge>
  );
}
