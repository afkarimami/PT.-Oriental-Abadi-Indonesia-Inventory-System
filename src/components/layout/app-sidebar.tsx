"use client";

import Link from "next/link";
import { Boxes, ChevronDown, ChevronRight, UsersRound } from "lucide-react";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { navigationItems } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { AdminSummary } from "@/types";

type AppSidebarProps = { admin: AdminSummary; compact?: boolean; onNavigate?: () => void };

export function AppSidebar({ admin, compact = false, onNavigate }: AppSidebarProps) {
  const items = admin.role === "super_admin" ? [...navigationItems, { label: "Pengguna", href: "/users", icon: UsersRound }] : navigationItems;
  const pathname = usePathname();

  return (
    <aside className={cn("flex h-full flex-col bg-card", compact ? "w-full" : "w-[248px] border-r")}>
      <div className="flex h-[76px] items-center gap-3 px-5"><span className="grid size-10 place-items-center rounded-xl bg-primary text-white"><Boxes className="size-5" /></span><div><p className="text-sm font-bold">Ruang Inventaris</p><p className="text-xs text-muted-foreground">Kantor pusat</p></div></div>
      <Separator />
      <nav className="flex-1 px-3 py-5" aria-label="Navigasi utama">
        <p className="px-3 pb-2 text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">Workspace</p>
        <div className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const children = item.children ?? [];
            const hasChildren = children.length > 0;
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <div key={item.label}>
                <Link href={item.href} onClick={onNavigate} aria-current={isActive ? "page" : undefined} className={cn("group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-[#f1f4ff] hover:text-[#3e51ca]", isActive && "bg-[#eef1ff] text-[#4053d2]")}><Icon className={cn("size-[18px]", isActive && "text-primary")} /><span className="flex-1">{item.label}</span>{hasChildren ? <ChevronDown className={cn("size-4", isActive && "text-primary")} /> : isActive && <ChevronRight className="size-4 text-primary" />}</Link>
                {hasChildren && <div className="mt-1 ml-5 space-y-1 border-l pl-3">{children.map((child) => { const ChildIcon = child.icon; const isChildActive = pathname === child.href; return <Link key={child.href} href={child.href} onClick={onNavigate} aria-current={isChildActive ? "page" : undefined} className={cn("flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-muted-foreground hover:text-primary", isChildActive && "bg-primary/10 text-primary")}><ChildIcon className="size-3.5" />{child.label}</Link>; })}</div>}
              </div>
            );
          })}
        </div>
      </nav>
      {/* <div className="m-3 rounded-2xl bg-[#f5f7ff] p-4"><p className="text-sm font-semibold text-[#3547b9]">Inventaris kantor</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Pilih rak untuk melihat susunan dan stok barang.</p></div> */}
    </aside>
  );
}