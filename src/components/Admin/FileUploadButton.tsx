"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";

type Props = {
    /** Called with the public URL(s) of the uploaded file(s). */
    onUploaded: (urls: string[]) => void;
    /** HTML accept attribute, e.g. "image/*" or "application/pdf,image/*". */
    accept?: string;
    /** Allow picking several files at once (e.g. gallery images). */
    multiple?: boolean;
    label?: string;
    /** Current value; when it is an image URL a small thumbnail is shown. */
    previewUrl?: string;
};

async function uploadOne(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(
            res.status === 413
                ? `${file.name} is too large to upload.`
                : data.error || `Failed to upload ${file.name}`
        );
    }
    return data.url as string;
}

const IMAGE_RE = /\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/i;

export default function FileUploadButton({
    onUploaded,
    accept = "image/*",
    multiple = false,
    label = "Add from file",
    previewUrl,
}: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setError(null);
        const list = Array.from(files);
        const urls: string[] = [];
        try {
            for (let i = 0; i < list.length; i++) {
                setBusy(list.length > 1 ? `Uploading ${i + 1} of ${list.length}...` : "Uploading...");
                urls.push(await uploadOne(list[i]));
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed");
        } finally {
            if (urls.length) onUploaded(urls);
            setBusy(null);
            if (inputRef.current) inputRef.current.value = "";
        }
    };

    const showThumb = previewUrl && !previewUrl.includes(",") && IMAGE_RE.test(previewUrl.trim());

    return (
        <div className="fub-wrap">
            <label className={`fub-btn ${busy ? "is-busy" : ""}`}>
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    disabled={!!busy}
                    style={{ display: "none" }}
                    onChange={(e) => handleFiles(e.target.files)}
                />
                {busy ? (
                    <>
                        <span className="fub-spinner" />
                        {busy}
                    </>
                ) : (
                    <>
                        <Upload size={13} />
                        {label}
                    </>
                )}
            </label>

            {showThumb && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl!.trim()} alt="" className="fub-thumb" />
            )}

            {error && <span className="fub-error">{error}</span>}

            <style jsx>{`
                .fub-wrap {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                    margin-top: 0.5rem;
                }
                .fub-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    cursor: pointer;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #1b4f72;
                    background: rgba(27, 79, 114, 0.06);
                    padding: 0.4rem 0.85rem;
                    border-radius: 8px;
                    border: 1px solid rgba(27, 79, 114, 0.1);
                    transition: all 0.2s ease;
                    user-select: none;
                }
                .fub-btn:hover {
                    background: rgba(27, 79, 114, 0.12);
                    border-color: rgba(27, 79, 114, 0.25);
                }
                .fub-btn.is-busy {
                    cursor: progress;
                    opacity: 0.8;
                }
                :global(.admin-dark-mode) .fub-btn {
                    color: #38bdf8;
                    background: rgba(56, 189, 248, 0.06);
                    border-color: rgba(56, 189, 248, 0.1);
                }
                :global(.admin-dark-mode) .fub-btn:hover {
                    background: rgba(56, 189, 248, 0.12);
                    border-color: rgba(56, 189, 248, 0.25);
                }
                .fub-thumb {
                    height: 36px;
                    max-width: 64px;
                    object-fit: cover;
                    border-radius: 6px;
                    border: 1px solid rgba(27, 79, 114, 0.15);
                }
                .fub-error {
                    font-size: 0.72rem;
                    font-weight: 600;
                    color: #ef4444;
                }
                .fub-spinner {
                    width: 12px;
                    height: 12px;
                    border: 2px solid rgba(27, 79, 114, 0.2);
                    border-top-color: currentColor;
                    border-radius: 50%;
                    animation: fub-spin 0.8s linear infinite;
                    display: inline-block;
                }
                @keyframes fub-spin {
                    to {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
        </div>
    );
}
