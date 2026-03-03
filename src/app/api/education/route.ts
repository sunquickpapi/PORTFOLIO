import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    // Try to fetch with activities join first
    const { data: joinedData, error: joinError } = await supabase
        .from("education")
        .select(`
            *,
            activities:education_activities(*)
        `)
        .order("created_at", { ascending: false });

    if (!joinError) {
        return NextResponse.json(joinedData);
    }

    // Fallback: fetch without activities if join fails (relationship issue)
    console.warn("Education join failed, falling back to simple fetch:", joinError.message);
    const { data: simpleData, error: simpleError } = await supabase
        .from("education")
        .select("*")
        .order("created_at", { ascending: false });

    if (simpleError) {
        return NextResponse.json({ error: simpleError.message }, { status: 500 });
    }

    return NextResponse.json(simpleData || []);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { data, error } = await supabase.from("education").insert([body]).select();

    if (error) {
        console.error("Education POST error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data[0]);
}
