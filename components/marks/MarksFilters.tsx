"use client";

import { RotateCcw } from "lucide-react";
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

interface MarksFiltersProps {
  searchTerm: string;
  selectedBatch: string;
  selectedSubject: string;
  selectedDate: string;
  batches: Batch[];
  subjects: string[];
  onSearchChange: (value: string) => void;
  onBatchChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onReset: () => void;
}

export default function MarksFilters({
  searchTerm,
  selectedBatch,
  selectedSubject,
  selectedDate,
  batches,
  subjects,
  onSearchChange,
  onBatchChange,
  onSubjectChange,
  onDateChange,
  onReset,
}: MarksFiltersProps) {
  return (
    <FilterBar
      search={
        <SearchBar
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Search tests, students or batches..."
        />
      }
    >
      <FilterField label="Batch" htmlFor="marks-batch-filter">
        <Select value={selectedBatch} onValueChange={onBatchChange}>
          <SelectTrigger
            id="marks-batch-filter"
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

      <FilterField label="Subject" htmlFor="marks-subject-filter">
        <Select value={selectedSubject} onValueChange={onSubjectChange}>
          <SelectTrigger
            id="marks-subject-filter"
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

      <FilterField label="Date" htmlFor="marks-date-filter">
        <Input
          id="marks-date-filter"
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="h-11 w-full rounded-xl sm:w-[170px]"
        />
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
