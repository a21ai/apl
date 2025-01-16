import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
}

export function ActionButton({
  icon: Icon,
  label,
  onClick,
}: ActionButtonProps) {
  return (
    <Button
      variant="ghost"
      className="flex flex-col items-center justify-center gap-2 h-auto py-4 px-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors w-full"
      onClick={onClick}
    >
      <Icon className="h-6 w-6 text-white" />
      <span className="text-sm text-white/60">{label}</span>
    </Button>
  );
}
