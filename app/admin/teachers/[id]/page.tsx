"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  Ban,
  CheckCircle2,
  Layers,
  Mail,
  Phone,
  UserX,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { getBatchesForTeacher, getTeacherById } from "@/lib/mock/admin";
import { getStudentsByBatch } from "@/lib/mock/batch";
import type { AdminTeacher } from "@/types/admin";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "T";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

export default function AdminTeacherDetailPage() {
  const params = useParams<{ id: string }>();
  const teacherId = params.id;

  const [teacher, setTeacher] = useState<AdminTeacher | undefined>(() =>
    getTeacherById(teacherId),
  );

  const batches = useMemo(
    () => (teacher ? getBatchesForTeacher(teacher.name) : []),
    [teacher],
  );

  if (!teacher) {
    return (
      <PageContainer className="gap-6">
        <PageHeader
          title="Teacher not found"
          description="This teacher account may have been removed."
        />
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card px-6 py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <UserX
              className="h-6 w-6 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
          <p className="text-sm font-medium text-foreground">
            Teacher not found
          </p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Go back to the teacher list to continue.
          </p>
          <Button asChild className="mt-2 h-11 rounded-xl">
            <Link href="/admin/teachers">Back to Teachers</Link>
          </Button>
        </div>
      </PageContainer>
    );
  }

  function handleToggleStatus() {
    if (!teacher) return;
    const nextStatus = teacher.status === "active" ? "suspended" : "active";
    setTeacher({ ...teacher, status: nextStatus });
    toast.success(
      nextStatus === "active"
        ? `${teacher.name} was reactivated.`
        : `${teacher.name} was suspended.`,
    );
  }

  return (
    <PageContainer className="gap-6">
      <PageHeader
        title={teacher.name}
        description="Teacher account and workspace overview."
        action={
          <Button
            variant={teacher.status === "active" ? "destructive" : "default"}
            className="h-11 rounded-xl"
            onClick={handleToggleStatus}
          >
            {teacher.status === "active" ? (
              <>
                <Ban className="mr-2 h-4 w-4" />
                Suspend
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Reactivate
              </>
            )}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-1">
          <DashboardCard title="Teacher Information">
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-primary-soft text-base font-medium text-primary">
                    {getInitials(teacher.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-foreground">
                    {teacher.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    @{teacher.username}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex flex-col gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                  {teacher.email}
                </div>
                {teacher.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                    {teacher.phone}
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                {teacher.status === "active" ? (
                  <Badge className="rounded-full bg-success-soft text-success hover:bg-success-soft">
                    Active
                  </Badge>
                ) : (
                  <Badge className="rounded-full bg-danger-soft text-destructive hover:bg-danger-soft">
                    Suspended
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Joined</span>
                <span className="font-medium text-foreground">
                  {format(new Date(teacher.createdAt), "d MMM yyyy")}
                </span>
              </div>
            </div>
          </DashboardCard>

          <div className="grid grid-cols-2 gap-4">
            <StatCard
              title="Batches"
              value={teacher.batchCount}
              icon={<Layers className="h-5 w-5" />}
              color="indigo"
            />
            <StatCard
              title="Students"
              value={teacher.studentCount}
              icon={<Users className="h-5 w-5" />}
              color="blue"
            />
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-2">
          <DashboardCard
            title="Batches"
            description={`${batches.length} batch${batches.length === 1 ? "" : "es"} taught by this teacher`}
          >
            {batches.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                This teacher hasn&apos;t created any batches yet.
              </p>
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {batches.map((batch) => (
                  <Link
                    key={batch.id}
                    href={`/dashboard/batches/${batch.id}`}
                    className="flex items-center justify-between gap-3 py-3 hover:underline"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">
                        {batch.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {batch.subject}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {getStudentsByBatch(batch.id).length} students
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </DashboardCard>
        </div>
      </div>
    </PageContainer>
  );
}
