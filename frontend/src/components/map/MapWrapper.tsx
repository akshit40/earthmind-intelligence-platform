"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { SatelliteTelemetry } from "@/lib/types";

const EarthMap = dynamic(() => import("./EarthMap"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-lg" />,
});

export function MapWrapper({ liveSatellite, targetCoordinate, scanId }: { liveSatellite?: SatelliteTelemetry | null, targetCoordinate?: [number, number] | null, scanId?: string | null }) {
  return <EarthMap liveSatellite={liveSatellite} targetCoordinate={targetCoordinate} scanId={scanId} />;
}
