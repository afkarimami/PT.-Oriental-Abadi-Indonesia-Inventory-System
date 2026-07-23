import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return <div className="grid min-h-56 place-items-center rounded-2xl border border-dashed bg-muted/30 p-6 text-center"><div><span className="mx-auto grid size-11 place-items-center rounded-2xl bg-[#eef1ff] text-primary"><Inbox className="size-5" /></span><h3 className="mt-3 font-semibold">{title}</h3><p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>{actionLabel && onAction && <Button className="mt-4 rounded-xl" onClick={onAction}>{actionLabel}</Button>}</div></div>;
}