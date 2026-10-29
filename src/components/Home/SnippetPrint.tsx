"use client";

import { ReactNode, useState } from "react";
import { Snippet, getPrintUrl } from "@/app/snippets/snippetCode";

/**
 * The snippet's demo as a still print (see getPrintUrl). If no print exists yet, e.g. a
 * snippet added in admin without a preview image, it falls back to whatever live preview
 * the caller passes in.
 */
export default function SnippetPrint({ snippet, fallback }: { snippet: Snippet; fallback: ReactNode }) {
    const src = getPrintUrl(snippet);
    const [broken, setBroken] = useState<string | null>(null);
    if (broken === src) return <>{fallback}</>;
    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={src}
            alt=""
            draggable={false}
            decoding="sync"
            onError={() => setBroken(src)}
            style={{ display: "block", width: "100%", aspectRatio: "1200 / 630", objectFit: "cover", background: "#f4f7fa" }}
        />
    );
}
