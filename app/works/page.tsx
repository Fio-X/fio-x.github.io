type Work = {
  title: string;
  description: string;
};

const works: Work[] = [
  {
    title: "个人作品博客",
    description: "使用 Next.js 和 Tailwind CSS 构建的静态网站。",
  },
  {
    title: "试验性记录。",
    description: "关于颜色对比实验的记录。",
  },
];

export default function WorksPage() {
  return (
    <main className="space-y-4 p-8">
      <h1 className="text-3xl font-semibold">作品</h1>
      {works.map((work) => (
        <article key={work.title}>
          <h2>{work.title}</h2>
          <p>{work.description}</p>
        </article>
      ))}
    </main>
  );
}
