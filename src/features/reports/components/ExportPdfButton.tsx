"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExportPdfButton() {
  const handleExport = () => {
    window.print();
  };

  return (
    <Button
      onClick={handleExport}
      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-200 transition-all hover:shadow-lg hover:-translate-y-0.5 print:hidden"
    >
      <Download size={15} />
      Export Laporan PDF
    </Button>
  );
}
