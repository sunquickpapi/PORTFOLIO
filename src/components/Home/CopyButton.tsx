"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
    text: string;
}

export default function CopyButton({ text }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy text: ", err);
        }
    };

    return (
        <button
            className={`copy-btn ${copied ? "copied" : ""}`}
            onClick={handleCopy}
            title="Copy to clipboard"
            type="button"
        >
            {copied ? <Check size={18} /> : <Copy size={18} />}
        </button>
    );
}
