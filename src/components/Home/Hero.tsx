"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import PassCard from "./PassCard";
import Dossier from "./Dossier";
import Earbuds from "./Earbuds";

/*
 * Desktop intro: the pass card starts centred and the text is hidden.
 * Pressing "About Me" on the card glides it to the right column, then the
 * intro types itself out line by line. Pressing it again reverses.
 * Tablets/phones (card stacked or hidden) and reduced-motion just show the text.
 */
const SPEED = { h1: 55, subtitle: 38, bio: 11 }; // ms per character
const LINE_PAUSE = 260;

type Seg = { key: string; text: string; speed: number; gradient?: boolean };

function useTyping(segs: Seg[], active: boolean, instant: boolean) {
    const total = segs.reduce((n, s) => n + s.text.length, 0);
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!active) {
            setCount(0);
            return;
        }
        if (instant) {
            setCount(total);
            return;
        }
        let n = 0;
        let timer: number;
        // Starts after the card has moved out of the way
        const step = () => {
            n += 1;
            setCount(n);
            if (n >= total) return;
            let acc = 0;
            let seg = segs[0];
            for (const s of segs) {
                if (n < acc + s.text.length) { seg = s; break; }
                acc += s.text.length;
            }
            const lineEnd = n === acc && n > 0; // just crossed into a new segment
            timer = window.setTimeout(step, seg.speed + (lineEnd && seg.key !== "name" ? LINE_PAUSE : 0));
        };
        timer = window.setTimeout(step, 650);
        return () => window.clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active, instant, total]);

    return count;
}

export default function Hero() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [profile, setProfile] = useState<any>(null);
    const [revealed, setRevealed] = useState(false);
    const [intro, setIntro] = useState(true); // desktop intro layout
    const [reduced, setReduced] = useState(false);
    const [shift, setShift] = useState(0);
    const passRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch("/api/profile")
            .then((res) => {
                if (!res.ok) throw new Error(`API error: ${res.status}`);
                return res.json();
            })
            .then((data) => {
                if (data && !data.error) setProfile(data);
            })
            .catch((err) => console.error("Error fetching profile:", err));
    }, []);

    useEffect(() => {
        const wide = window.matchMedia("(min-width: 1025px)");
        const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
        const update = () => {
            setIntro(wide.matches);
            setReduced(motion.matches);
        };
        update();
        wide.addEventListener("change", update);
        motion.addEventListener("change", update);
        return () => {
            wide.removeEventListener("change", update);
            motion.removeEventListener("change", update);
        };
    }, []);

    // How far the card has to move left to sit in the middle of the grid.
    // offsetLeft ignores transforms, so this can be measured at any time.
    useLayoutEffect(() => {
        const el = passRef.current;
        const grid = el?.parentElement;
        if (!el || !grid) return;
        const measure = () => setShift(grid.clientWidth / 2 - (el.offsetLeft + el.offsetWidth / 2));
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(grid);
        return () => ro.disconnect();
    }, [profile]);

    const name = profile?.name?.split(" ")[profile.name.split(" ").length - 1] || "Naufal";
    const role = profile?.role || "Intelligent System Engineer";
    const bio = profile?.tagline || profile?.bio || "A passionate Intelligent System Engineer crafting smart solutions.";

    const segs: Seg[] = [
        { key: "h1a", text: (profile?.hero_greeting ?? "Hello Everyone,").trim() || "Hello Everyone,", speed: SPEED.h1 },
        { key: "h1b", text: "I'm ", speed: SPEED.h1 },
        { key: "name", text: name, speed: SPEED.h1, gradient: true },
        { key: "subtitle", text: role, speed: SPEED.subtitle },
        { key: "bio", text: bio, speed: SPEED.bio },
    ];
    const typing = intro && revealed;
    const count = useTyping(segs, typing, reduced);
    const total = segs.reduce((n, s) => n + s.text.length, 0);

    // One segment: full text for screen readers, plus the typed characters with the
    // untyped rest kept invisible so the layout never jumps while typing
    const part = (key: string) => {
        const seg = segs.find((x) => x.key === key)!;
        const cls = seg.gradient ? "name-gradient" : undefined;
        if (!intro) return <span className={cls}>{seg.text}</span>;
        let start = 0;
        for (const x of segs) {
            if (x.key === key) break;
            start += x.text.length;
        }
        const shown = Math.max(0, Math.min(seg.text.length, count - start));
        const caret = typing && count < total && count >= start && count < start + seg.text.length;
        return (
            <>
                <span className="sr-only">{seg.text}</span>
                <span aria-hidden="true">
                    <span className={cls}>{seg.text.slice(0, shown)}</span>
                    {caret && <span className="type-caret" />}
                    <span className="type-rest">{seg.text.slice(shown)}</span>
                </span>
            </>
        );
    };
    const done = typing && count >= total;

    const toggle = useCallback(() => {
        if (!intro) {
            const target = document.getElementById("about");
            if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
            return;
        }
        setRevealed((r) => !r);
    }, [intro]);

    return (
        <section id="home" className="hero hero-clean">
            <div className="hero-bg" aria-hidden="true" />
            {!profile ? (
                <div className="container" style={{ minHeight: "600px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div className="animate-pulse text-[var(--color-text-muted)] text-2xl font-bold tracking-tighter">Initializing Portfolio...</div>
                </div>
            ) : (
                <div className={`container hero-grid has-pass ${intro ? "is-intro" : ""} ${revealed ? "is-revealed" : ""} ${done ? "is-typed" : ""}`}>
                    <div className="hero-content text-left">
                        <h1>
                            {part("h1a")}
                            <br />
                            {part("h1b")}
                            {part("name")}
                        </h1>
                        <p className="subtitle">{part("subtitle")}</p>
                        <p className="value-prop">
                            {part("bio")}
                            {done && <span className="type-caret is-final" aria-hidden="true" />}
                        </p>
                    </div>

                    <div className="hero-pass" ref={passRef}>
                        <div
                            className="hero-pass-move"
                            style={{ transform: intro && !revealed ? `translateX(${shift}px)` : undefined }}
                        >
                            <PassCard
                                onAbout={toggle}
                                socials={{ linkedin: profile.linkedin_url, github: profile.github_url, instagram: profile.instagram_url }}
                                stats={{ projects: profile.projects_count, years: profile.experience_years, coffee: profile.coffee_consumed }}
                                route={{ from: profile.route_from, to: profile.route_to }}
                            />
                            <div className="hero-earbuds">
                                <Earbuds />
                            </div>
                            <div className="hero-dossier">
                                <Dossier href={profile.resume_url || "/assets/resume.pdf"} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
