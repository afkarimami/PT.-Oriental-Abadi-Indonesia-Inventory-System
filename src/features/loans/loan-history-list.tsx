"use client";

import type { LoanRecord } from "./loan-types";

export function LoanHistoryList({ loans }: { loans: LoanRecord[] }) {
  if (!loans || loans.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-center text-sm text-gray-500">
        Belum ada riwayat peminjaman.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {loans.map((loan: any) => (
        <div key={loan.id} className="rounded-lg border p-4 shadow-sm">
          <div className="flex items-center justify-between border-b pb-2 mb-3">
            <div>
              <p className="font-semibold text-base">{loan.borrowerName}</p>
              <p className="text-xs text-gray-500">{loan.code} • {loan.borrowerPhone}</p>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                loan.status === "active"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {loan.status === "active" ? "Aktif Dipinjam" : "Selesai / Ditutup"}
            </span>
          </div>

          <p className="text-xs text-gray-600 mb-2">
            <span className="font-medium">Keperluan:</span> {loan.purpose}
          </p>

          <div className="bg-gray-50 rounded p-2 text-xs space-y-1">
            <p className="font-semibold text-gray-700">Daftar Barang:</p>
            {loan.items?.map((item: any) => (
              <div key={item.id} className="flex justify-between text-gray-600">
                <span>• {item.itemName} ({item.itemCode})</span>
                <span>Pinjam: {item.quantityBorrowed} | Kembali: {item.quantityReturned}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default LoanHistoryList;