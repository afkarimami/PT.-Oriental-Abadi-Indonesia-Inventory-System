"use client";

import { useState, useTransition, type FormEvent } from "react";
import { CheckCircle2, Mail, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormDialog } from "@/components/shared/form-dialog";
import { deleteUserAccount, inviteUser, updateUserActive, updateUserRole } from "./user-actions";
import type { ManagedAccount } from "./user-types";
import type { AdminRole } from "@/types";

type UserManagementTableProps = { accounts: ManagedAccount[]; currentUserId: string };

export function UserManagementTable({ accounts, currentUserId }: UserManagementTableProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [invitedEmail, setInvitedEmail] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRole>("inventory_admin");

  function run(action: () => Promise<{ success: boolean; message: string }>) {
    startTransition(async () => {
      const result = await action();
      toast[result.success ? "success" : "error"](result.message);
    });
  }

  function submitInvitation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await inviteUser({ fullName, email, role });
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      setInvitedEmail(email);
      setFullName("");
      setEmail("");
      setRole("inventory_admin");
      setIsDialogOpen(false);
    });
  }

  return <>
    <div className="mb-5 flex flex-col gap-3 rounded-2xl border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold">Akun yang dapat mengakses sistem</h2><p className="mt-1 text-sm text-muted-foreground">Akun baru dikirim melalui undangan email, bukan pendaftaran umum.</p></div><Button onClick={() => setIsDialogOpen(true)}><UserPlus /> Tambah akun</Button></div>
    <section className="overflow-hidden rounded-2xl border bg-card"><div className="hidden grid-cols-[minmax(0,1fr)_150px_130px_82px] gap-4 border-b bg-muted/35 px-5 py-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase md:grid"><span>Pengguna</span><span>Peran</span><span>Status</span><span className="text-right">Aksi</span></div><div className="divide-y">{accounts.map((account) => {
      const isCurrentUser = account.id === currentUserId;
      return <article key={account.id} className="grid gap-4 px-5 py-4 md:grid-cols-[minmax(0,1fr)_150px_130px_82px] md:items-center"><div className="min-w-0"><p className="truncate font-semibold">{account.fullName}</p><p className="mt-1 truncate text-sm text-muted-foreground">{account.email}</p></div><label className="text-sm md:text-xs md:text-muted-foreground"><span className="mr-2 md:hidden">Peran:</span><select aria-label={`Peran ${account.fullName}`} value={account.role} disabled={isPending || isCurrentUser} onChange={(event) => run(() => updateUserRole(account.id, event.target.value as AdminRole))} className="h-9 w-full rounded-lg border bg-background px-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"><option value="super_admin">Super Admin</option><option value="inventory_admin">Admin Inventaris</option><option value="viewer">Viewer</option></select></label><div className="flex items-center justify-between gap-2 md:block"><span className="text-sm md:hidden">Status:</span><Button variant={account.isActive ? "outline" : "secondary"} size="sm" disabled={isPending || isCurrentUser} onClick={() => run(() => updateUserActive(account.id, !account.isActive))}>{account.isActive ? "Aktif" : "Nonaktif"}</Button></div><div className="flex justify-end md:justify-start"><Button variant="destructive" size="icon-sm" disabled={isPending || isCurrentUser} onClick={() => { if (window.confirm(`Hapus akun ${account.fullName}? Akun tanpa riwayat transaksi akan dihapus permanen.`)) run(() => deleteUserAccount(account.id)); }} aria-label={`Hapus akun ${account.fullName}`}><Trash2 /></Button></div>{isCurrentUser && <p className="text-xs text-muted-foreground md:col-span-4">Akun Anda saat ini. Peran dan statusnya tidak dapat diubah dari halaman ini.</p>}</article>;
    })}</div></section>
    <FormDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} title="Tambah akun" description="Undangan login dikirim ke email pengguna."><form onSubmit={submitInvitation} className="space-y-4"><label className="block space-y-1.5 text-sm font-medium">Nama lengkap<Input required value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Contoh: Budi Santoso" /></label><label className="block space-y-1.5 text-sm font-medium">Email<Input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@perusahaan.com" /></label><label className="block space-y-1.5 text-sm font-medium">Peran<select value={role} onChange={(event) => setRole(event.target.value as AdminRole)} className="h-9 w-full rounded-lg border bg-background px-2 text-sm"><option value="inventory_admin">Admin Inventaris</option><option value="viewer">Viewer</option><option value="super_admin">Super Admin</option></select><span className="block text-xs font-normal text-muted-foreground">{role === "viewer" ? "Hanya melihat data dan laporan." : role === "inventory_admin" ? "Mengelola stok dan transaksi alat." : "Mengelola akun serta seluruh inventaris."}</span></label><Button type="submit" className="w-full" disabled={isPending}>{isPending ? "Mengirim..." : "Kirim undangan"}</Button></form></FormDialog>
    <FormDialog open={invitedEmail !== null} onOpenChange={(open) => { if (!open) setInvitedEmail(null); }} title="Undangan berhasil dikirim" description="Penerima dapat membuat kata sandi melalui tautan pada email."><div className="flex flex-col items-center py-3 text-center"><div className="mb-5 rounded-full bg-emerald-100 p-5 text-emerald-600"><CheckCircle2 className="size-16" strokeWidth={2.25} /></div><h3 className="text-lg font-semibold">Email undangan terkirim</h3><p className="mt-2 max-w-sm text-sm text-muted-foreground">Undangan akun telah dikirim ke <span className="font-medium text-foreground">{invitedEmail}</span>.</p><div className="mt-6 flex w-full flex-col gap-2 sm:flex-row"><Button variant="outline" className="flex-1" onClick={() => { setInvitedEmail(null); setIsDialogOpen(true); }}><Mail /> Tambah akun lain</Button><Button className="flex-1" onClick={() => setInvitedEmail(null)}>Selesai</Button></div></div></FormDialog>
  </>;
}