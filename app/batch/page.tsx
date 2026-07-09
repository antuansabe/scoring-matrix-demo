import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FEATURES } from "@/lib/flags";
import { BatchView } from "@/components/BatchView";

export const metadata: Metadata = {
  title: "Batch Analysis — Changemaker Worldview Scoring Matrix",
  description: "Process multiple texts and download consolidated results.",
};

export default function BatchPage() {
  if (!FEATURES.batch) notFound();
  return <BatchView />;
}
