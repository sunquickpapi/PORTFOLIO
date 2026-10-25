import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { randomBytes } from "crypto";
import { authOptions } from "@/lib/auth";
import { SPOTIFY_SCOPES, spotifyCreds } from "@/lib/spotify";

/** Admin only: starts the one-time "connect my Spotify" sign-in. */
export async function GET(req: Request) {
    const here = new URL(req.url);
    // Always run on the www address: the admin sign-in and the Spotify redirect URI both live there
    const host = here.hostname;
    const local = host === "localhost" || host === "127.0.0.1" || host.endsWith(".vercel.app");
    if (!local && !host.startsWith("www.")) {
        return NextResponse.redirect(`https://www.${host}${here.pathname}`);
    }
    const session = await getServerSession(authOptions);
    if (!session) {
        // not signed in: go sign in to the admin, then come straight back here
        return NextResponse.redirect(new URL(`/admin/login?callbackUrl=${encodeURIComponent(here.pathname)}`, here.origin));
    }
    const creds = spotifyCreds();
    if (!creds) return NextResponse.json({ error: "Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET first." }, { status: 400 });

    const origin = new URL(req.url).origin;
    const state = randomBytes(16).toString("hex");
    const auth = new URL("https://accounts.spotify.com/authorize");
    auth.search = new URLSearchParams({
        response_type: "code",
        client_id: creds.id,
        scope: SPOTIFY_SCOPES,
        redirect_uri: `${origin}/api/spotify/callback`,
        state,
    }).toString();

    const res = NextResponse.redirect(auth.toString());
    res.cookies.set("spotify_state", state, { httpOnly: true, secure: origin.startsWith("https"), sameSite: "lax", maxAge: 600, path: "/" });
    return res;
}
