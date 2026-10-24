"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import ImageCropper from "./ImageCropper";

type Props = {
    /** Called with the public URL(s) of the uploaded file(s). */
    onUploaded: (urls: string[]) => void;
    /** HTML accept attribute, e.g. "image/*" or "application/pdf,image/*". */
    accept?: string;
    /** Allow picking several files at once (e.g. gallery images). */
    multiple?: boolean;
    label?: string;
    /** Current value; when it is an image URL a preview is shown. */
    previewUrl?: string;
    /** Open the crop window for images before uploading (default true). */
    crop?: boolean;
    /** Starting aspect ratio in the crop window (width / height). null = Original. */
    aspect?: number | null;
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
// SVGs are vector and GIFs may be animated: cropping would flatten them, so upload those as-is
const isCroppable = (f: File) => f.type.startsWith("image/") && !/svg|gif/.test(f.type);

type CropRequest = { file: File; progress?: string; resolve: (f: File | null) => void };

export default function FileUploadButton({
    onUploaded,
    accept = "image/*",
    multiple = false,
    label = "Add from file",
    previewUrl,
    crop = true,
    aspect = null,
}: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [cropReq, setCropReq] = useState<CropRequest | null>(null);

    /** Shows the crop window; resolves with the file to upload, or null if cancelled. */
    const askCrop = (file: File, progress?: string) =>
        new Promise<File | null>((resolve) => setCropReq({ file, progress, resolve }));

    const finishCrop = (result: File | null) => {
        cropReq?.resolve(result);
        setCropReq(null);
    };

    const handleFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setError(null);
        const list = Array.from(files);
        const urls: string[] = [];
        try {
            for (let i = 0; i < list.length; i++) {
                let file: File | null = list[i];
                const progress = list.length > 1 ? `${i + 1} of ${list.length}` : undefined;
                if (crop && isCroppable(file)) {
                    setBusy("Cropping...");
                    file = await askCrop(file, progress);
                    if (!file) continue; // cancelled this one
                }
                setBusy(list.length > 1 ? `Uploading ${i + 1} of ${list.length}...` : "Uploading...");
                urls.push(await uploadOne(file));
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed");
        } finally {
            if (urls.length) onUploaded(urls);
            setBusy(null);
            if (inputRef.current) inputRef.current.value = "";
        }
    };

    const current = previewUrl?.trim() || "";
    const showThumb = current && !current.includes(",") && IMAGE_RE.test(current);

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
                <a href={current} target="_blank" rel="noopener noreferrer" className="fub-thumb-link" title="Open full image">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={current} alt="Current image" className="fub-thumb" />
                    <span className="fub-thumb-label">Preview</span>
                </a>
            )}

            {error && <span className="fub-error">{error}</span>}

            {cropReq && (
                <ImageCropper
                    file={cropReq.file}
                    aspect={aspect}
                    progress={cropReq.progress}
                    onCancel={() => finishCrop(null)}
                    onSkip={() => finishCrop(cropReq.file)}
                    onConfirm={(f) => finishCrop(f)}
                />
            )}

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
                .fub-thumb-link {
                    position: relative;
                    display: inline-block;
                    border-radius: 10px;
                    overflow: hidden;
                    border: 1px solid rgba(27, 79, 114, 0.15);
                    line-height: 0;
                }
                .fub-thumb {
                    height: 56px;
                    max-width: 120px;
                    object-fit: cover;
                    display: block;
                    background: repeating-conic-gradient(#eef2f6 0% 25%, #fff 0% 50%) 50% / 12px 12px;
                }
                .fub-thumb-label {
                    position: absolute;
                    inset: auto 0 0 0;
                    padding: 2px 0;
                    font-size: 0.6rem;
                    font-weight: 700;
                    line-height: 1.4;
                    text-align: center;
                    color: #fff;
                    background: rgba(8, 20, 32, 0.55);
                    opacity: 0;
                    transition: opacity 0.2s ease;
                }
                .fub-thumb-link:hover .fub-thumb-label {
                    opacity: 1;
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
