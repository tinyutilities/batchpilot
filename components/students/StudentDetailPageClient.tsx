"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  Archive,
  ArchiveRestore,
  CalendarCheck,
  Pencil,
  Trash2,
  UserX,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import StudentCard from "@/components/students/StudentCard";
import StudentDeleteDialog from "@/components/students/StudentDeleteDialog";
import AttendanceCalendar from "@/components/attendance/AttendanceCalendar";
import AttendanceStatusBadge from "@/components/attendance/AttendanceStatusBadge";
import PaymentStatusBadge from "@/components/fees/PaymentStatusBadge";
import PaymentDialog from "@/components/fees/PaymentDialog";
import GradeBadge from "@/components/marks/GradeBadge";
import PerformanceChart from "@/components/shared/PerformanceChart";
import { archiveStudent, deleteStudent, unarchiveStudent } from "@/server/students/actions";
import { getOrCreateFeeForMonth, recordPayment } from "@/server/fees/actions";
import { formatPaymentMethod, monthLabel } from "@/lib/calculations/fees";
import type { AttendanceRecord, StudentAttendanceSummary } from "@/types/attendance";
import type { FeeRecord, PaymentInput, StudentFeeSummary } from "@/types/fees";
import type { StudentMarkSummary } from "@/types/marks";
import type { Student } from "@/types/student";

interface StudentDetailPageClientProps {
  studentId: string;
  student: Student | null;
  attendanceRecords: AttendanceRecord[];
  attendanceSummary: StudentAttendanceSummary;
  feeSummary: StudentFeeSummary;
  marksSummary: StudentMarkSummary;
}

