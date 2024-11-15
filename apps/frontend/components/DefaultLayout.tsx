/** @format */

"use client";

import React, { ReactNode } from "react";
import { LaserEyesProvider } from "@omnisat/lasereyes";

export default function DefaultLayout({ children }: { children: ReactNode }) {
  return <LaserEyesProvider>{children}</LaserEyesProvider>;
}
