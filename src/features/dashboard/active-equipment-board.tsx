import { ArrowUpRight, MoreHorizontal } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ActiveEquipment } from "@/types";

const equipment: ActiveEquipment[] = [
  { name: "MacBook Pro 14\"", code: "LPT-0142", borrower: "Nadia Putri", purpose: "Presentasi klien", location: "Ruang Meeting A", returnDate: "2026-07-18", status: "Dipinjam" },
  { name: "Kamera Sony A7 III", code: "CAM-0021", borrower: "Rizky Maulana", purpose: "Dokumentasi acara", location: "Auditorium", returnDate: "2026-07-17", status: "Dipinjam" },
  { name: "Proyektor Epson EB-X06", code: "PRJ-0038", borrower: "Dewi Lestari", purpose: "Training internal", location: "Ruang Training", returnDate: "2026-07-16", status: "Terlambat" },
  { name: "iPad Air 5", code: "TAB-0064", borrower: "Bima Aditya", purpose: "Survey lapangan", location: "Jakarta Selatan", returnDate: "2026-07-20", status: "Dipinjam" },
];

export function ActiveEquipmentBoard() {
  return <Card className="border shadow-[0_8px_24px_rgba(28,36,52,0.04)]"><CardHeader className="flex flex-row items-start justify-between gap-4 border-b p-5 sm:p-6"><div><CardTitle className="text-lg">Peralatan aktif</CardTitle><CardDescription className="mt-1">Barang yang sedang digunakan atau dipinjam.</CardDescription></div><Button variant="outline" className="rounded-xl" size="sm">Lihat semua<ArrowUpRight className="size-3.5" /></Button></CardHeader><CardContent className="p-0"><Table><TableHeader><TableRow className="hover:bg-transparent"><TableHead className="pl-5 sm:pl-6">Barang</TableHead><TableHead>Peminjam</TableHead><TableHead>Penggunaan</TableHead><TableHead>Tanggal kembali</TableHead><TableHead>Status</TableHead><TableHead className="w-12" /></TableRow></TableHeader><TableBody>{equipment.map((item) => <TableRow key={item.code}><TableCell className="min-w-48 pl-5 py-3.5 sm:pl-6"><p className="font-semibold">{item.name}</p><p className="mt-0.5 text-xs text-muted-foreground">{item.code}</p></TableCell><TableCell className="min-w-36"><p className="font-medium">{item.borrower}</p><p className="mt-0.5 text-xs text-muted-foreground">{item.location}</p></TableCell><TableCell className="min-w-36 text-muted-foreground">{item.purpose}</TableCell><TableCell className="min-w-32 font-medium">{item.returnDate}</TableCell><TableCell><StatusBadge status={item.status} /></TableCell><TableCell><Button variant="ghost" size="icon-sm" className="rounded-lg"><MoreHorizontal className="size-4" /><span className="sr-only">Opsi</span></Button></TableCell></TableRow>)}</TableBody></Table></CardContent></Card>;
}