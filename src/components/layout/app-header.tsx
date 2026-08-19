"use client";

import { useEffect, useState } from "react";
import { Bell, ChevronDown, LogOut, Menu } from "lucide-react";
import { logout } from "@/features/auth/auth-actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client"; // Pastikan path Supabase Client Anda tepat
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
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const supabase = createClient();

  // Ambil data dari tabel notifications saat menu lonceng dibuka
  useEffect(() => {
    if (isNotifOpen) {
      supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5)
        .then(({ data }) => {
          if (data) setNotifications(data);
        });
    }
  }, [isNotifOpen]);

  return (
    <header className="sticky top-0 z-20 border-b bg-card/90 backdrop-blur">
      <div className="flex h-[76px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" size="icon" className="rounded-xl lg:hidden" onClick={onOpenNavigation}>
          <Menu className="size-5" />
          <span className="sr-only">Buka navigasi</span>
        </Button>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground">Selamat datang kembali</p>
          <h1 className="truncate text-lg font-bold sm:text-xl">Dashboard inventaris</h1>
        </div>

        {/* Lonceng Notifikasi */}
        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-xl" 
            onClick={() => {
              setIsNotifOpen((open) => !open);
              setIsProfileOpen(false);
            }}
          >
            <Bell className="size-5" />
            <span className="sr-only">Notifikasi</span>
          </Button>

          {isNotifOpen && (
            <div role="menu" className="absolute top-[calc(100%+0.5rem)] right-0 z-50 w-80 rounded-xl border bg-popover p-3 shadow-lg">
              <div className="flex items-center justify-between pb-2 border-b">
                <p className="text-sm font-semibold">Riwayat Aktivitas</p>
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Terbaru</span>
              </div>
              
              <div className="max-h-64 overflow-y-auto divide-y text-xs">
                {notifications.length > 0 ? (
                  notifications.map((item) => (
                    <div key={item.id} className="py-2.5 space-y-0.5">
                      <p className="font-semibold text-foreground">{item.title}</p>
                      <p className="text-muted-foreground">{item.message}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-muted-foreground">Belum ada riwayat aktivitas.</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Menu Profil */}
        <div className="relative">
          <Button 
            type="button" 
            variant="ghost" 
            className="h-auto rounded-xl px-1.5 py-1" 
            onClick={() => {
              setIsProfileOpen((open) => !open);
              setIsNotifOpen(false);
            }} 
            aria-expanded={isProfileOpen} 
            aria-haspopup="menu"
          >
            <Avatar size="sm">
              <AvatarFallback className="bg-[#ede7ff] font-semibold text-[#7356ce]">{getInitials(admin.fullName)}</AvatarFallback>
            </Avatar>
            <span className="hidden max-w-42 text-left sm:block">
              <span className="block truncate text-sm font-semibold leading-4">{admin.fullName}</span>
              <span className="block truncate text-xs text-muted-foreground">{roleLabels[admin.role]}</span>
            </span>
            <ChevronDown className={`hidden size-4 text-muted-foreground transition sm:block ${isProfileOpen ? "rotate-180" : ""}`} />
          </Button>

          {isProfileOpen && (
            <div role="menu" className="absolute top-[calc(100%+0.5rem)] right-0 z-50 w-60 rounded-xl border bg-popover p-1 shadow-lg">
              <div className="px-3 py-2.5">
                <p className="truncate text-sm font-semibold">{admin.fullName}</p>
                <p className="truncate pt-0.5 text-xs text-muted-foreground">{admin.email}</p>
              </div>
              <div className="my-1 h-px bg-border" />
              <form action={logout} className="p-1">
                <Button type="submit" variant="ghost" className="w-full justify-start rounded-lg text-destructive hover:bg-[#fff0ef] hover:text-destructive">
                  <LogOut className="size-4" />Keluar
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}