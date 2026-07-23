"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Eye, EyeOff, KeyRound, LoaderCircle, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { activateInvitedAccount } from "./auth-actions";

export function ActivateAccountForm() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setIsReady(Boolean(data.session));
      setIsChecking(false);
    };
    void checkSession();
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setIsReady(Boolean(session));
      setIsChecking(false);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.length < 8) return toast.error("Password minimal 8 karakter.");
    if (password !== confirmation) return toast.error("Konfirmasi password belum sama.");
    setIsPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setIsPending(false);
    if (error) return toast.error("Password belum dapat disimpan. Silakan buka ulang link undangan.");
    const activation = await activateInvitedAccount();
    if (activation.error) return toast.error(activation.error);
    toast.success("Password berhasil dibuat. Akun Anda sudah aktif.");
    router.replace("/");
    router.refresh();
  }

  return <main className="grid min-h-screen place-items-center bg-[#f6f8ff] p-5"><section className="w-full max-w-md rounded-[2rem] border border-white/80 bg-card p-7 shadow-[0_28px_80px_rgba(28,36,72,0.14)] sm:p-9"><span className="grid size-12 place-items-center rounded-2xl bg-[#eef1ff] text-primary"><KeyRound className="size-5" /></span>{isChecking ? <div className="py-10 text-center"><LoaderCircle className="mx-auto size-6 animate-spin text-primary" /><p className="mt-3 text-sm text-muted-foreground">Memeriksa link undangan...</p></div> : isReady ? <><p className="mt-7 text-sm font-semibold text-primary">AKTIVASI AKUN</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Buat password Anda</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Password ini hanya diketahui oleh Anda. Setelah disimpan, akun siap digunakan untuk masuk ke Ruang Inventaris.</p><form onSubmit={submit} className="mt-7 space-y-5"><label className="block space-y-2"><span className="text-sm font-semibold">Password baru</span><span className="relative block"><Input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" className="h-12 rounded-xl pr-11" placeholder="Minimal 8 karakter" required /><button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground" aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}>{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></span></label><label className="block space-y-2"><span className="text-sm font-semibold">Konfirmasi password</span><Input type={showPassword ? "text" : "password"} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" className="h-12 rounded-xl" placeholder="Ulangi password" required /></label><Button type="submit" className="h-12 w-full rounded-xl" disabled={isPending}>{isPending ? <LoaderCircle className="animate-spin" /> : <CheckCircle2 />}Simpan dan masuk</Button></form></> : <><p className="mt-7 text-sm font-semibold text-amber-700">LINK TIDAK AKTIF</p><h1 className="mt-2 text-2xl font-bold tracking-tight">Undangan tidak dapat digunakan</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Link mungkin sudah kedaluwarsa atau telah digunakan. Minta Super Admin untuk mengirim undangan baru.</p><div className="mt-6 flex gap-3 rounded-xl bg-muted p-3 text-sm text-muted-foreground"><LockKeyhole className="size-5 shrink-0 text-primary" />Untuk keamanan, setiap link undangan hanya dapat digunakan satu kali.</div></>}</section></main>;
}