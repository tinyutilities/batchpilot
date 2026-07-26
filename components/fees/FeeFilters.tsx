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
import { monthLabel } from "@/lib/calculations/fees";
import type { Batch } from "@/types/batch";

interface FeeFiltersProps {
  searchTerm: string;
  selectedBatch: string;
  selectedStatus: string;
  selectedMonth: string;
  selectedSort: string;
  batches: Batch[];
  months: string[];
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onBatchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onMonthChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onReset: () => void;
}

const statusOptions = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "partial", label: "Partial" },
  { value: "pending", label: "Pending" },
  { value: "overdue", label: "Overdue" },
];

const sortOptions = [
  { value: "dueDate-desc", label: "Due Date: Newest" },
  { value: "dueDate-asc", label: "Due Date: Oldest" },
  { value: "amount-desc", label: "Highest Amount" },
  { value: "balance-desc", label: "Highest Balance" },
  { value: "name-asc", label: "Name A-Z" },
];

export default function FeeFilters({
  searchTerm,
  selectedBatch,
  selectedStatus,
  selectedMonth,
  selectedSort,
  batches,
  months,
  hasActiveFilters,
  onSearchChange,
  onBatchChange,
  onStatusChange,
  onMonthChange,
  onSortChange,
  onReset,
}: FeeFiltersProps) {
  return (
    <FilterBar
      search={
        <SearchBar
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Search fees..."
        />
      }
    >
      <FilterField label="Batch" htmlFor="fee-batch-filter">
        <Select value={selectedBatch} onValueChange={onBatchChange}>
          <SelectTrigger
            id="fee-batch-filter"
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

      <FilterField label="Month" htmlFor="fee-month-filter">
        <Select value={selectedMonth} onValueChange={onMonthChange}>
          <SelectTrigger
            id="fee-month-filter"
            className="h-11 w-full rounded-xl sm:w-[180px]"
          >
            <SelectValue placeholder="All Months" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Months</SelectItem>
            {months.map((month) => (
              <SelectItem key={month} value={month}>
                {monthLabel(month)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>

      <FilterField label="Status" htmlFor="fee-status-filter">
        <Select value={selectedStatus} onValueChange={onStatusChange}>
          <SelectTrigger
            id="fee-status-filter"
            className="h-11 w-full rounded-xl sm:w-[150px]"
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

      <FilterField label="Sort" htmlFor="fee-sort-filter">
        <Select value={selectedSort} onValueChange={onSortChange}>
          <SelectTrigger
            id="fee-sort-filter"
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
        disabled={!hasActiveFilters}
        className="h-11 gap-2 rounded-xl"
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        Reset Filters
      </Button>
    </FilterBar>
  );
}
