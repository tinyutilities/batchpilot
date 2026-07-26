"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import StudentForm from "@/components/students/StudentForm";
import { createStudent } from "@/server/students/actions";
import type { StudentFormData } from "@/types/student";
import type { StudentFormSubmitIntent } from "@/components/students/StudentForm";
import type { Batch } from "@/types/batch";
import type { Student } from "@/types/student";

export interface AddStudentDialogConfig {
  defaultBatchId?: string;
  lockBatch?: boolean;
}

interface AddStudentDialogProps {
  config: AddStudentDialogConfig | null;
  batches: Batch[];
  onOpenChange: (open: boolean) => void;
  onCreated: (student: Student) => void;
}

export default function AddStudentDialog({
  config,
  batches,
  onOpenChange,
  onCreated,
}: AddStudentDialogProps) {
  const [formKey, setFormKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastBatchId, setLastBatchId] = useState<string | undefined>(undefined);

  const batchId = lastBatchId ?? config?.defaultBatchId;
  const lockedBatch = config?.lockBatch
    ? batches.find((batch) => batch.id === batchId)
    : undefined;

  async function handleSubmit(
    data: StudentFormData,
    intent: StudentFormSubmitIntent,
  ) {
    setIsSubmitting(true);
    const student = await createStudent(data);
    onCreated(student);

    if (intent === "save") {
      toast.success("Student added successfully.");
      onOpenChange(false);
    } else {
      toast.success(`${student.fullName} was added. Add another below.`);
      setLastBatchId(data.batchId);
      setFormKey((key) => key + 1);
    }
    setIsSubmitting(false);
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      setLastBatchId(undefined);
      setFormKey((key) => key + 1);
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={config !== null} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Student</DialogTitle>
          <DialogDescription>
            {lockedBatch
              ? `New student for ${lockedBatch.name}.`
              : "Register a new student into a tuition batch."}
          </DialogDescription>
        </DialogHeader>
        {config && (
          <StudentForm
            key={formKey}
            batches={batches}
            initialValues={{ batchId }}
            lockedBatchName={lockedBatch?.name}
            submitLabel="Save"
            showSaveAndAddAnother
            autoFocusFirstName
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onCancel={() => handleOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
