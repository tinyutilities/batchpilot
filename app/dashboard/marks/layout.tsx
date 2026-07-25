import type { Metadata } from "next";

export const metadata: Metadata = { title: "Marks" };

export default function MarksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
