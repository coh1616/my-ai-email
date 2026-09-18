import Parser from "rss-parser";

const RSS_FEEDS = [
  { source: "iThome", url: "https://www.ithome.com.tw/rss" },
  { source: "TechCrunch", url: "https://techcrunch.com/feed/" },
];

const ITEMS_PER_FEED = 5;

const parser = new Parser();

export async function getTodayTechNews() {
  const results = await Promise.all(
    RSS_FEEDS.map(async ({ source, url }) => {
      const feed = await parser.parseURL(url);
      return feed.items.slice(0, ITEMS_PER_FEED).map((item) => ({
        source,
        title: item.title,
        link: item.link,
        publishedAt: item.pubDate ?? null,
      }));
    })
  );

  return results.flat();
}
