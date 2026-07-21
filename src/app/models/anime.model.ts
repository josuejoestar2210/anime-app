export interface StreamServer {
  server: string;
  url: string;
}

export interface EpisodeStreams {
  sub: StreamServer[];
  dub: StreamServer[];
}

export interface EpisodeInfo {
  id: number | null;
  episode: number;
  title: string;
  season: number | null;
  variants: { SUB: number; DUB: number };
  publishedAt: string | null;
  servers: EpisodeStreams;
  source: string;
}

export interface EpisodeInfoResponse {
  success: boolean;
  data: EpisodeInfo;
  source: string;
}

export interface Genre {
  id: number | null;
  name: string;
  slug: string;
  malId?: number | null;
}

export interface Episode {
  number?: number;
  title?: string;
  url: string;
  image?: string | null;
}

export interface AnimeInfo {
  id: number;
  title: string;
  titleJapanese: string | null;
  description: string | null;
  image: string | null;
  backdrop: string | null;
  status: string | null;
  type: string | null;
  year: string | null;
  startDate: string | null;
  endDate: string | null;
  score: number | null;
  totalEpisodes: number | null;
  genres: Genre[];
  episodes: Episode[];
  url: string;
}

export interface AnimeInfoResponse {
  success: boolean;
  data: AnimeInfo;
  source: string;
}

// Lo que ya tenías para la búsqueda
export interface Anime {
  id: string;
  title: string;
  slug: string;
  url: string;
  image: string | null;
  backdrop: string | null;
  type: string | null;
  score: number | null;
  status: string | null;
  year: string | null;
  provider: string;
}

export interface AnimeSearchResponse {
  success: boolean;
  data: {
    results: Anime[];
  };
}