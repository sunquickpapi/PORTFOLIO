import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    // Debug: check if env vars are available
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!hasUrl || !hasKey) {
        return NextResponse.json({ 
            error: "Missing environment variables",
            hasUrl,
            hasKey,
            urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) || "NOT SET"
        }, { status: 500 });
    }

    try {
        const { data, error } = await supabase
            .from("profile")
            .select("*")
            .limit(1)
            .single();

        if (error && error.code !== "PGRST116") {
            return NextResponse.json({ error: error.message, code: error.code, details: error.details }, { status: 500 });
        }

        return NextResponse.json(data || {});
    } catch (err: any) {
        return NextResponse.json({ error: err.message, stack: err.stack?.substring(0, 200) }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Try to find existing profile
    const { data: existing } = await supabase
        .from("profile")
        .select("id")
        .limit(1)
        .single();

    let result;
    if (existing) {
        result = await supabase
            .from("profile")
            .update(body)
            .eq("id", existing.id)
            .select();
    } else {
        result = await supabase
            .from("profile")
            .insert([body])
            .select();
    }

    if (result.error) {
        return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json(result.data[0]);
}
