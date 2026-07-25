import { Mail, MapPin, Phone, School, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import type { Student } from "@/types/student";

interface StudentCardProps {
  student: Student;
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export default function StudentCard({ student }: StudentCardProps) {
  return (
    <DashboardCard title="Student Information">
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-indigo-100 text-base font-medium text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              {getInitials(student.firstName, student.lastName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-sm font-semibold text-foreground">
              {student.fullName}
            </p>
            {student.school && (
              <p className="text-xs text-muted-foreground">
                {student.school}
              </p>
            )}
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="text-foreground">{student.batchName}</span>
          </div>
          {student.school && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <School className="h-4 w-4 shrink-0 text-slate-400" />
              {student.school}
            </div>
          )}
          {student.guardianName && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4 shrink-0 text-slate-400" />
              Guardian: {student.guardianName}
            </div>
          )}
          {student.guardianPhone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4 shrink-0 text-slate-400" />
              {student.guardianPhone}
            </div>
          )}
          {student.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4 shrink-0 text-slate-400" />
              {student.phone}
            </div>
          )}
          {student.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4 shrink-0 text-slate-400" />
              {student.email}
            </div>
          )}
          {student.address && (
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              {student.address}
            </div>
          )}
          {!student.school &&
            !student.guardianName &&
            !student.guardianPhone &&
            !student.phone &&
            !student.email &&
            !student.address && (
              <p className="text-muted-foreground">
                No additional details added yet.
              </p>
            )}
        </div>
      </div>
    </DashboardCard>
  );
}
