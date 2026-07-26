"use client";

import { useState } from "react";
import { ClipboardCopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormSection } from "@/components/forms/form-section";
import { TimeSelect } from "@/components/forms/TimeSelect";
import type { BatchFormData, BatchStatus, WeekDay } from "@/types/batch";

interface BatchFormProps {
  initialValues?: Partial<BatchFormData>;
  submitLabel: string;
  onSubmit: (data: BatchFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const emptyFormData: BatchFormData = {
  name: "",
  subject: "",
  googleMeetLink: "",
  schedule: [],
  capacity: 0,
  status: "active",
};

const DAYS_OF_WEEK: { id: WeekDay; label: string }[] = [
  { id: "mon", label: "Monday" },
  { id: "tue", label: "Tuesday" },
  { id: "wed", label: "Wednesday" },
  { id: "thu", label: "Thursday" },
  { id: "fri", label: "Friday" },
  { id: "sat", label: "Saturday" },
  { id: "sun", label: "Sunday" },
];

type FormErrors = Partial<Record<keyof BatchFormData, string>>;
type ScheduleErrors = Partial<Record<WeekDay, string>>;

export default function BatchForm({
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: BatchFormProps) {
  const [formData, setFormData] = useState<BatchFormData>({
    ...emptyFormData,
    ...initialValues,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [scheduleErrors, setScheduleErrors] = useState<ScheduleErrors>({});

  function updateField<K extends keyof BatchFormData>(
    key: K,
    value: BatchFormData[K],
  ) {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function isDaySelected(day: WeekDay) {
    return formData.schedule.some((entry) => entry.day === day);
  }

  function toggleDay(day: WeekDay, checked: boolean) {
    setFormData((prev) => ({
      ...prev,
      schedule: checked
        ? [...prev.schedule, { day, startTime: "", endTime: "" }]
        : prev.schedule.filter((entry) => entry.day !== day),
    }));
    setErrors((prev) => {
      if (!prev.schedule) return prev;
      const next = { ...prev };
      delete next.schedule;
      return next;
    });
    setScheduleErrors((prev) => {
      if (!prev[day]) return prev;
      const next = { ...prev };
      delete next[day];
      return next;
    });
  }

  function updateScheduleTime(
    day: WeekDay,
    field: "startTime" | "endTime",
    value: string,
  ) {
    setFormData((prev) => ({
      ...prev,
      schedule: prev.schedule.map((entry) =>
        entry.day === day ? { ...entry, [field]: value } : entry,
      ),
    }));
    setScheduleErrors((prev) => {
      if (!prev[day]) return prev;
      const next = { ...prev };
      delete next[day];
      return next;
    });
  }

  function applyTimingToAllDays(sourceDay: WeekDay) {
    setFormData((prev) => {
      const source = prev.schedule.find((entry) => entry.day === sourceDay);
      if (!source || !source.startTime || !source.endTime) return prev;
      return {
        ...prev,
        schedule: prev.schedule.map((entry) =>
          entry.day === sourceDay
            ? entry
            : { ...entry, startTime: source.startTime, endTime: source.endTime },
        ),
      };
    });
    setScheduleErrors({});
  }

  function validate(): boolean {
    const nextErrors: FormErrors = {};
    const nextScheduleErrors: ScheduleErrors = {};

    if (!formData.name.trim()) nextErrors.name = "Batch name is required.";

    if (formData.schedule.length === 0) {
      nextErrors.schedule = "Select at least one day.";
    } else {
      formData.schedule.forEach((entry) => {
        if (!entry.startTime || !entry.endTime) {
          nextScheduleErrors[entry.day] = "Start and end time are required.";
        } else if (entry.startTime >= entry.endTime) {
          nextScheduleErrors[entry.day] = "End time must be after start time.";
        }
      });
    }

    if (formData.googleMeetLink.trim()) {
      try {
        new URL(formData.googleMeetLink.trim());
      } catch {
        nextErrors.googleMeetLink = "Enter a valid URL.";
      }
    }

    setErrors(nextErrors);
    setScheduleErrors(nextScheduleErrors);
    return (
      Object.keys(nextErrors).length === 0 &&
      Object.keys(nextScheduleErrors).length === 0
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  }

  return (
    <Card className="[--card-spacing:--spacing(5)] rounded-2xl border-slate-200 shadow-sm sm:[--card-spacing:--spacing(6)] dark:border-slate-800">
      <CardContent>
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-6"
        >
          <FormSection
            title="Batch Details"
            description="Basic information about this batch."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Batch Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Morning Batch"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  aria-invalid={Boolean(errors.name)}
                  className="h-11 rounded-xl"
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Leave blank if you teach one subject"
                  value={formData.subject}
                  onChange={(e) => updateField("subject", e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    updateField("status", value as BatchStatus)
                  }
                >
                  <SelectTrigger id="status" className="h-11 rounded-xl">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </FormSection>

          <FormSection
            title="Schedule"
            description="Select the days this batch meets — each day can have its own timing."
          >
            <div className="flex flex-col gap-3">
              <Label>Days *</Label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`day-${day.id}`}
                      checked={isDaySelected(day.id)}
                      onCheckedChange={(checked) =>
                        toggleDay(day.id, checked === true)
                      }
                    />
                    <Label
                      htmlFor={`day-${day.id}`}
                      className="text-sm font-normal"
                    >
                      {day.label}
                    </Label>
                  </div>
                ))}
              </div>
              {errors.schedule && (
                <p className="text-xs text-destructive">{errors.schedule}</p>
              )}
            </div>

            {formData.schedule.length > 0 && (
              <div className="flex flex-col gap-4">
                {DAYS_OF_WEEK.filter((day) => isDaySelected(day.id)).map(
                  (day) => {
                    const entry = formData.schedule.find(
                      (s) => s.day === day.id,
                    )!;
                    const selectedDayCount = formData.schedule.length;
                    const canApplyToAllDays =
                      selectedDayCount > 1 &&
                      Boolean(entry.startTime) &&
                      Boolean(entry.endTime);

                    return (
                      <div
                        key={day.id}
                        className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800"
                      >
                        <p className="text-sm font-medium text-foreground">
                          {day.label}
                        </p>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="flex flex-col gap-2">
                            <Label>Start Time *</Label>
                            <TimeSelect
                              label={`${day.label} start time`}
                              value={entry.startTime}
                              onChange={(value) =>
                                updateScheduleTime(day.id, "startTime", value)
                              }
                              invalid={Boolean(scheduleErrors[day.id])}
                            />
                          </div>

                          <div className="flex flex-col gap-2">
                            <Label>End Time *</Label>
                            <TimeSelect
                              label={`${day.label} end time`}
                              value={entry.endTime}
                              onChange={(value) =>
                                updateScheduleTime(day.id, "endTime", value)
                              }
                              invalid={Boolean(scheduleErrors[day.id])}
                            />
                          </div>
                        </div>
                        {scheduleErrors[day.id] && (
                          <p className="text-xs text-destructive">
                            {scheduleErrors[day.id]}
                          </p>
                        )}
                        {canApplyToAllDays && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-fit gap-1.5 rounded-lg text-xs"
                            onClick={() => applyTimingToAllDays(day.id)}
                          >
                            <ClipboardCopyIcon className="size-3.5" aria-hidden="true" />
                            Apply {day.label} timing to all selected days
                          </Button>
                        )}
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </FormSection>

          <FormSection
            title="Capacity & Access"
            description="Enrollment limit and how students join the class."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  min={1}
                  placeholder="Leave blank for unlimited"
                  value={formData.capacity || ""}
                  onChange={(e) =>
                    updateField(
                      "capacity",
                      e.target.value ? Number(e.target.value) : 0,
                    )
                  }
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="monthlyFee">Monthly Fee (₹)</Label>
                <Input
                  id="monthlyFee"
                  type="number"
                  min={0}
                  placeholder="Leave blank to use default"
                  value={formData.monthlyFee || ""}
                  onChange={(e) =>
                    updateField(
                      "monthlyFee",
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="googleMeetLink">Google Meet Link</Label>
                <Input
                  id="googleMeetLink"
                  type="url"
                  placeholder="https://meet.google.com/abc-defg-hij"
                  value={formData.googleMeetLink}
                  onChange={(e) =>
                    updateField("googleMeetLink", e.target.value)
                  }
                  aria-invalid={Boolean(errors.googleMeetLink)}
                  className="h-11 rounded-xl"
                />
                {errors.googleMeetLink && (
                  <p className="text-xs text-destructive">
                    {errors.googleMeetLink}
                  </p>
                )}
              </div>
            </div>
          </FormSection>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl sm:w-auto"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-11 rounded-xl sm:w-auto"
              disabled={isSubmitting}
            >
              {submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
