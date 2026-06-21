import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const { data, error } = await supabase
        .from("snippets_page_settings")
        .select("*")
        .limit(1)
        .single();

    if (error) {
        // PGRST116 = no rows returned, 42P01 = table does not exist yet
        if (error.code === "PGRST116" || error.code === "42P01") {
            return NextResponse.json({
                hero_title: "Snippet Gallery",
                hero_subtitle: "Curated Reusable Code Gallery",
                hero_value_prop: "A comprehensive vault of reusable code fragments and helper utilities built to optimize workflow efficiency, speed up development, and maintain high standards of code quality.",
                hero_image_url: "/assets/projectHeader.jpg"
            });
        }
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

    // Remove protected fields
    const { id, created_at, updated_at, ...updateData } = body;

    // Try to find existing settings
    const { data: existing } = await supabase
        .from("snippets_page_settings")
        .select("id")
        .limit(1)
        .single();

    let result;
    if (existing) {
        result = await supabase
            .from("snippets_page_settings")
            .update(updateData)
            .eq("id", existing.id)
            .select();
    } else {
        result = await supabase
            .from("snippets_page_settings")
            .insert([updateData])
            .select();
    }

    if (result.error) {
        return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json(result.data[0]);
}
