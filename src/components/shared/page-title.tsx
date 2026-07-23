import { cn } from "@/lib/utils";

type PageTitleProps = { eyebrow?: string; title: string; description?: string; className?: string };

export function PageTitle({ eyebrow, title, description, className }: PageTitleProps) {
  return <div className={cn(className)}>{eyebrow && <p className="mb-1 text-xs font-semibold tracking-[0.12em] text-primary uppercase">{eyebrow}</p>}<h2 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>{description && <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>}</div>;
}