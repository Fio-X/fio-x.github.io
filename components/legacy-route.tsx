"use client";

import { useEffect } from "react";
import Link from "next/link";

export function LegacyRoute({ target, label }: { target: string; label: string }) {
  useEffect(() => { window.location.replace(target); }, [target]);
  return <main className="legacy-route"><h1>页面已迁移</h1><p>此入口已移动到 Information。</p><Link href={target}>{label}</Link></main>;
}
