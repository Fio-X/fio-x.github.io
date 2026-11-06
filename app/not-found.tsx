import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { sitePath } from "@/lib/site-constants";

export default function NotFound() {
  return <SiteShell><h1 className="page-title">404</h1><p className="empty-state">页面不存在。</p><p className="taxonomy"><Link href={sitePath("/")}>返回首页</Link><Link href={sitePath("/news")}>前往 News</Link></p></SiteShell>;
}
