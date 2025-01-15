import { Button } from "@/components/ui/button"
import { TypeIcon as type, LucideIcon } from 'lucide-react'

interface ActionButtonProps {
  icon: LucideIcon
  label: string
  onClick?: () => void
}

export function ActionButton({ icon: Icon, label, onClick }: ActionButtonProps) {
  return (
    <Button
      variant="ghost"
      className="flex flex-col items-center gap-2 h-auto py-4 px-6 rounded-2xl hover:bg-white/5 transition-colors"
      onClick={onClick}
    >
      <Icon className="h-6 w-6 text-white" />
      <span className="text-sm text-white/60">{label}</span>
    </Button>
  )
}

