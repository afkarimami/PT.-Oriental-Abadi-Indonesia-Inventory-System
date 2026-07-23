"use client";

import { useActionState, useState } from "react";
import { ArrowRight, Boxes, CheckCircle2, Eye, EyeOff, LockKeyhole, LoaderCircle, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { login, type AuthActionState } from "./auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: AuthActionState = {};

const benefits = [
  "Pantau stok dari seluruh rak secara langsung.",
  "Catat peminjaman dan pengembalian alat dengan rapi.",
  "Simpan riwayat barang masuk untuk laporan yang transparan.",
];

export function LoginForm({ initialError }: { initialError?: string }) {
  const [state, formAction, isPending] = useActionState(login, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const error = state.error ?? initialError;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f6f8ff] px-5 py-6 sm:px-8 lg:grid lg:place-items-center">
      <div className="pointer-events-none absolute -top-40 left-1/4 size-[34rem] rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-52 right-0 size-[36rem] rounded-full bg-sky-200/35 blur-3xl" />
      <section className="relative mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/70 bg-card shadow-[0_28px_90px_rgba(28,36,72,0.14)] lg:grid-cols-[1.1fr_0.9fr]">
        <aside className="relative overflow-hidden bg-[#18265d] p-7 text-white sm:p-10 lg:p-12">
          <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />
          <div className="relative flex h-full flex-col">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-white text-primary shadow-lg"><Boxes className="size-6" /></span>
              <div><p className="text-base font-bold">Ruang Inventaris</p><p className="text-xs text-white/65">Kantor pusat</p></div>
            </div>
            <div className="mt-12 max-w-md lg:mt-16">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/85"><Sparkles className="size-3.5" /> INVENTORY WORKSPACE</span>
              <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">Inventaris rapi, pekerjaan jadi lebih pasti.</h1>
              <p className="mt-5 max-w-lg text-sm leading-7 text-white/70 sm:text-base">Satu ruang kerja untuk memantau alat, stok consumable, dan aktivitas peminjaman kantor.</p>
            </div>
            <div className="mt-9 space-y-3 lg:mt-12">{benefits.map((benefit) => <div key={benefit} className="flex items-start gap-3 text-sm text-white/85"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#8de7c6]" />{benefit}</div>)}</div>
            <div className="mt-10 grid max-w-md grid-cols-2 gap-3 lg:mt-auto">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur"><p className="text-xs text-white/60">Stok & rak</p><p className="mt-2 flex items-center gap-2 text-lg font-bold"><Boxes className="size-4 text-[#aebcff]" /> Terorganisir</p></div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur"><p className="text-xs text-white/60">Akses admin</p><p className="mt-2 flex items-center gap-2 text-lg font-bold"><ShieldCheck className="size-4 text-[#8de7c6]" /> Terlindungi</p></div>
            </div>
          </div>
        </aside>

        <div className="flex min-h-[40rem] items-center bg-white p-7 sm:p-10 lg:p-12">
          <div className="mx-auto w-full max-w-sm">
            <span className="grid size-12 place-items-center rounded-2xl bg-[#eef1ff] text-primary"><LockKeyhole className="size-5" /></span>
            <p className="mt-7 text-sm font-semibold text-primary">AREA ADMIN</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#17213d]">Selamat datang kembali</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Masuk untuk mengelola inventaris kantor dan aktivitas alat.</p>

            <form action={formAction} className="mt-8 space-y-5">
              <label className="block space-y-2"><span className="text-sm font-semibold">Email</span><span className="relative block"><Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><Input name="email" type="email" autoComplete="email" placeholder="admin@kantor.com" className="h-12 rounded-xl border-slate-200 bg-slate-50/70 pl-10 focus-visible:bg-white" required /></span></label>
              <label className="block space-y-2"><span className="text-sm font-semibold">Password</span><span className="relative block"><Input name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Masukkan password" className="h-12 rounded-xl border-slate-200 bg-slate-50/70 pr-11 focus-visible:bg-white" required /><button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute top-1/2 right-3 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground" aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}>{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></span></label>
              {error && <p role="alert" className="rounded-xl border border-[#ffd5d2] bg-[#fff0ef] px-3 py-2.5 text-sm text-[#c74e4c]">{error}</p>}
              <Button type="submit" className="h-12 w-full rounded-xl bg-primary text-sm hover:bg-[#4059ec]" disabled={isPending}>{isPending ? <LoaderCircle className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}Masuk ke dashboard</Button>
            </form>
            <p className="mt-7 border-t pt-5 text-center text-xs leading-5 text-muted-foreground">Akun hanya untuk administrator yang sudah terdaftar. Hubungi admin utama jika Anda belum memiliki akses.</p>
          </div>
        </div>
      </section>
    </main>
  );
}