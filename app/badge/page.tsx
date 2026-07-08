import { notFound } from "next/navigation";
import { FEATURES } from "@/lib/flags";
import { DensityBadgeView } from "@/components/DensityBadgeView";

export default function BadgePage() {
  if (!FEATURES.badge) notFound();
  return <DensityBadgeView />;
}
