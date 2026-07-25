"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormSection } from "@/components/forms/form-section";
import type { Batch } from "@/types/batch";
import type { TestFormData } from "@/types/marks";

interface MarksFormProps {
  batches: Batch[];
  initialValues?: Partial<TestFormData>;
  submitLabel: string;
  onSubmit: (data: TestFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const emptyFormData: TestFormData = {
  name: "",
  subject: "",
  batchId: "",
  maxMarks: 50,
  testDate: "",
  remarks: "",
};

type FormErrors = Partial<Record<keyof TestFormData, string>>;

export default function MarksForm({
  batches,
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: MarksFormProps) {
  const [formData, setFormData] = useState<TestFormData>({
    ...emptyFormData,
    ...initialValues,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  function updateField<K extends keyof TestFormData>(
    key: K,
    value: TestFormData[K]
  ) {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function handleBatchChange(batchId: string) {
    const batch = batches.find((b) => b.id === batchId);
    setFormData((prev) => ({
      ...prev,
      batchId,
      subject: prev.subject || batch?.subject || "",
    }));
    setErrors((prev) => ({ ...prev, batchId: undefined }));
  }

  function validate(): boolean {
    const nextErrors: FormErrors = {};

    if (!formData.name.trim()) nextErrors.name = "Test name is required.";
    if (!formData.subject.trim())
      nextErrors.subject = "Subject is required.";
    if (!formData.batchId) nextErrors.batchId = "Select a batch.";
    if (!formData.maxMarks || formData.maxMarks <= 0) {
      nextErrors.maxMarks = "Maximum marks must be at least 1.";
    }
    if (!formData.testDate) nextErrors.testDate = "Test date is required.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
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
            title="Test Details"
            description="Basic information about this test."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Test Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Unit Test 3"
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
                <Label htmlFor="batchId">Batch *</Label>
                <Select value={formData.batchId} onValueChange={handleBatchChange}>
                  <SelectTrigger
                    id="batchId"
                    className="h-11 rounded-xl"
                    aria-invalid={Boolean(errors.batchId)}
                  >
                    <SelectValue placeholder="Select a batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.map((batch) => (
                      <SelectItem key={batch.id} value={batch.id}>
                        {batch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.batchId && (
                  <p className="text-xs text-destructive">
                    {errors.batchId}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  placeholder="e.g. Mathematics"
                  value={formData.subject}
                  onChange={(e) => updateField("subject", e.target.value)}
                  aria-invalid={Boolean(errors.subject)}
                  className="h-11 rounded-xl"
                />
                {errors.subject && (
                  <p className="text-xs text-destructive">
                    {errors.subject}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="maxMarks">Maximum Marks *</Label>
                <Input
                  id="maxMarks"
                  type="number"
                  min={1}
                  value={formData.maxMarks}
                  onChange={(e) =>
                    updateField("maxMarks", Number(e.target.value))
                  }
                  aria-invalid={Boolean(errors.maxMarks)}
                  className="h-11 rounded-xl"
                />
                {errors.maxMarks && (
                  <p className="text-xs text-destructive">
                    {errors.maxMarks}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="testDate">Test Date *</Label>
                <Input
                  id="testDate"
                  type="date"
                  value={formData.testDate}
                  onChange={(e) => updateField("testDate", e.target.value)}
                  aria-invalid={Boolean(errors.testDate)}
                  className="h-11 rounded-xl"
                />
                {errors.testDate && (
                  <p className="text-xs text-destructive">
                    {errors.testDate}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                placeholder="Optional notes about this test"
                value={formData.remarks}
                onChange={(e) => updateField("remarks", e.target.value)}
                rows={3}
                className="rounded-xl"
              />
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
