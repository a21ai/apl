"use client";

import { SendForm } from "@/components/send-form";

export default function Page({
  params,
  searchParams,
}: {
  params: { token: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  return <SendForm token={params.token} />;
}
