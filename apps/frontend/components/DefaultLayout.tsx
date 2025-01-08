"use client";

import React, { ReactNode } from "react";
import dynamic from "next/dynamic";

const DynamicLaserEyesProvider = dynamic(
  () => import("@omnisat/lasereyes").then((mod) => mod.LaserEyesProvider),
  { ssr: false }
);

export default function DefaultLayout({ children }: { children: ReactNode }) {
  return <DynamicLaserEyesProvider>{children}</DynamicLaserEyesProvider>;
}
