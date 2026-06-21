import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    // Authenticate the admin session
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Path to public/uploads
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        
        // Ensure directory exists recursively
        await mkdir(uploadDir, { recursive: true });

        // Generate unique filename to prevent collisons
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const fileExtension = path.extname(file.name);
        const filename = `${uniqueSuffix}${fileExtension}`;
        const filePath = path.join(uploadDir, filename);

        // Save file
        await writeFile(filePath, buffer);

        // Public static URL path
        const fileUrl = `/uploads/${filename}`;
        return NextResponse.json({ url: fileUrl });
    } catch (error: any) {
        console.error("Upload endpoint error:", error);
        return NextResponse.json({ error: error.message || "Failed to upload file" }, { status: 500 });
    }
}
