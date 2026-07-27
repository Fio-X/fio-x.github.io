import Link from "next/link";
import { SiteShell } from "@/components/site-shell";

export default function NotFound() {
  return <SiteShell><h1>404</h1><p className="empty-state">页面不存在。</p><p className="taxonomy"><Link href="/">返回首页</Link><Link href="/archive">前往目录</Link></p></SiteShell>;
}
