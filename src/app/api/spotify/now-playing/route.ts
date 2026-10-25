import { NextResponse } from "next/server";
import { getNowPlaying } from "@/lib/spotify";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const data = await getNowPlaying();
        // brief CDN cache so many visitors don't each hit Spotify
        return NextResponse.json(data, { headers: { "Cache-Control": "public, s-maxage=20, stale-while-revalidate=40" } });
    } catch {
        return NextResponse.json({ configured: true, isPlaying: false }, { status: 200 });
    }
}
