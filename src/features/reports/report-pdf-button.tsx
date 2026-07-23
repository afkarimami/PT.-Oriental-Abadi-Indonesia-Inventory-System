"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { StockMovementReport } from "./report-types";

type ReportPdfButtonProps = {
  movements: StockMovementReport[];
  periodLabel: string;
  totalUnits: number;
  uniqueItems: number;
  rackData: { name: string; value: number }[];
};

export function ReportPdfButton({ movements, periodLabel, totalUnits, uniqueItems, rackData }: ReportPdfButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  async function download() {
    if (movements.length === 0) return toast.error("Belum ada data untuk diunduh pada periode ini.");
    setIsExporting(true);
    try {
      const [{ jsPDF }, { default: autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
      const document = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const exportedAt = new Date().toLocaleString("id-ID");
      document.setFont("helvetica", "bold");
      document.setFontSize(16);
      document.text("LAPORAN BARANG MASUK", 14, 15);
      document.setFont("helvetica", "normal");
      document.setFontSize(9);
      document.text(`Periode: ${periodLabel}`, 14, 21);
      document.text(`Dicetak: ${exportedAt}`, 14, 26);
      document.setFont("helvetica", "bold");
      document.text(`Transaksi: ${movements.length} | Unit masuk: ${totalUnits} | Jenis barang: ${uniqueItems}`, 14, 33);

      autoTable(document, {
        startY: 39,
        head: [["DISTRIBUSI RAK", "TOTAL UNIT MASUK"]],
        body: rackData.map((rack) => [rack.name, rack.value]),
        theme: "grid",
        margin: { left: 14, right: 170 },
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [82, 103, 246], textColor: 255 },
      });

      const firstTable = document as unknown as { lastAutoTable: { finalY: number } };
      autoTable(document, {
        startY: firstTable.lastAutoTable.finalY + 10,
        head: [["NO", "TANGGAL", "KODE", "BARANG", "RAK", "MASUK", "STOK SEBELUM", "STOK SESUDAH", "CATATAN"]],
        body: movements.map((movement, index) => [
          index + 1,
          new Date(movement.createdAt).toLocaleString("id-ID"),
          movement.itemCode,
          movement.itemName,
          movement.rackCode,
          movement.quantity,
          movement.quantityBefore,
          movement.quantityAfter,
          movement.notes || "-",
        ]),
        theme: "grid",
        margin: { top: 15, right: 10, bottom: 12, left: 10 },
        styles: { fontSize: 7, cellPadding: 1.6, valign: "middle" },
        headStyles: { fillColor: [25, 111, 150], textColor: 255, fontStyle: "bold", halign: "center" },
        alternateRowStyles: { fillColor: [241, 248, 252] },
        columnStyles: { 0: { cellWidth: 10, halign: "center" }, 1: { cellWidth: 29 }, 2: { cellWidth: 25 }, 3: { cellWidth: 58 }, 4: { cellWidth: 12, halign: "center" }, 5: { cellWidth: 14, halign: "center" }, 6: { cellWidth: 18, halign: "center" }, 7: { cellWidth: 18, halign: "center" }, 8: { cellWidth: 70 } },
        didDrawPage: () => {
          document.setFont("helvetica", "normal");
          document.setFontSize(7);
          document.text(`Laporan Barang Masuk - ${periodLabel}`, 10, 8);
          document.text(`Halaman ${document.getNumberOfPages()}`, 287, 8, { align: "right" });
        },
      });
      document.save(`laporan-barang-masuk-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success("PDF laporan berhasil diunduh.");
    } catch {
      toast.error("PDF laporan gagal dibuat. Silakan coba lagi.");
    } finally {
      setIsExporting(false);
    }
  }

  return <Button variant="outline" onClick={download} disabled={isExporting || movements.length === 0}><Download />{isExporting ? "Menyiapkan PDF..." : "Unduh PDF"}</Button>;
}