"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ReactNode } from "react";

// Dynamically import LaserEyesProvider so it never runs on the server
const DynamicLaserEyesProvider = dynamic(
  () => import("@omnisat/lasereyes").then((mod) => mod.LaserEyesProvider),
  { ssr: false }
);

interface LaserEyesProviderWrapperProps {
  children: ReactNode;
}

export default function LaserEyesProviderWrapper({ 
  children 
}: LaserEyesProviderWrapperProps) {
  return <DynamicLaserEyesProvider>{children}</DynamicLaserEyesProvider>;
}
