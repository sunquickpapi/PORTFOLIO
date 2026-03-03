import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    // Omit protected/generated fields
    const { id: _, created_at, updated_at, education_id, ...updateData } = body;

    const { data, error } = await supabase
        .from("education_activities")
        .update(updateData)
        .eq("id", id)
        .select();

    if (error) {
        console.error(`Activity PUT error for ID ${id}:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data[0]);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { error } = await supabase.from("education_activities").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ message: "Activity deleted" });
}
