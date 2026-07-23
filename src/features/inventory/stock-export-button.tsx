"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { InventoryStockExportItem } from "./inventory-types";

const itemTypeLabels = {
  consumable: "Consumable",
  inventory: "Inventory",
  unclassified: "Perlu klasifikasi",
};

function displayQuantity(quantity: number | null) {
  return quantity ?? "-";
}

export function StockExportButton({ items }: { items: InventoryStockExportItem[] }) {
  const [isExporting, setIsExporting] = useState(false);

  const download = async () => {
    setIsExporting(true);
    try {
      const [{ jsPDF }, { default: autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
      const document = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const itemsByRack = items.reduce((groups, item) => { const rackItems = groups.get(item.rackCode) ?? []; rackItems.push(item); groups.set(item.rackCode, rackItems); return groups; }, new Map<string, InventoryStockExportItem[]>());
      const sortedRacks = Array.from(itemsByRack.entries()).sort(([firstRack], [secondRack]) => firstRack.localeCompare(secondRack, "id"));
      const exportedAt = new Date().toLocaleString("id-ID");
      let nextTableY = 19;

      for (const [rackCode, rackItems] of sortedRacks) {
        if (nextTableY > 165) {
          document.addPage("a4", "landscape");
          nextTableY = 19;
        }
        document.setFont("helvetica", "bold");
        document.setFontSize(10);
        document.text("RAK " + rackCode, 8, nextTableY);
        autoTable(document, {
          startY: nextTableY + 3,
          head: [["RAK", "NO", "JENIS INVENTARIS", "STOK AWAL", "STOK PAKAI", "STOK TAMBAH", "SISA", "KETERANGAN"]],
          body: rackItems.map((item, index) => [rackCode, index + 1, item.name, displayQuantity(item.initialQuantity), displayQuantity(item.usedQuantity), displayQuantity(item.addedQuantity), displayQuantity(item.currentQuantity), itemTypeLabels[item.itemType]]),
          theme: "grid",
          margin: { top: 18, right: 8, bottom: 10, left: 8 },
          styles: { fontSize: 7, cellPadding: 1, lineColor: [160, 160, 160], lineWidth: 0.1, valign: "middle" },
          headStyles: { fillColor: [25, 111, 150], textColor: 255, halign: "center", fontStyle: "bold" },
          alternateRowStyles: { fillColor: [221, 243, 252] },
          columnStyles: { 0: { cellWidth: 12, halign: "center" }, 1: { cellWidth: 10, halign: "center" }, 2: { cellWidth: 75 }, 3: { cellWidth: 20, halign: "center" }, 4: { cellWidth: 20, halign: "center" }, 5: { cellWidth: 22, halign: "center" }, 6: { cellWidth: 14, halign: "center" }, 7: { cellWidth: 28, halign: "center" } },
          didDrawPage: () => {
            document.setFont("helvetica", "bold");
            document.setFontSize(13);
            document.text("STOK INVENTARIS", 8, 8);
            document.setFont("helvetica", "normal");
            document.setFontSize(7);
            document.text("Dicetak: " + exportedAt, 8, 13);
            document.text("Halaman " + document.getNumberOfPages(), 286, 9, { align: "right" });
          },
        });
        nextTableY = (document as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 7;
      }

      document.save("stok-inventaris-" + new Date().toISOString().slice(0, 10) + ".pdf");
      toast.success("PDF stok inventaris berhasil diunduh.");
    } catch {
      toast.error("PDF gagal dibuat. Silakan coba lagi.");
    } finally {
      setIsExporting(false);
    }
  };

  return <Button type="button" variant="outline" className="rounded-xl" onClick={download} disabled={isExporting || items.length === 0}><Download />{isExporting ? "Menyiapkan PDF..." : "Unduh PDF stok"}</Button>;
}