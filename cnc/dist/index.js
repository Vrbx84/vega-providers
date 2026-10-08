const BASE_URL = "https://api.consumet.org/movies/flixhq";

class CNCProvider {
  constructor() {
    this.name = "CNC Movies & Shows";
    this.id = "cnc-movies";
    this.types = ["movie", "tv"];
  }

  async catalog() {
    try {
      const res = await fetch(`${BASE_URL}/trending`);
      const data = await res.json();
      return (data.results || []).map((item) => ({
        id: item.id,
        title: item.title,
        poster: item.image,
        type: item.type === "Movie" ? "movie" : "tv",
        releaseDate: item.releaseDate || ""
      }));
    } catch (e) {
      return [];
    }
  }

  async search(query) {
    try {
      const res = await fetch(`${BASE_URL}/${encodeURIComponent(query)}`);
      const data = await res.json();
      return (data.results || []).map((item) => ({
        id: item.id,
        title: item.title,
        poster: item.image,
        type: item.type === "Movie" ? "movie" : "tv",
        releaseDate: item.releaseDate || ""
      }));
    } catch (e) {
      return [];
    }
  }

  async detail(id) {
    try {
      const res = await fetch(`${BASE_URL}/info?id=${encodeURIComponent(id)}`);
      const data = await res.json();
      return {
        id: data.id,
        title: data.title,
        poster: data.image,
        description: data.description || "",
        genres: data.genres || [],
        type: data.type === "Movie" ? "movie" : "tv",
        episodes: (data.episodes || []).map((ep) => ({
          id: ep.id,
          title: ep.title || `Episode ${ep.number}`,
          season: ep.season || 1,
          number: ep.number || 1
        }))
      };
    } catch (e) {
      return null;
    }
  }

  async sources(episodeId, mediaId) {
    try {
      const target = mediaId || episodeId;
      const res = await fetch(`${BASE_URL}/watch?episodeId=${encodeURIComponent(episodeId)}&mediaId=${encodeURIComponent(target)}`);
      const data = await res.json();

      return {
        streams: (data.sources || []).map((s) => ({
          url: s.url,
          quality: s.quality || "auto",
          isM3U8: s.isM3U8 || s.url.includes(".m3u8"),
          headers: { "Referer": "https://flixhq.to/" }
        })),
        subtitles: (data.subtitles || []).map((sub) => ({
          url: sub.url,
          lang: sub.lang || "English"
        }))
      };
    } catch (e) {
      return { streams: [], subtitles: [] };
    }
  }
}

const instance = new CNCProvider();
export default instance;
if (typeof module !== "undefined") {
  module.exports = instance;
}
