import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 px-8 py-6 dark:border-zinc-800">
      <nav className="mx-auto flex w-full max-w-3xl items-center justify-between">
        <Link href="/" className="font-medium">
          个人作品博客
        </Link>
        <div className="flex gap-4 text-sm">
          <Link href="/about">关于我</Link>
          <Link href="/works">作品</Link>
        </div>
      </nav>
    </header>
  );
}
