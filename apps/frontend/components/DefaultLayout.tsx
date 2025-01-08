/** @format */

"use client";

import React, { ReactNode } from "react";
import LaserEyesProviderWrapper from "./LaserEyesProviderWrapper";

export default function DefaultLayout({ children }: { children: ReactNode }) {
  return <LaserEyesProviderWrapper>{children}</LaserEyesProviderWrapper>;
}
