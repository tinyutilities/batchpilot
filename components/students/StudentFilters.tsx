"use client";

import { RotateCcw } from "lucide-react";
import SearchBar from "@/components/shared/SearchBar";
import { FilterBar, FilterField } from "@/components/shared/FilterBar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Batch } from "@/types/batch";

interface StudentFiltersProps {
  searchTerm: string;
  selectedBatch: string;
  selectedStatus: string;
  selectedSort: string;
  batches: Batch[];
  onSearchChange: (value: string) => void;
  onBatchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onReset: () => void;
}

const statusOptions = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const sortOptions = [
  { value: "name-asc", label: "Name A-Z" },
  { value: "name-desc", label: "Name Z-A" },
  { value: "attendance-desc", label: "Highest Attendance" },
  { value: "attendance-asc", label: "Lowest Attendance" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
];

export default function StudentFilters({
  searchTerm,
  selectedBatch,
  selectedStatus,
  selectedSort,
  batches,
  onSearchChange,
  onBatchChange,
  onStatusChange,
  onSortChange,
  onReset,
}: StudentFiltersProps) {
  return (
    <FilterBar
      search={
        <SearchBar
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Search students..."
        />
      }
    >
      <FilterField label="Batch" htmlFor="batch-filter">
        <Select value={selectedBatch} onValueChange={onBatchChange}>
          <SelectTrigger
            id="batch-filter"
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

      <FilterField label="Status" htmlFor="status-filter">
        <Select value={selectedStatus} onValueChange={onStatusChange}>
          <SelectTrigger
            id="status-filter"
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

      <FilterField label="Sort" htmlFor="sort-filter">
        <Select value={selectedSort} onValueChange={onSortChange}>
          <SelectTrigger
            id="sort-filter"
            className="h-11 w-full rounded-xl sm:w-[180px]"
          >
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
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
