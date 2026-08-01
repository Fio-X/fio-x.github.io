import type { Metadata } from "next";
import { LegacyRoute } from "@/components/legacy-route";
import { sitePath } from "@/lib/site-constants";

export const metadata: Metadata = { title: "About moved", robots: { index: false, follow: true }, alternates: { canonical: sitePath("/information") } };
export default function AboutLegacyPage() { return <LegacyRoute target={sitePath("/information")} label="前往 Information" />; }