export default function StudentDetailPageClient({
  studentId,
  student,
  attendanceRecords,
  attendanceSummary,
  feeSummary,
  marksSummary,
}: StudentDetailPageClientProps) {
  const router = useRouter();

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [paymentFee, setPaymentFee] = useState<FeeRecord | null>(null);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  if (!student) {
    return (
      <PageContainer className="gap-6">
        <PageHeader
          title="Student not found"
          description="This student may have been removed."
        />
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card px-6 py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <UserX
              className="h-6 w-6 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
          <p className="text-sm font-medium text-foreground">
            Student not found
          </p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Go back to the student list to continue.
          </p>
          <Button asChild className="mt-2 h-11 rounded-xl">
            <Link href="/dashboard/students">Back to Students</Link>
          </Button>
        </div>
      </PageContainer>
    );
  }

  async function handleConfirmDelete() {
    if (!student) return;
    await deleteStudent(student.id);
    setIsDeleteOpen(false);
    toast.success(`${student.fullName} was removed from your students.`);
    router.push("/dashboard/students");
  }

  async function handleArchive() {
    if (!student) return;
    const ok = await archiveStudent(student.id);
    if (ok) {
      toast.success(
        `${student.fullName} was archived. Their history is kept, and they're hidden from the active list.`,
      );
      router.refresh();
    } else {
      toast.error("Couldn't archive that student. Please try again.");
    }
  }

  async function handleUnarchive() {
    if (!student) return;
    const ok = await unarchiveStudent(student.id);
    if (ok) {
      toast.success(`${student.fullName} was restored to Active.`);
      router.refresh();
    } else {
      toast.error("Couldn't unarchive that student. Please try again.");
    }
  }

  async function handleOpenPayment() {
    const fee = await getOrCreateFeeForMonth(studentId);
    if (!fee) {
      toast.error("This student isn't assigned to a batch, so no fee can be billed.");
      return;
    }
    setPaymentFee(fee);
  }

  async function handleSubmitPayment(input: PaymentInput) {
    if (!paymentFee) return;
    setIsSubmittingPayment(true);
    const payment = await recordPayment(paymentFee.id, input);
    if (payment) {
      toast.success(`₹${input.amount.toLocaleString("en-IN")} payment recorded.`);
      router.refresh();
    }
    setPaymentFee(null);
    setIsSubmittingPayment(false);
  }

  return (
    <PageContainer className="gap-6">
      <PageHeader
        title={student.fullName}
        description="Student profile and academic overview."
        action={
          <div className="flex items-center gap-2">
            <Button asChild className="h-11 rounded-xl">
              <Link href={`/dashboard/students/${student.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Student
              </Link>
            </Button>
            {student.status === "archived" ? (
              <Button
                variant="outline"
                className="h-11 rounded-xl"
                onClick={handleUnarchive}
              >
                <ArchiveRestore className="mr-2 h-4 w-4" />
                Unarchive
              </Button>
            ) : (
              <Button
                variant="outline"
                className="h-11 rounded-xl"
                onClick={handleArchive}
              >
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </Button>
            )}
            <Button
              variant="destructive"
              className="h-11 rounded-xl"
              onClick={() => setIsDeleteOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-1">
          <StudentCard student={student} />

          <div className="grid grid-cols-2 gap-4">
            <StatCard
              title="Attendance"
              value={`${student.attendancePercentage}%`}
              icon={<CalendarCheck className="h-5 w-5" />}
              color={student.attendancePercentage >= 75 ? "green" : "rose"}
            />
            <StatCard
              title="Pending Fees"
              value={`₹${student.pendingFees.toLocaleString("en-IN")}`}
              icon={<Wallet className="h-5 w-5" />}
              color={student.pendingFees === 0 ? "green" : "amber"}
            />
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-2">
          <DashboardCard
            title="Enrollment Overview"
            description="Academic and enrollment details"
          >
            <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-medium text-muted-foreground">
                  Status
                </dt>
                <dd>
                  {student.status === "active" ? (
                    <Badge className="rounded-full bg-success-soft text-success hover:bg-success-soft">
                      Active
                    </Badge>
                  ) : student.status === "archived" ? (
                    <Badge className="rounded-full bg-muted text-muted-foreground hover:bg-muted">
                      Archived
                    </Badge>
                  ) : (
                    <Badge className="rounded-full bg-muted text-muted-foreground hover:bg-muted">
                      Inactive
                    </Badge>
                  )}
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-medium text-muted-foreground">
                  Batch
                </dt>
                <dd className="text-sm font-medium text-foreground">
                  {student.batchName}
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-medium text-muted-foreground">
                  Gender
                </dt>
                <dd className="text-sm font-medium capitalize text-foreground">
                  {student.gender}
                </dd>
              </div>
              {student.dateOfBirth && (
                <div className="flex flex-col gap-1">
                  <dt className="text-xs font-medium text-muted-foreground">
                    Date of Birth
                  </dt>
                  <dd className="text-sm font-medium text-foreground">
                    {format(new Date(student.dateOfBirth), "d MMM yyyy")}
                  </dd>
                </div>
              )}
              {student.school && (
                <div className="flex flex-col gap-1">
                  <dt className="text-xs font-medium text-muted-foreground">
                    School
                  </dt>
                  <dd className="text-sm font-medium text-foreground">
                    {student.school}
                  </dd>
                </div>
              )}
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-medium text-muted-foreground">
                  Enrolled Since
                </dt>
                <dd className="text-sm font-medium text-foreground">
                  {format(new Date(student.createdAt), "d MMM yyyy")}
                </dd>
              </div>
            </dl>
          </DashboardCard>

          {student.notes && (
            <DashboardCard
              title="Notes"
              description="Private — only visible to you"
            >
              <p className="whitespace-pre-wrap text-sm text-foreground">
                {student.notes}
              </p>
            </DashboardCard>
          )}

          <DashboardCard
            title="Attendance History"
            description={`${attendanceSummary.totalRecords} recorded session${
              attendanceSummary.totalRecords === 1 ? "" : "s"
            } · ${attendanceSummary.attendancePercentage}% attendance`}
          >
            <div className="flex flex-col gap-6">
              <AttendanceCalendar records={attendanceRecords} />

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span>{attendanceSummary.presentCount} present</span>
                <span>{attendanceSummary.absentCount} absent</span>
                <span>{attendanceSummary.lateCount} late</span>
                <span>{attendanceSummary.excusedCount} excused</span>
              </div>

              {attendanceRecords.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No attendance has been recorded for this student yet.
                </p>
              ) : (
                <div className="flex flex-col divide-y divide-border">
                  {attendanceRecords.slice(0, 6).map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between py-3"
                    >
                      <span className="text-sm text-foreground">
                        {format(new Date(record.date), "d MMM yyyy")}
                      </span>
                      <AttendanceStatusBadge status={record.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DashboardCard>

          <DashboardCard
            title="Fee History"
            description={`₹${feeSummary.pendingBalance.toLocaleString(
              "en-IN"
            )} pending`}
            action={
              <Button
                type="button"
                size="sm"
                className="rounded-xl"
                onClick={handleOpenPayment}
                disabled={feeSummary.pendingBalance <= 0}
              >
                Record Payment
              </Button>
            }
          >
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span>
                  Billed: ₹{feeSummary.totalBilled.toLocaleString("en-IN")}
                </span>
                <span>
                  Paid: ₹{feeSummary.totalPaid.toLocaleString("en-IN")}
                </span>
                <span>
                  Overdue: ₹{feeSummary.overdueAmount.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Fees by Month
                </p>
                {feeSummary.fees.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No fees have been billed for this student yet.
                  </p>
                ) : (
                  <div className="flex flex-col divide-y divide-border">
                    {feeSummary.fees.map((fee) => (
                      <div
                        key={fee.id}
                        className="flex items-center justify-between py-3"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">
                            {monthLabel(fee.month)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Due {format(new Date(fee.dueDate), "d MMM yyyy")}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">
                            ₹{fee.amountPaid.toLocaleString("en-IN")} / ₹
                            {fee.amount.toLocaleString("en-IN")}
                          </span>
                          <PaymentStatusBadge status={fee.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Recent Payments
                </p>
                {feeSummary.payments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No payments have been recorded for this student yet.
                  </p>
                ) : (
                  <div className="flex flex-col divide-y divide-border">
                    {feeSummary.payments.slice(0, 5).map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between py-3 text-sm"
                      >
                        <span className="text-foreground">
                          {format(new Date(payment.date), "d MMM yyyy")}
                        </span>
                        <span className="text-muted-foreground">
                          {formatPaymentMethod(payment.method)}
                        </span>
                        <span className="font-medium text-foreground">
                          ₹{payment.amount.toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </DashboardCard>

          <DashboardCard
            title="Marks"
            description={`${marksSummary.testsCount} test${
              marksSummary.testsCount === 1 ? "" : "s"
            } · ${marksSummary.overallPercentage}% overall`}
          >
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span>Overall: {marksSummary.overallPercentage}%</span>
                <span>
                  Trend:{" "}
                  {marksSummary.trend === "up"
                    ? "Improving"
                    : marksSummary.trend === "down"
                      ? "Declining"
                      : "Steady"}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Subject Averages
                </p>
                <PerformanceChart
                  data={marksSummary.subjectAverages.map((s) => ({
                    label: s.subject,
                    percentage: s.averagePercentage,
                  }))}
                />
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Recent Tests
                </p>
                {marksSummary.records.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No marks have been recorded for this student yet.
                  </p>
                ) : (
                  <div className="flex flex-col divide-y divide-border">
                    {marksSummary.records.slice(0, 6).map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between py-3"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">
                            {record.test.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {record.test.subject} ·{" "}
                            {format(new Date(record.test.testDate), "d MMM yyyy")}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">
                            {record.marksObtained} / {record.test.maxMarks}
                          </span>
                          <GradeBadge grade={record.grade} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>

      <StudentDeleteDialog
        student={isDeleteOpen ? student : null}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleConfirmDelete}
      />

      <PaymentDialog
        fee={paymentFee}
        studentName={student.fullName}
        isSubmitting={isSubmittingPayment}
        onOpenChange={(open) => {
          if (!open) setPaymentFee(null);
        }}
        onSubmit={handleSubmitPayment}
      />
    </PageContainer>
  );
}
