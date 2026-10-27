import { NextResponse } from "next/server";

// GitHub contribution calendar for the homepage telemetry card.
// Uses GITHUB_TOKEN (classic, read:user) on the server only; cached for an hour.
export const revalidate = 3600;

const QUERY = `query {
  viewer {
    login
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { contributionCount date } }
      }
    }
  }
}`;

export async function GET() {
    const token = process.env.GITHUB_TOKEN;
    if (!token) return NextResponse.json({ error: "GITHUB_TOKEN not set" }, { status: 503 });
    try {
        const res = await fetch("https://api.github.com/graphql", {
            method: "POST",
            headers: { Authorization: `bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ query: QUERY }),
            next: { revalidate: 3600 },
        });
        if (!res.ok) return NextResponse.json({ error: `GitHub ${res.status}` }, { status: 502 });
        const json = await res.json();
        const v = json?.data?.viewer;
        const cal = v?.contributionsCollection?.contributionCalendar;
        if (!cal) return NextResponse.json({ error: "No data" }, { status: 502 });
        const days: { date: string; count: number }[] = cal.weeks.flatMap((w: { contributionDays: { date: string; contributionCount: number }[] }) =>
            w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount }))
        );
        // current streak: consecutive days with contributions ending today (or yesterday)
        let streak = 0;
        let i = days.length - 1;
        if (i >= 0 && days[i].count === 0) i--; // today may not have any yet
        for (; i >= 0 && days[i].count > 0; i--) streak++;
        const weeks: number[][] = cal.weeks.map((w: { contributionDays: { contributionCount: number }[] }) => w.contributionDays.map((d) => d.contributionCount));
        return NextResponse.json(
            { login: v.login, total: cal.totalContributions, streak, weeks, firstDate: days[0]?.date },
            { headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" } }
        );
    } catch {
        return NextResponse.json({ error: "Fetch failed" }, { status: 502 });
    }
}
