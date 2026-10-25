import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { randomBytes } from "crypto";
import { authOptions } from "@/lib/auth";
import { SPOTIFY_SCOPES, spotifyCreds } from "@/lib/spotify";

/** Admin only: starts the one-time "connect my Spotify" sign-in. */
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
