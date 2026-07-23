"use client";

import Image from "next/image";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type ImageUploadFieldProps = {
  file: File | null;
  onChange: (file: File | null) => void;
  required?: boolean;
};

export function ImageUploadField({ file, onChange, required = false }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(() => file ? URL.createObjectURL(file) : null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const replacePreview = (nextFile: File | null) => {
    setPreviewUrl(nextFile ? URL.createObjectURL(nextFile) : null);
    onChange(nextFile);
  };

  const selectFile = (nextFile: File | null) => {
    if (!nextFile || !nextFile.type.startsWith("image/")) return;
    if (nextFile.size > 5 * 1024 * 1024) return;
    replacePreview(nextFile);
  };

  if (previewUrl && file) {
    return <div className="overflow-hidden rounded-xl border bg-muted/30"><Image src={previewUrl} alt="Preview dokumentasi" width={800} height={480} unoptimized className="h-48 w-full object-cover" /><div className="flex items-center justify-between gap-3 p-3"><p className="min-w-0 truncate text-sm text-muted-foreground">{file.name}</p><Button type="button" variant="ghost" size="sm" onClick={() => replacePreview(null)}><Trash2 />Hapus</Button></div></div>;
  }

  return <button type="button" onClick={() => inputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={(event) => { event.preventDefault(); setIsDragging(false); selectFile(event.dataTransfer.files[0] ?? null); }} className={`grid min-h-44 w-full place-items-center rounded-xl border-2 border-dashed p-5 text-center transition ${isDragging ? "border-primary bg-primary/5" : "border-primary/40 bg-muted/30 hover:border-primary hover:bg-primary/5"}`}><input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="sr-only" onChange={(event) => selectFile(event.target.files?.[0] ?? null)} /><span><span className="mx-auto grid size-11 place-items-center rounded-full bg-primary/10 text-primary"><ImagePlus className="size-5" /></span><span className="mt-3 block text-sm font-semibold">Pilih file atau seret & letakkan</span><span className="mt-1 block text-xs text-muted-foreground">JPG, PNG, atau WEBP - maksimal 5 MB{required ? " - wajib" : ""}</span><span className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-primary"><Upload className="size-3.5" />Pilih gambar</span></span></button>;
}