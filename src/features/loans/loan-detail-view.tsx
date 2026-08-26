"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { returnLoanItem } from "./loan-actions";
import type { LoanRecord, LoanItemDetail } from "./loan-types";

export default function LoanDetailView({ loan }: { loan: LoanRecord }) {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState<LoanItemDetail | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleReturn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await returnLoanItem(formData);
    setLoading(false);

    if (res.success) {
      setSelectedItem(null);
      router.refresh();
    } else {
      alert(res.error || "Gagal mengembalikan barang");
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{loan.borrowerName}</h1>
          <p className="text-sm text-gray-500">{loan.code}</p>
        </div>
        <div className="text-right">
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
            {loan.status === "active" ? "Sedang dipinjam" : "Selesai"}
          </span>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <h2 className="mb-4 font-semibold">Alat dalam transaksi</h2>
        <div className="space-y-4">
          {loan.items.map((item) => {
            const outstanding =
              item.quantityBorrowed -
              (item.quantityReturned + item.quantityDamaged + item.quantityLost);

            return (
              <div
                key={item.id}
                className="flex items-center justify-between border-b pb-4 last:border-0"
              >
                <div>
                  <p className="font-medium">{item.itemName}</p>
                  <p className="text-xs text-gray-500">
                    Kode: {item.itemCode} | Dipinjam: {item.quantityBorrowed} | Baik:{" "}
                    {item.quantityReturned} | Rusak: {item.quantityDamaged} | Hilang:{" "}
                    {item.quantityLost}
                  </p>
                </div>

                {outstanding > 0 && loan.status === "active" && (
                  <button
                    type="button"
                    className="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                    onClick={() => setSelectedItem(item)}
                  >
                    Selesaikan pengembalian ({outstanding})
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Dialog Pengembalian Standard HTML */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Pengembalian {selectedItem.itemName}</h3>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReturn} className="space-y-4">
              <input type="hidden" name="loanItemId" value={selectedItem.id} />

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Jumlah Kondisi Baik
                </label>
                <input
                  type="number"
                  name="quantityGood"
                  defaultValue={
                    selectedItem.quantityBorrowed -
                    (selectedItem.quantityReturned +
                      selectedItem.quantityDamaged +
                      selectedItem.quantityLost)
                  }
                  min="0"
                  className="w-full rounded border p-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Jumlah Rusak
                </label>
                <input
                  type="number"
                  name="quantityDamaged"
                  defaultValue="0"
                  min="0"
                  className="w-full rounded border p-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Jumlah Hilang
                </label>
                <input
                  type="number"
                  name="quantityLost"
                  defaultValue="0"
                  min="0"
                  className="w-full rounded border p-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Catatan
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  className="w-full rounded border p-2 text-sm"
                  placeholder="Opsional..."
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="w-1/2 rounded border border-gray-300 py-2 text-sm font-medium hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 rounded bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Memproses..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}