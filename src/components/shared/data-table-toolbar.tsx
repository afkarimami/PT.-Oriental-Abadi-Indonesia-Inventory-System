"use client";

import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";

type FilterOption = { value: string; label: string };
type DataTableToolbarProps = {
  searchPlaceholder: string;
  relationParam?: string;
  relationLabel?: string;
  relationOptions?: FilterOption[];
  children?: ReactNode;
};

export function DataTableToolbar({ searchPlaceholder, relationParam, relationLabel, relationOptions, children }: DataTableToolbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };
  return <div className="flex flex-col gap-3 rounded-2xl border bg-card p-3 sm:flex-row sm:flex-wrap sm:items-center"><form className="relative min-w-0 flex-1" onSubmit={(event) => { event.preventDefault(); update("search", new FormData(event.currentTarget).get("search")?.toString() ?? ""); }}><Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><Input name="search" defaultValue={searchParams.get("search") ?? ""} className="h-10 rounded-xl pl-9" placeholder={searchPlaceholder} /></form><label className="text-sm text-muted-foreground"><span className="sr-only">Filter status</span><select value={searchParams.get("status") ?? "all"} onChange={(event) => update("status", event.target.value)} className="h-10 rounded-xl border bg-background px-3 text-foreground"><option value="all">Semua status</option><option value="active">Aktif</option><option value="inactive">Nonaktif</option></select></label>{relationParam && relationOptions && <label className="text-sm text-muted-foreground"><span className="sr-only">{relationLabel}</span><select value={searchParams.get(relationParam) ?? ""} onChange={(event) => update(relationParam, event.target.value)} className="h-10 max-w-48 rounded-xl border bg-background px-3 text-foreground"><option value="">{relationLabel ?? "Semua"}</option>{relationOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>}<label className="text-sm text-muted-foreground"><span className="sr-only">Jumlah data per halaman</span><select value={searchParams.get("pageSize") ?? "10"} onChange={(event) => update("pageSize", event.target.value)} className="h-10 rounded-xl border bg-background px-3 text-foreground"><option value="10">10 / halaman</option><option value="25">25 / halaman</option><option value="50">50 / halaman</option></select></label>{children}</div>;
}