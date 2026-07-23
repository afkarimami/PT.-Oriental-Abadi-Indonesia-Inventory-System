"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { RackRecord } from "../master-data-types";
import { createRack, updateRack } from "./rack-actions";
import { rackSchema } from "./rack-schema";

type RackFormInput = { code: string; name: string; description: string; is_active: boolean };
type RackFormProps = { record: RackRecord | null; onSuccess: () => void };

export function RackForm({ record, onSuccess }: RackFormProps) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<RackFormInput>({
    resolver: zodResolver(rackSchema) as Resolver<RackFormInput>,
    defaultValues: { code: record?.code ?? "", name: record?.name ?? "", description: record?.description ?? "", is_active: record?.isActive ?? true },
  });
  const submit = (values: RackFormInput) => startTransition(async () => {
    const result = record ? await updateRack(record.id, values) : await createRack(values);
    toast[result.success ? "success" : "error"](result.message);
    if (result.success) onSuccess();
  });

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit(submit)}>
      <div className="grid gap-2"><label htmlFor="rack-code" className="text-sm font-medium">Kode rak</label><input id="rack-code" autoComplete="off" className="h-10 rounded-xl border bg-background px-3" {...form.register("code")} />{form.formState.errors.code && <p className="text-xs text-destructive">{form.formState.errors.code.message}</p>}</div>
      <div className="grid gap-2"><label htmlFor="rack-name" className="text-sm font-medium">Nama rak</label><input id="rack-name" className="h-10 rounded-xl border bg-background px-3" {...form.register("name")} />{form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}</div>
      <div className="grid gap-2"><label htmlFor="rack-description" className="text-sm font-medium">Deskripsi</label><textarea id="rack-description" rows={3} className="rounded-xl border bg-background px-3 py-2" {...form.register("description")} /></div>
      <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" className="size-4" {...form.register("is_active")} /> Status aktif</label>
      <div className="flex justify-end"><Button type="submit" disabled={isPending}>{isPending ? "Menyimpan..." : "Simpan rak"}</Button></div>
    </form>
  );
}