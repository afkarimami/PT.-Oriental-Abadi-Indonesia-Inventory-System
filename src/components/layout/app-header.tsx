"use client";

import { useState } from "react";
import { Bell, ChevronDown, LogOut, Menu } from "lucide-react";
import { logout } from "@/features/auth/auth-actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { AdminSummary } from "@/types";

const roleLabels: Record<AdminSummary["role"], string> = {
  super_admin: "Super admin",
  inventory_admin: "Admin inventaris",
  viewer: "Viewer",
};

function getInitials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "AD";
}

export function AppHeader({ admin, onOpenNavigation }: { admin: AdminSummary; onOpenNavigation: () => void }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b bg-card/90 backdrop-blur">
      <div className="flex h-[76px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" size="icon" className="rounded-xl lg:hidden" onClick={onOpenNavigation}><Menu className="size-5" /><span className="sr-only">Buka navigasi</span></Button>
        <div className="min-w-0 flex-1"><p className="text-xs font-medium text-muted-foreground">Selamat datang kembali</p><h1 className="truncate text-lg font-bold sm:text-xl">Dashboard inventaris</h1></div>
        <Tooltip><TooltipTrigger render={<Button variant="ghost" size="icon" className="rounded-xl" />}><Bell className="size-5" /><span className="sr-only">Notifikasi</span></TooltipTrigger><TooltipContent>Notifikasi</TooltipContent></Tooltip>
        <div className="relative">
          <Button type="button" variant="ghost" className="h-auto rounded-xl px-1.5 py-1" onClick={() => setIsProfileOpen((open) => !open)} aria-expanded={isProfileOpen} aria-haspopup="menu">
            <Avatar size="sm"><AvatarFallback className="bg-[#ede7ff] font-semibold text-[#7356ce]">{getInitials(admin.fullName)}</AvatarFallback></Avatar>
            <span className="hidden max-w-42 text-left sm:block"><span className="block truncate text-sm font-semibold leading-4">{admin.fullName}</span><span className="block truncate text-xs text-muted-foreground">{roleLabels[admin.role]}</span></span>
            <ChevronDown className={`hidden size-4 text-muted-foreground transition sm:block ${isProfileOpen ? "rotate-180" : ""}`} />
          </Button>
          {isProfileOpen && <div role="menu" className="absolute top-[calc(100%+0.5rem)] right-0 z-50 w-60 rounded-xl border bg-popover p-1 shadow-lg">
            <div className="px-3 py-2.5"><p className="truncate text-sm font-semibold">{admin.fullName}</p><p className="truncate pt-0.5 text-xs text-muted-foreground">{admin.email}</p></div>
            <div className="my-1 h-px bg-border" />
            <form action={logout} className="p-1"><Button type="submit" variant="ghost" className="w-full justify-start rounded-lg text-destructive hover:bg-[#fff0ef] hover:text-destructive"><LogOut className="size-4" />Keluar</Button></form>
          </div>}
        </div>
      </div>
    </header>
  );
}