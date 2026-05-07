import type { Metadata } from "next"
import PartnerClientLayout from "@/components/PartnerClientLayout"

export const metadata: Metadata = {
    title: "B2B Partner Portal | ScrapCentre India",
    description: "Dedicated portal for ScrapCentre business partners. Secure access to marketplace, data entry, and logistics management.",
    robots: {
        index: false,
        follow: false,
    }
}

export default function B2BLayout({ children }: { children: React.ReactNode }) {
    return <PartnerClientLayout>{children}</PartnerClientLayout>
}
