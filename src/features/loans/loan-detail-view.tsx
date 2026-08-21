"use client";

import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { ArrowLeft, ExternalLink, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FormDialog } from "@/components/shared/form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { returnLoanItem } from "./loan-actions";
import { uploadLoanDocumentation } from "./loan-document-upload";
import { ImageUploadField } from "./image-upload-field";
import type { LoanDetailItem, LoanDetail } from "./loan-types";

const statusLabel = { active: "Sedang dipinjam", closed: "Selesai", overdue: "Terlambat" };

export function LoanDetailView({ loan }: { loan: LoanDetail }) {
  const [returnItem, setReturnItem] = useState<LoanDetailItem | null>(null);
  const router = useRouter();
  const statusVariant = loan.status === "overdue" ? "destructive" : loan.status === "closed" ? "secondary" : "default";

  const handleSuccess = () => {
    setReturnItem(null);
    router.refresh();
    router.push("/loans");
  };

  return (
    <section className="space-y-6">
      <Link href="/loans" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary">
        <ArrowLeft className="size-4" />
        Kembali ke transaksi alat
      </Link>

      <div className="grid gap-4 rounded-2xl border bg-card p-5 sm:grid-cols-2">
        <Info label="Peminjam" value={loan.borrowerName} detail={loan.borrowerPhone + (loan.borrowerOrganization ? " - " + loan.borrowerOrganization : "")} />
        <Info label="Keperluan" value={loan.purpose} detail={"Dipinjam " + new Date(loan.loanedAt).toLocaleDateString("id-ID")} />
        <Info label="Rencana kembali" value={loan.expectedReturnOn ? new Date(loan.expectedReturnOn).toLocaleDateString("id-ID") : "Belum ditentukan"} detail={loan.status === "closed" ? "Transaksi selesai" : "Masih dipantau"} />
        <div>
          <p className="text-sm text-muted-foreground">Status</p>
          <div className="mt-2">
            <Badge variant={statusVariant}>{statusLabel[loan.status]}</Badge>
          </div>
        </div>
        {loan.notes && <Info label="Catatan" value={loan.notes} />}
        {loan.documentationUrl && (
          <a href={loan.documentationUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
            Lihat foto serah-terima <ExternalLink className="size-4" />
          </a>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold">Alat dalam transaksi</h3>
        {loan.items.map((item) => (
          <article key={item.id} className="rounded-2xl border bg-card p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-mono text-xs font-semibold text-primary">
                  {item.itemCode} - Rak {item.rackCode}
                </p>
                <h4 className="mt-1 font-bold">{item.itemName}</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Dipinjam {item.quantityBorrowed} | Baik {item.quantityReturned} | Rusak {item.quantityDamaged} | Hilang {item.quantityLost}
                </p>
              </div>
              {item.outstandingQuantity > 0 ? (
                <Button type="button" onClick={() => setReturnItem(item)}>
                  <RotateCcw />
                  Selesaikan pengembalian ({item.outstandingQuantity})
                </Button>
              ) : (
                <Badge variant="secondary">Selesai</Badge>
              )}
            </div>

            {item.returns.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Riwayat pengembalian</p>
                <div className="mt-2 space-y-2">
                  {item.returns.map((entry) => (
                    <div key={entry.id} className="rounded-xl bg-muted/60 p-3 text-sm">
                      <p>
                        Baik {entry.quantityGood}, Rusak {entry.quantityDamaged}, Hilang {entry.quantityLost}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(entry.createdAt).toLocaleString("id-ID")}
                        {entry.notes ? " - " + entry.notes : ""}
                      </p>
                      {entry.documentationUrl && (
                        <a href={entry.documentationUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-xs font-semibold text-primary hover:underline">
                          Lihat dokumentasi
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </article>
        ))}
      </div>

      <FormDialog
        open={Boolean(returnItem)}
        onOpenChange={(open) => {
          if (!open) setReturnItem(null);
        }}
        title="Selesaikan pengembalian"
        description="Alat kondisi baik otomatis kembali ke stok tersedia. Alat rusak atau hilang tercatat sebagai kondisi alat."
      >
        {returnItem && <ReturnForm item={returnItem} loanId={loan.id} onSuccess={handleSuccess} />}
      </FormDialog>
    </section>
  );
}

function Info({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
      {detail && <p className="mt-1 text-sm text-muted-foreground">{detail}</p>}
    </div>
  );
}

function ReturnForm({ item, loanId, onSuccess }: { item: LoanDetailItem; loanId: string; onSuccess: () => void }) {
  const [condition, setCondition] = useState<"good" | "damaged" | "lost">("good");
  const [quantity, setQuantity] = useState(item.outstandingQuantity);
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isPending, setIsPending] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (quantity < 1 || quantity > item.outstandingQuantity) return toast.error("Jumlah pengembalian tidak valid.");
    if (condition !== "good" && !file) return toast.error("Foto dokumentasi wajib untuk alat rusak atau hilang.");

    setIsPending(true);
    try {
      const documentationPath = file ? await uploadLoanDocumentation(file) : undefined;
      const result = await returnLoanItem(
        {
          loanItemId: item.id,
          quantityGood: condition === "good" ? quantity : 0,
          quantityDamaged: condition === "damaged" ? quantity : 0,
          quantityLost: condition === "lost" ? quantity : 0,
          notes,
          documentationPath,
        },
        loanId
      );

      if (!result.success) return toast.error(result.message);

      toast.success(result.message);
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Pengembalian gagal dicatat.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form className="grid gap-4" onSubmit={submit}>
      <Field label="Alat">
        <p className="rounded-xl bg-muted p-3 text-sm">
          {item.itemName} - sisa dipinjam {item.outstandingQuantity}
        </p>
      </Field>
      <Field label="Jumlah">
        <Input type="number" min="1" max={item.outstandingQuantity} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} />
      </Field>
      <Field label="Kondisi">
        <select value={condition} onChange={(event) => setCondition(event.target.value as "good" | "damaged" | "lost")} className="h-10 rounded-xl border bg-background px-3">
          <option value="good">Baik - kembali ke stok tersedia</option>
          <option value="damaged">Rusak - tidak kembali ke stok tersedia</option>
          <option value="lost">Hilang - tidak kembali ke stok tersedia</option>
        </select>
      </Field>
      <Field label={condition === "good" ? "Foto pengembalian (opsional)" : "Foto dokumentasi (wajib)"}>
        <ImageUploadField file={file} onChange={setFile} required={condition !== "good"} />
      </Field>
      <Field label="Catatan (opsional)">
        <textarea className="min-h-20 rounded-xl border bg-background px-3 py-2" value={notes} onChange={(event) => setNotes(event.target.value)} />
      </Field>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Menyimpan..." : "Selesaikan pengembalian"}
      </Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      <span>{label}</span>
      {children}
    </label>
  );
}