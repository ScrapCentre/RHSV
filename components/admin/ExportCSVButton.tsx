"use client"

import { Download } from "lucide-react"

interface ExportCSVButtonProps {
    headers: string[]
    rows: string[][]
    filename: string
}

export default function ExportCSVButton({ headers, rows, filename }: ExportCSVButtonProps) {
    const handleDownload = () => {
        if (rows.length === 0) return

        const csvString = [
            headers.join(","),
            ...rows.map(row => row.map(cell => `"${(cell || "").replace(/"/g, '""')}"`).join(","))
        ].join("\n")

        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)

        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", filename)
        link.style.visibility = 'hidden'

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <button
            onClick={handleDownload}
            disabled={rows.length === 0}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <Download className="w-4 h-4" />
            Download Excel
        </button>
    )
}
