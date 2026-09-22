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

interface BatchFiltersProps {
  searchTerm: string;
  selectedSubject: string;
  selectedStatus: string;
  selectedSort: string;
  subjects: string[];
  onSearchChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onReset: () => void;
}

const statusOptions = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "archived", label: "Archived" },
];

const sortOptions = [
  { value: "name-asc", label: "Name A-Z" },
  { value: "name-desc", label: "Name Z-A" },
  { value: "enrolled-desc", label: "Most Enrolled" },
  { value: "enrolled-asc", label: "Least Enrolled" },
  { value: "capacity-desc", label: "Highest Capacity" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
];

export default function BatchFilters({
  searchTerm,
  selectedSubject,
  selectedStatus,
  selectedSort,
  subjects,
  onSearchChange,
  onSubjectChange,
  onStatusChange,
  onSortChange,
  onReset,
}: BatchFiltersProps) {
  return (
    <FilterBar
      search={
        <SearchBar
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Search batches..."
        />
      }
    >
      <FilterField label="Subject" htmlFor="subject-filter">
        <Select value={selectedSubject} onValueChange={onSubjectChange}>
          <SelectTrigger
            id="subject-filter"
            className="h-11 w-full rounded-xl sm:w-[160px]"
          >
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject} value={subject}>
                {subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>

      <FilterField label="Status" htmlFor="batch-status-filter">
        <Select value={selectedStatus} onValueChange={onStatusChange}>
          <SelectTrigger
            id="batch-status-filter"
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

      <FilterField label="Sort" htmlFor="batch-sort-filter">
        <Select value={selectedSort} onValueChange={onSortChange}>
          <SelectTrigger
            id="batch-sort-filter"
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
