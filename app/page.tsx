import { SiteNav } from "@/components/site-nav";
import { homeNavItems, SITE_NAME } from "@/lib/site";

export default function Home() {
  return <main data-surface="home" className="home-page"><div className="home-identity"><h1>{SITE_NAME}</h1><p>在七月听一首《六月船歌》</p></div><div className="home-navigation"><SiteNav items={homeNavItems()} /></div></main>;
}
