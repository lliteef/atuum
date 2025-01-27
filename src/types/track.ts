export interface Track {
  id: string;
  title: string;
  version?: string;
  isrc?: string;
  autoAssignIsrc: boolean;
  lyricsLanguage: string;
  explicitContent: "None" | "Explicit" | "Clean";
  lyrics?: string;
  primaryArtists: string[];
  featuredArtists: string[];
  remixers: string[];
  songwriters: string[];
  producers: string[];
  additionalContributors: {
    role: string;
    names: string[];
    currentName?: string;
  }[];
  pLine: string;
  audioUrl?: string;
  audioFilename?: string;
}