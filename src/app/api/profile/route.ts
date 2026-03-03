import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const { data, error } = await supabase
        .from("profile")
        .select("*")
        .limit(1)
        .single();

    if (error && error.code !== "PGRST116") {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || {});
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
