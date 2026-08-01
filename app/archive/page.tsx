import type { Metadata } from "next";
import { LegacyRoute } from "@/components/legacy-route";
import { sitePath } from "@/lib/site-constants";

export const metadata: Metadata = { title: "Archive moved", robots: { index: false, follow: true }, alternates: { canonical: sitePath("/news") } };
export default function ArchiveLegacyPage() { return <LegacyRoute target={sitePath("/news")} label="前往 News" />; }
