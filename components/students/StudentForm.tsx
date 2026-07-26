"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
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
import { cn } from "@/lib/utils";
import type { Gender, StudentFormData, StudentStatus } from "@/types/student";
import type { Batch } from "@/types/batch";

export type StudentFormSubmitIntent = "save" | "save-and-add-another";

interface StudentFormProps {
  batches: Batch[];
  initialValues?: Partial<StudentFormData>;
  submitLabel: string;
  onSubmit: (data: StudentFormData, intent: StudentFormSubmitIntent) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  // Only set inside AddStudentDialog — full pages (new/edit) never show this.
  showSaveAndAddAnother?: boolean;
  // Dialog opens/remounts want the cursor ready to type immediately.
  autoFocusFirstName?: boolean;
  // When set, the Batch field renders as a fixed, non-editable value instead
  // of a Select — used when the dialog was opened from a specific batch.
  lockedBatchName?: string;
}

const emptyFormData: StudentFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  gender: "male",
  dateOfBirth: "",
  guardianName: "",
  guardianPhone: "",
  address: "",
  batchId: "",
  school: "",
  status: "active",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormErrors = Partial<Record<keyof StudentFormData, string>>;

const OPTIONAL_FIELD_KEYS: (keyof StudentFormData)[] = ["email"];

export default function StudentForm({
  batches,
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
  isSubmitting = false,
  showSaveAndAddAnother = false,
  autoFocusFirstName = false,
  lockedBatchName,
}: StudentFormProps) {
  const [formData, setFormData] = useState<StudentFormData>({
    ...emptyFormData,
    ...initialValues,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  // Most of this form is optional now — collapsed by default so the only
  // thing a teacher has to look at up front is what's actually required.
  // Editing an existing student that already has any of these optional
  // details filled in opens it expanded; a brand-new student (even one
  // seeded with just a preselected batch, e.g. from AddStudentDialog)
  // starts collapsed.
  const [showMoreDetails, setShowMoreDetails] = useState(
    Boolean(
      initialValues?.email ||
        initialValues?.phone ||
        initialValues?.dateOfBirth ||
        initialValues?.guardianName ||
        initialValues?.guardianPhone ||
        initialValues?.address ||
        initialValues?.school,
    ),
  );

  function updateField<K extends keyof StudentFormData>(
    key: K,
    value: StudentFormData[K]
  ) {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function validate(): boolean {
    const nextErrors: FormErrors = {};

    if (!formData.firstName.trim())
      nextErrors.firstName = "First name is required.";
    if (!formData.lastName.trim())
      nextErrors.lastName = "Last name is required.";
    if (!formData.batchId) nextErrors.batchId = "Select a batch.";

    // Email isn't required, but if one's provided it should be valid.
    if (formData.email.trim() && !emailPattern.test(formData.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    setErrors(nextErrors);

    // If an error landed in the collapsed optional section, expand it so
    // the teacher can actually see and fix it.
    if (OPTIONAL_FIELD_KEYS.some((key) => nextErrors[key])) {
      setShowMoreDetails(true);
    }

    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData, "save");
  }

  function handleSaveAndAddAnother() {
    if (!validate()) return;
    onSubmit(formData, "save-and-add-another");
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
            title="Essentials"
            description="Everything needed to add this student — the rest can be filled in later."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  autoComplete="given-name"
                  autoFocus={autoFocusFirstName}
                  value={formData.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  aria-invalid={Boolean(errors.firstName)}
                  className="h-11 rounded-xl"
                />
                {errors.firstName && (
                  <p className="text-xs text-destructive">
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  autoComplete="family-name"
                  value={formData.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  aria-invalid={Boolean(errors.lastName)}
                  className="h-11 rounded-xl"
                />
                {errors.lastName && (
                  <p className="text-xs text-destructive">
                    {errors.lastName}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="batchId">
                  {lockedBatchName ? "Batch" : "Batch *"}
                </Label>
                {lockedBatchName ? (
                  <Input
                    id="batchId"
                    value={lockedBatchName}
                    disabled
                    className="h-11 w-full rounded-xl sm:max-w-sm"
                  />
                ) : (
                  <Select
                    value={formData.batchId}
                    onValueChange={(value) => updateField("batchId", value)}
                  >
                    <SelectTrigger
                      id="batchId"
                      className="h-11 w-full rounded-xl sm:max-w-sm"
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
                )}
                {errors.batchId && (
                  <p className="text-xs text-destructive">
                    {errors.batchId}
                  </p>
                )}
              </div>
            </div>
          </FormSection>

          <div className="flex flex-col gap-5">
            <button
              type="button"
              onClick={() => setShowMoreDetails((prev) => !prev)}
              aria-expanded={showMoreDetails}
              className="flex items-center gap-2 self-start text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  showMoreDetails && "rotate-180",
                )}
                aria-hidden="true"
              />
              {showMoreDetails
                ? "Hide additional details"
                : "Add more details (optional)"}
            </button>

            {showMoreDetails && (
              <div className="flex flex-col gap-6">
                <FormSection
                  title="Personal Information"
                  description="Optional — basic details about the student."
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) =>
                          updateField("gender", value as Gender)
                        }
                      >
                        <SelectTrigger id="gender" className="h-11 rounded-xl">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) =>
                          updateField("dateOfBirth", e.target.value)
                        }
                        className="h-11 rounded-xl"
                      />
                    </div>
                  </div>
                </FormSection>

                <FormSection
                  title="Contact Information"
                  description="Optional — how to reach the student."
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="student@example.com"
                        autoComplete="email"
                        value={formData.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        aria-invalid={Boolean(errors.email)}
                        className="h-11 rounded-xl"
                      />
                      {errors.email && (
                        <p className="text-xs text-destructive">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="phone">Student Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="9876543210"
                        autoComplete="tel"
                        value={formData.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        className="h-11 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      placeholder="Street, city, and postal code"
                      autoComplete="street-address"
                      value={formData.address}
                      onChange={(e) => updateField("address", e.target.value)}
                      rows={3}
                      className="rounded-xl"
                    />
                  </div>
                </FormSection>

                <FormSection
                  title="Guardian Information"
                  description="Optional — primary guardian contact for this student."
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="guardianName">Guardian Name</Label>
                      <Input
                        id="guardianName"
                        autoComplete="name"
                        value={formData.guardianName}
                        onChange={(e) =>
                          updateField("guardianName", e.target.value)
                        }
                        className="h-11 rounded-xl"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="guardianPhone">Guardian Phone</Label>
                      <Input
                        id="guardianPhone"
                        type="tel"
                        placeholder="9876500000"
                        autoComplete="tel"
                        value={formData.guardianPhone}
                        onChange={(e) =>
                          updateField("guardianPhone", e.target.value)
                        }
                        className="h-11 rounded-xl"
                      />
                    </div>
                  </div>
                </FormSection>

                <FormSection
                  title="Academic Information"
                  description="Optional — school and enrollment status."
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="school">School</Label>
                      <Input
                        id="school"
                        placeholder="e.g. Delhi Public School"
                        autoComplete="organization"
                        value={formData.school}
                        onChange={(e) =>
                          updateField("school", e.target.value)
                        }
                        className="h-11 rounded-xl"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) =>
                          updateField("status", value as StudentStatus)
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
              </div>
            )}
          </div>

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
            {showSaveAndAddAnother && (
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl sm:w-auto"
                onClick={handleSaveAndAddAnother}
                disabled={isSubmitting}
              >
                Save & Add Another
              </Button>
            )}
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
