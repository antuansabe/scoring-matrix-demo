import type { Metadata } from "next";
import { BatchView } from "@/components/BatchView";

export const metadata: Metadata = {
  title: "Batch Analysis — Changemaker Worldview Scoring Matrix",
  description: "Process multiple texts and download consolidated results.",
};

export default function BatchPage() {
  return <BatchView />;
}
