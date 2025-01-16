import { SendForm } from "@/components/send-form";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function Page({ params }: PageProps) {
  const { token } = await params;
  return <SendForm token={token} />;
}
