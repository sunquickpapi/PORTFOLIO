"use client";

import Link from "next/link";
import { Courier_Prime } from "next/font/google";

const courier = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });

/**
 * A paper "file" slip link, the same look as the hero's "More About My Journey":
 * a kicker (FILE:: N°xx), a title and a pill chip, with a page peeking out behind.
 */
export default function FileLink({
    href,
    no,
    title,
    chip = "OPEN",
    className = "",
}: {
    href: string;
    no: string;
    title: string;
    chip?: string;
    className?: string;
}) {
    return (
        <Link href={href} className={`hero-journey file-link ${className}`}>
            <span className="hj-page" aria-hidden="true" />
            <span className="hj-slip">
                <span className="hj-text">
                    <span className={`hj-kicker ${courier.className}`}>FILE:: N°{no}</span>
                    <span className="hj-title">{title}</span>
                </span>
                <span className={`hj-chip ${courier.className}`}>
                    {chip} <span className="hj-arrow" aria-hidden="true">→</span>
                </span>
            </span>
        </Link>
    );
}
