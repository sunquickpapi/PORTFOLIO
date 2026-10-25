/**
 * Spotify "now playing" for the site owner's own account.
 *
 * Needs three environment variables (Vercel → Project → Settings → Environment Variables):
 *   SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET  – from the Spotify Developer Dashboard app
 *   SPOTIFY_REFRESH_TOKEN                     – shown once by /api/spotify/login (admin only)
 */
const TOKEN_URL = "https://accounts.spotify.com/api/token";
const NOW_URL = "https://api.spotify.com/v1/me/player/currently-playing";
const RECENT_URL = "https://api.spotify.com/v1/me/player/recently-played?limit=1";

export const SPOTIFY_SCOPES = "user-read-currently-playing user-read-recently-played";

export type NowPlaying = {
    configured: boolean;
    isPlaying: boolean;
    title?: string;
    artist?: string;
    album?: string;
    albumArt?: string;
    url?: string;
    playedAt?: string; // ISO time, for the last-played fallback
};

type SpotifyTrack = {
    name: string;
    artists: { name: string }[];
    album: { name: string; images: { url: string; width: number }[] };
    external_urls: { spotify: string };
};

export function spotifyCreds() {
    const id = process.env.SPOTIFY_CLIENT_ID;
    const secret = process.env.SPOTIFY_CLIENT_SECRET;
    return id && secret ? { id, secret, basic: Buffer.from(`${id}:${secret}`).toString("base64") } : null;
}

// Access tokens last an hour; keep one per server instance instead of asking every request
let cached: { token: string; expires: number } | null = null;

async function accessToken(): Promise<string | null> {
    const creds = spotifyCreds();
    const refresh = process.env.SPOTIFY_REFRESH_TOKEN;
    if (!creds || !refresh) return null;
    if (cached && cached.expires > Date.now() + 60_000) return cached.token;
    const res = await fetch(TOKEN_URL, {
        method: "POST",
        headers: { Authorization: `Basic ${creds.basic}`, "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refresh }),
        cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    cached = { token: data.access_token, expires: Date.now() + data.expires_in * 1000 };
    return cached.token;
}

const pick = (t: SpotifyTrack) => ({
    title: t.name,
    artist: t.artists.map((a) => a.name).join(", "),
    album: t.album.name,
    // smallest image that is still at least 200px wide
    albumArt: [...t.album.images].sort((a, b) => a.width - b.width).find((i) => i.width >= 200)?.url || t.album.images[0]?.url,
    url: t.external_urls.spotify,
});

export async function getNowPlaying(): Promise<NowPlaying> {
    const token = await accessToken();
    if (!token) return { configured: false, isPlaying: false };
    const headers = { Authorization: `Bearer ${token}` };

    const now = await fetch(NOW_URL, { headers, cache: "no-store" });
    if (now.status === 200) {
        const data = await now.json();
        if (data?.item && data.currently_playing_type === "track") {
            return { configured: true, isPlaying: !!data.is_playing, ...pick(data.item as SpotifyTrack) };
        }
    }

    // Nothing playing (204) or a podcast/ad: fall back to the last track played
    const recent = await fetch(RECENT_URL, { headers, cache: "no-store" });
    if (recent.ok) {
        const data = await recent.json();
        const last = data?.items?.[0];
        if (last?.track) return { configured: true, isPlaying: false, playedAt: last.played_at, ...pick(last.track) };
    }
    return { configured: true, isPlaying: false };
}
