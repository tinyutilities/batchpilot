"use client";

import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import SearchBar from "@/components/shared/SearchBar";
import { FilterBar, FilterField } from "@/components/shared/FilterBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Batch } from "@/types/batch";

interface AttendanceFiltersProps {
  searchTerm: string;
  selectedBatch: string;
  selectedStatus: string;
  selectedDate: string;
  batches: Batch[];
  onSearchChange: (value: string) => void;
  onBatchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onReset: () => void;
  onDatePrev?: () => void;
  onDateNext?: () => void;
}

const statusOptions = [
  { value: "all", label: "All" },
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "late", label: "Late" },
  { value: "excused", label: "Excused" },
];

export default function AttendanceFilters({
  searchTerm,
  selectedBatch,
  selectedStatus,
  selectedDate,
  batches,
  onSearchChange,
  onBatchChange,
  onStatusChange,
  onDateChange,
  onReset,
  onDatePrev,
  onDateNext,
}: AttendanceFiltersProps) {
  return (
    <FilterBar
      search={
        <SearchBar
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Search students or batches..."
        />
      }
    >
      <FilterField label="Batch" htmlFor="attendance-batch-filter">
        <Select value={selectedBatch} onValueChange={onBatchChange}>
          <SelectTrigger
            id="attendance-batch-filter"
            className="h-11 w-full rounded-xl sm:w-[160px]"
          >
            <SelectValue placeholder="All Batches" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Batches</SelectItem>
            {batches.map((batch) => (
              <SelectItem key={batch.id} value={batch.id}>
                {batch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>

      <FilterField label="Date" htmlFor="attendance-date-filter">
        <div className="flex items-center gap-1">
          {onDatePrev && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-11 w-11 shrink-0 rounded-xl"
              onClick={onDatePrev}
              disabled={!selectedDate}
              aria-label="Previous day"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
          <Input
            id="attendance-date-filter"
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="h-11 w-full rounded-xl sm:w-[170px]"
          />
          {onDateNext && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-11 w-11 shrink-0 rounded-xl"
              onClick={onDateNext}
              disabled={!selectedDate}
              aria-label="Next day"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </FilterField>

      <FilterField label="Status" htmlFor="attendance-status-filter">
        <Select value={selectedStatus} onValueChange={onStatusChange}>
          <SelectTrigger
            id="attendance-status-filter"
            className="h-11 w-full rounded-xl sm:w-[140px]"
          >
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>

      <Button
        type="button"
        variant="outline"
        onClick={onReset}
        className="h-11 gap-2 rounded-xl"
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        Reset Filters
      </Button>
    </FilterBar>
  );
}
