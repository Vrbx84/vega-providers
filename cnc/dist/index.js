/**
 * Bolly4u Provider for Vega
 * Base: https://bolly4ux.xyz
 */

const BASE_URL = "https://bolly4ux.xyz";

class Bolly4uProvider {
  constructor() {
    this.name = "Bolly4u";
    this.id = "bolly4u";
    this.types = ["movie", "tv"];
  }

  // Home Screen / Latest Posts
  async catalog() {
    try {
      const res = await fetch(BASE_URL);
      const html = await res.text();
      return this.parsePosts(html);
    } catch (e) {
      return [];
    }
  }

  // Search
  async search(query) {
    try {
      const res = await fetch(`${BASE_URL}/?s=${encodeURIComponent(query)}`);
      const html = await res.text();
      return this.parsePosts(html);
    } catch (e) {
      return [];
    }
  }

  // HTML se movie cards extract karna
  parsePosts(html) {
    const results = [];
    const articleRegex = /<article[\s\S]*?href="(https:\/\/bolly4ux\.xyz\/[^"]+)"[\s\S]*?title="([^"]+)"[\s\S]*?src="([^"]+)"/g;
    let match;

    while ((match = articleRegex.exec(html)) !== null) {
      results.push({
        id: match[1],
        title: match[2].replace(/&#8211;/g, "-").replace(/&#038;/g, "&"),
        poster: match[3],
        type: match[2].toLowerCase().includes("season") ? "tv" : "movie"
      });
    }
    return results;
  }

  // Movie Details & Links
  async detail(url) {
    try {
      const res = await fetch(url);
      const html = await res.text();

      const titleMatch = html.match(/<h1 class="entry-title"[^>]*>([^<]+)<\/h1>/);
      const imgMatch = html.match(/<div class="entry-content"[\s\S]*?src="([^"]+)"/);
      const descMatch = html.match(/<p>[\s\S]*?(Plot|Story|Synopsis):?([\s\S]*?)<\/p>/i);

      // Download / Watch links parse karna
      const linkRegex = /<a[\s\S]*?href="(https?:\/\/[^"]+)"[^>]*>(Watch Online|Download|HubCloud|Fast Server|GDToT|Drive)<\/a>/gi;
      const episodes = [];
      let lMatch;
      let count = 1;

      while ((lMatch = linkRegex.exec(html)) !== null) {
        episodes.push({
          id: lMatch[1],
          title: `${lMatch[2]} Server ${count++}`,
          season: 1,
          number: count
        });
      }

      return {
        id: url,
        title: titleMatch ? titleMatch[1].trim() : "Movie",
        poster: imgMatch ? imgMatch[1] : "",
        description: descMatch ? descMatch[2].replace(/<[^>]+>/g, "").trim() : "",
        type: "movie",
        episodes: episodes.length > 0 ? episodes : [{ id: url, title: "Play", season: 1, number: 1 }]
      };
    } catch (e) {
      return null;
    }
  }

  // Final Stream URL Resolver
  async sources(linkUrl) {
    try {
      return {
        streams: [
          {
            url: linkUrl,
            quality: "HD",
            isM3U8: linkUrl.includes(".m3u8"),
            headers: {
              "Referer": BASE_URL,
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
          }
        ],
        subtitles: []
      };
    } catch (e) {
      return { streams: [], subtitles: [] };
    }
  }
}

const instance = new Bolly4uProvider();
export default instance;
if (typeof module !== "undefined") {
  module.exports = instance;
}
