"use client";

import { useEffect, useRef } from "react";

/**
 * Hero background: a quiet grid of square pixels (same chunky feel as the pass card's
 * pixel-art sprite). Pixels near the cursor light up in sky blue and grow a step.
 * Clicking anywhere in the hero drops a "water drop": a ripple rolls out from the
 * click to the edges of the screen, nudging and lighting the pixels as it passes.
 * Only animates while something is moving; pauses off-screen and for reduced motion.
 */
const GAP = 14; // grid spacing (css px)
const BASE = 2; // resting pixel size (css px)
const SPOT = 170; // cursor spotlight radius (css px)
const RIPPLE_MS = 2300;
const BAND = 46; // ripple ring thickness (css px)

type Ripple = { x: number; y: number; t0: number; max: number };

export default function PixelField() {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const cv = ref.current;
        const host = cv?.parentElement;
        if (!cv || !host) return;
        const ctx = cv.getContext("2d");
        if (!ctx) return;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        let w = 0;
        let h = 0;
        let dpr = 1;
        const size = () => {
            const r = host.getBoundingClientRect();
            dpr = Math.min(2, window.devicePixelRatio || 1);
            w = r.width;
            h = r.height;
            cv.width = Math.round(w * dpr);
            cv.height = Math.round(h * dpr);
            cv.style.width = `${w}px`;
            cv.style.height = `${h}px`;
            wake();
        };

        // cursor (eased) and ripples
        const target = { x: -9999, y: -9999, on: false };
        const cur = { x: -9999, y: -9999, a: 0 };
        const ripples: Ripple[] = [];
        let raf = 0;
        let visible = true;

        const isDark = () => document.documentElement.classList.contains("dark");

        const frame = (now: number) => {
            raf = 0;
            const dark = isDark();
            const ink = dark ? "233,244,250" : "27,79,114"; // navy at rest (white-ish in dark)
            const sky = dark ? "120,200,236" : "58,153,201";
            const restA = dark ? 0.1 : 0.13;

            // ease the spotlight toward the cursor and fade it in/out
            if (target.on) {
                if (cur.a === 0) {
                    cur.x = target.x;
                    cur.y = target.y;
                }
                cur.x += (target.x - cur.x) * 0.18;
                cur.y += (target.y - cur.y) * 0.18;
            }
            cur.a += ((target.on ? 1 : 0) - cur.a) * 0.12;
            if (cur.a < 0.002) cur.a = 0;

            // live ripples
            for (let i = ripples.length - 1; i >= 0; i--) if (now - ripples[i].t0 > RIPPLE_MS) ripples.splice(i, 1);
            const rs = ripples.map((r) => {
                const p = (now - r.t0) / RIPPLE_MS;
                const e = 1 - Math.pow(1 - p, 2.2); // decelerating, like water
                return { x: r.x, y: r.y, rad: e * r.max, str: Math.pow(1 - p, 0.7), p };
            });

            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, cv.width, cv.height);
            const off = (GAP - BASE) / 2;
            for (let gy = off; gy < h; gy += GAP) {
                for (let gx = off; gx < w; gx += GAP) {
                    let k = 0; // highlight 0..1
                    let dx = 0;
                    let dy = 0;
                    if (cur.a > 0) {
                        const d = Math.hypot(gx - cur.x, gy - cur.y);
                        if (d < SPOT) k = Math.max(k, (1 - d / SPOT) ** 1.6 * cur.a);
                    }
                    for (const r of rs) {
                        const vx = gx - r.x;
                        const vy = gy - r.y;
                        const d = Math.hypot(vx, vy) || 1;
                        // main ring + a softer trailing ring
                        const a1 = Math.exp(-(((d - r.rad) / BAND) ** 2));
                        const a2 = 0.45 * Math.exp(-(((d - r.rad * 0.72) / (BAND * 0.8)) ** 2));
                        const amp = (a1 + a2) * r.str;
                        if (amp > 0.02) {
                            k = Math.max(k, Math.min(1, amp));
                            const push = 7 * a1 * r.str - 3 * a2 * r.str; // crest pushes out, trough pulls back
                            dx += (vx / d) * push;
                            dy += (vy / d) * push;
                        }
                        // the drop itself: a brief splash at the centre
                        if (r.p < 0.18 && d < 22) k = Math.max(k, 1 - r.p / 0.18);
                    }
                    const s = BASE + Math.round(k * 2); // 2 → 4 px, whole steps keep it pixel-crisp
                    const px = Math.round((gx + dx - (s - BASE) / 2) * dpr);
                    const py = Math.round((gy + dy - (s - BASE) / 2) * dpr);
                    const sz = Math.max(1, Math.round(s * dpr));
                    if (k > 0.04) {
                        ctx.fillStyle = `rgba(${sky},${(restA + 0.6 * k).toFixed(3)})`;
                    } else {
                        ctx.fillStyle = `rgba(${ink},${restA})`;
                    }
                    ctx.fillRect(px, py, sz, sz);
                }
            }

            const moving = rs.length > 0 || (target.on ? Math.abs(target.x - cur.x) + Math.abs(target.y - cur.y) > 0.3 || cur.a < 0.998 : cur.a > 0);
            if (moving && visible) raf = requestAnimationFrame(frame);
        };
        const wake = () => {
            if (!raf && visible) raf = requestAnimationFrame(frame);
        };

        const local = (e: PointerEvent | MouseEvent) => {
            const r = cv.getBoundingClientRect();
            return { x: e.clientX - r.left, y: e.clientY - r.top, inside: e.clientY >= r.top && e.clientY <= r.bottom && e.clientX >= r.left && e.clientX <= r.right };
        };
        const onMove = (e: PointerEvent) => {
            if (e.pointerType === "touch") return;
            const p = local(e);
            target.x = p.x;
            target.y = p.y;
            target.on = p.inside;
            wake();
        };
        const onLeave = () => {
            target.on = false;
            wake();
        };
        const onDown = (e: PointerEvent) => {
            if (reduce || e.button !== 0) return;
            const p = local(e);
            if (!p.inside) return;
            // reach the farthest corner so the ripple rolls off every edge
            const max = Math.max(Math.hypot(p.x, p.y), Math.hypot(w - p.x, p.y), Math.hypot(p.x, h - p.y), Math.hypot(w - p.x, h - p.y)) + BAND * 2;
            ripples.push({ x: p.x, y: p.y, t0: performance.now(), max });
            if (ripples.length > 4) ripples.shift();
            wake();
        };

        const ro = new ResizeObserver(size);
        ro.observe(host);
        const io = new IntersectionObserver(([en]) => {
            visible = en.isIntersecting;
            if (visible) wake();
        });
        io.observe(host);
        const mo = new MutationObserver(wake); // light/dark switch
        mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        window.addEventListener("pointermove", onMove, { passive: true });
        window.addEventListener("pointerdown", onDown, { passive: true });
        document.documentElement.addEventListener("pointerleave", onLeave);
        size();

        return () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
            io.disconnect();
            mo.disconnect();
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerdown", onDown);
            document.documentElement.removeEventListener("pointerleave", onLeave);
        };
    }, []);

    return <canvas ref={ref} className="hero-pixels" aria-hidden="true" />;
}
