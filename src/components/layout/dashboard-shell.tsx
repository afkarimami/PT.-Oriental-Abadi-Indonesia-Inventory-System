"use client";

import { useState, type ReactNode } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import type { AdminSummary } from "@/types";

type DashboardShellProps = {
  admin: AdminSummary;
  children: ReactNode;
};

export function DashboardShell({ admin, children }: DashboardShellProps) {
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background lg:flex">
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">
        <AppSidebar admin={admin} />
      </div>
      <Sheet open={isNavigationOpen} onOpenChange={setIsNavigationOpen}>
        <SheetContent side="left" className="w-[280px] p-0" showCloseButton={false}>
          <SheetTitle className="sr-only">Navigasi utama</SheetTitle>
          <AppSidebar admin={admin} compact onNavigate={() => setIsNavigationOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className="min-w-0 flex-1 lg:pl-[248px]">
        <AppHeader admin={admin} onOpenNavigation={() => setIsNavigationOpen(true)} />
        {children}
      </div>
    </div>
  );
}
