"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { MoreHorizontal, Eye, Ban, CheckCircle2, Users } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/layout/empty-state";
import SearchBar from "@/components/shared/SearchBar";
import { mockTeachers } from "@/lib/mock/admin";
import type { AdminTeacher } from "@/types/admin";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "T";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

function StatusBadge({ status }: { status: AdminTeacher["status"] }) {
  if (status === "active") {
    return (
      <Badge className="rounded-full bg-success-soft text-success hover:bg-success-soft">
        Active
      </Badge>
    );
  }
  return (
    <Badge className="rounded-full bg-danger-soft text-destructive hover:bg-danger-soft">
      Suspended
    </Badge>
  );
}

export default function AdminTeachersPage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<AdminTeacher[]>(mockTeachers);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTeachers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return teachers;
    return teachers.filter(
      (teacher) =>
        teacher.name.toLowerCase().includes(query) ||
        teacher.username.toLowerCase().includes(query) ||
        teacher.email.toLowerCase().includes(query),
    );
  }, [teachers, searchTerm]);

  function handleToggleStatus(teacher: AdminTeacher) {
    const nextStatus = teacher.status === "active" ? "suspended" : "active";
    setTeachers((prev) =>
      prev.map((t) => (t.id === teacher.id ? { ...t, status: nextStatus } : t)),
    );
    toast.success(
      nextStatus === "active"
        ? `${teacher.name} was reactivated.`
        : `${teacher.name} was suspended.`,
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Teachers"
        description="Every teacher registered on BatchPilot."
      />

      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search by name, username or email..."
      />

      {filteredTeachers.length === 0 ? (
        <EmptyState
          icon={<Users className="h-7 w-7" aria-hidden="true" />}
          title={
            teachers.length === 0
              ? "No teachers yet"
              : "No teachers match your search"
          }
          description={
            teachers.length === 0
              ? "Teachers will appear here once they sign up for BatchPilot."
              : "Try a different name, username or email."
          }
        />
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeachers.map((teacher) => (
                <TableRow
                  key={teacher.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/admin/teachers/${teacher.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary-soft text-primary">
                          {getInitials(teacher.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-foreground">
                        {teacher.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    @{teacher.username}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {teacher.email}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(teacher.createdAt), "d MMM yyyy")}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={teacher.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          aria-label={`Actions for ${teacher.name}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <MoreHorizontal
                            className="h-4 w-4"
                            aria-hidden="true"
                          />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/admin/teachers/${teacher.id}`)
                          }
                        >
                          <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(teacher)}
                          className={
                            teacher.status === "active"
                              ? "text-destructive focus:text-destructive"
                              : undefined
                          }
                        >
                          {teacher.status === "active" ? (
                            <>
                              <Ban
                                className="mr-2 h-4 w-4"
                                aria-hidden="true"
                              />
                              Suspend
                            </>
                          ) : (
                            <>
                              <CheckCircle2
                                className="mr-2 h-4 w-4"
                                aria-hidden="true"
                              />
                              Reactivate
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </PageContainer>
  );
}
