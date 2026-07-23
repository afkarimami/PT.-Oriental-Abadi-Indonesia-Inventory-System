"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-6">
      <section className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-[0_12px_36px_rgba(28,36,52,0.06)]">
        <span className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-[#fff0ef] text-[#e65b5b]"><AlertCircle className="size-6" aria-hidden="true" /></span>
        <h1 className="text-xl font-semibold">Halaman belum dapat dimuat</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Terjadi gangguan sementara. Silakan coba muat ulang halaman ini.</p>
        <Button className="mt-6 rounded-xl" onClick={reset}><RefreshCw className="size-4" aria-hidden="true" />Coba lagi</Button>
      </section>
    </main>
  );
}