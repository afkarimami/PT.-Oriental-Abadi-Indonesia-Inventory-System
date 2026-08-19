"use client";

import { useActionState, useState } from "react";
import { ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, LoaderCircle, Mail, ShieldCheck, Sparkles, Boxes } from "lucide-react";
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
    <main className="relative min-h-screen bg-[#f6f8ff] p-4 md:p-8 lg:flex lg:items-center lg:justify-center">
      <div className="pointer-events-none absolute -top-40 left-1/4 size-[34rem] rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-52 right-0 size-[36rem] rounded-full bg-sky-200/35 blur-3xl" />
      
      <section className="relative mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/70 bg-card shadow-2xl lg:grid-cols-2">
        
        {/* KIRI: BACKGROUND & BANNER */}
      <aside 
  className="relative overflow-hidden bg-cover bg-center p-6 text-white sm:p-8 lg:p-10"
  style={{
    backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.88)), url('/images/bg-login.jpg')`
  }}
        >
          <div className="relative z-10 flex h-full flex-col justify-between space-y-8">
            
   {/* Header / Logo Perusahaan */}
<div className="flex items-center gap-3">
  <span className="grid size-12 place-items-center overflow-hidden rounded-xl bg-white p-1 shadow">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img 
      src="/images/oriental_abadi_logo.jpg" 
      alt="Logo Perusahaan" 
      className="size-full object-contain" 
    />
  </span>
  <div>
    <p className="text-sm font-bold text-white">Ruang Inventaris</p>
    <p className="text-xs text-slate-300">Kantor Pusat</p>
  </div>
</div>
            {/* Content */}
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/30 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                <Sparkles className="size-3 text-amber-400" /> INVENTORY WORKSPACE
              </span>
              <h1 className="text-2xl font-extrabold leading-tight text-white sm:text-3xl lg:text-4xl">
                Inventaris rapi, pekerjaan jadi lebih pasti.
              </h1>
              <p className="text-xs leading-relaxed text-slate-200 sm:text-sm">
                Satu ruang kerja untuk memantau alat, stok consumable, dan aktivitas peminjaman kantor.
              </p>
            </div>

            {/* Benefits List */}
            <div className="space-y-2">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-2.5 text-xs font-medium text-slate-100">
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                  {benefit}
                </div>
              ))}
            </div>

            {/* Badges */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-xl border border-white/15 bg-slate-900/50 p-3 backdrop-blur-md">
                <p className="text-[10px] text-slate-300">Stok & Rak</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-white">
                  <Boxes className="size-4 text-indigo-300" /> Terorganisir
                </p>
              </div>
              <div className="rounded-xl border border-white/15 bg-slate-900/50 p-3 backdrop-blur-md">
                <p className="text-[10px] text-slate-300">Akses Admin</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-white">
                  <ShieldCheck className="size-4 text-emerald-400" /> Terlindungi
                </p>
              </div>
            </div>

          </div>
        </aside>

        {/* KANAN: FORM LOGIN */}
        <div className="flex items-center bg-white p-6 sm:p-8 lg:p-10">
          <div className="w-full space-y-6">
            <div>
              <span className="grid size-10 place-items-center rounded-xl bg-indigo-50 text-primary">
                <LockKeyhole className="size-5" />
              </span>
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-primary">Area Admin</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">Selamat datang kembali</h2>
              <p className="mt-1 text-xs text-muted-foreground">Masuk untuk mengelola inventaris kantor dan aktivitas alat.</p>
            </div>

            <form action={formAction} className="space-y-4">
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-slate-700">Email</span>
                <span className="relative block">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input name="email" type="email" autoComplete="email" placeholder="admin@kantor.com" className="h-10 rounded-lg border-slate-200 bg-slate-50/50 pl-9 text-xs focus-visible:bg-white" required />
                </span>
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-slate-700">Password</span>
                <span className="relative block">
                  <Input name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Masukkan password" className="h-10 rounded-lg border-slate-200 bg-slate-50/50 pr-9 text-xs focus-visible:bg-white" required />
                  <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </span>
              </label>

              {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-600">{error}</p>}

              <Button type="submit" className="h-10 w-full rounded-lg bg-primary text-xs font-semibold hover:bg-primary/90" disabled={isPending}>
                {isPending ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <ArrowRight className="mr-2 size-4" />}
                Masuk ke Dashboard
              </Button>
            </form>

            <p className="border-t pt-4 text-center text-[11px] text-muted-foreground">
              Akses khusus administrator terdaftar.
            </p>
          </div>
        </div>

      </section>
    </main>
  );
}