import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { spotifyCreds } from "@/lib/spotify";

const page = (body: string) =>
    new NextResponse(
        `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Spotify connected</title>
<body style="font-family:system-ui,sans-serif;max-width:640px;margin:48px auto;padding:0 16px;color:#0d2a42;line-height:1.55">${body}</body>`,
        { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } }
    );

/** Admin only: Spotify sends the owner back here; we swap the code for a long-lived refresh token and show it once. */
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const creds = spotifyCreds();
    if (!creds) return page("<h2>Spotify keys missing</h2><p>Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET first.</p>");

    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const jar = await cookies();
    if (!code || !state || state !== jar.get("spotify_state")?.value) {
        return page(`<h2>Couldn't connect</h2><p>${url.searchParams.get("error") || "The sign-in expired or didn't match. Try again from /api/spotify/login."}</p>`);
    }
    jar.delete("spotify_state");

    const res = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { Authorization: `Basic ${creds.basic}`, "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: `${url.origin}/api/spotify/callback` }),
        cache: "no-store",
    });
    const data = await res.json();
    if (!res.ok || !data.refresh_token) return page(`<h2>Couldn't connect</h2><p>${data.error_description || data.error || "Unknown error"}</p>`);

    return page(`<h2>Spotify connected ✓</h2>
<p>Copy this refresh token into Vercel → Settings → Environment Variables as <b>SPOTIFY_REFRESH_TOKEN</b>, then redeploy. Keep it private.</p>
<textarea readonly onclick="this.select()" style="width:100%;height:120px;font:13px ui-monospace,monospace;padding:10px;border-radius:8px;border:1px solid #c9d4da">${data.refresh_token}</textarea>`);
}
