import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="space-y-4 p-8">
      <h1 className="text-3xl font-semibold">关于我</h1>
      <p>这是我的个人作品博客。</p>
      <Link href="/">返回首页</Link>
    </main>
  );
}
