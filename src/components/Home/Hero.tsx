"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Courier_Prime } from "next/font/google";
import PassCard from "./PassCard";
import { markPageReady } from "@/lib/pageReady";
import Dossier from "./Dossier";
import Earbuds from "./Earbuds";
import Laptop from "./Laptop";
import Books from "./Books";
import GithubCard from "./GithubCard";

const courier = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });

/*
 * Desktop intro: the pass card starts centred and the text is hidden.
 * Pressing "About Me" on the card glides it to the right column, then the
 * intro types itself out line by line. Pressing it again reverses.
 * Phones get the same intro on one screen: the scene sits centred, "Who is he ?" pulses,
 * and pressing it lifts the scene up while the intro types out underneath.
 * Tablets just show the text (reduced motion shows it at once).
 */
const SPEED = { h1: 55, subtitle: 38, bio: 11 }; // ms per character
const LINE_PAUSE = 260;
// phones: the scene's bounds (pass card at 0,0 → 573×280) with the objects packed in close (globals.css .hero-m)
const PHONE_SCENE = { x0: -30, x1: 598, y0: -48, y1: 476 };
const LIFT = 12; // phones: room above/below the opened pass card for its hover lift and shadow

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
    const [mobile, setMobile] = useState(false); // phone intro: one screen, two-tap objects
    const mobileRef = useRef(false);
    const [reduced, setReduced] = useState(false);
    const [shift, setShift] = useState(0);
    const passRef = useRef<HTMLDivElement>(null);

    // Load the profile, quietly retrying a couple of times if the first request fails
    useEffect(() => {
        let cancelled = false;
        const load = async (attempt: number) => {
            try {
                const res = await fetch("/api/profile");
                if (!res.ok) throw new Error(`API error: ${res.status}`);
                const data = await res.json();
                if (data?.error) throw new Error(data.error);
                if (!cancelled) setProfile(data || {});
            } catch (err) {
                if (cancelled) return;
                if (attempt < 3) window.setTimeout(() => load(attempt + 1), 900 * attempt);
                else {
                    console.error("Error fetching profile:", err);
                    setProfile({}); // fall back to the built-in defaults rather than stay blank
                }
            }
        };
        load(1);
        return () => {
            cancelled = true;
        };
    }, []);
    useEffect(() => {
        if (profile) markPageReady(); // the nav bar's liquid fill finishes and drains away
    }, [profile]);

    useEffect(() => {
        const wide = window.matchMedia("(min-width: 1025px)");
        const phone = window.matchMedia("(max-width: 767px)");
        const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
        const update = () => {
            setIntro(wide.matches || phone.matches);
            setMobile(phone.matches);
            mobileRef.current = phone.matches;
            setReduced(motion.matches);
        };
        update();
        wide.addEventListener("change", update);
        phone.addEventListener("change", update);
        motion.addEventListener("change", update);
        return () => {
            wide.removeEventListener("change", update);
            phone.removeEventListener("change", update);
            motion.removeEventListener("change", update);
        };
    }, []);

    // How far the card has to move left to sit in the middle of the grid.
    // offsetLeft ignores transforms, so this can be measured at any time.
    useLayoutEffect(() => {
        const el = passRef.current;
        const grid = el?.parentElement;
        if (!el || !grid) return;
        const measure = () => {
            setShift(grid.clientWidth / 2 - (el.offsetLeft + el.offsetWidth / 2));
            // tablets/phones: the whole card-and-objects scene (≈830px wide) is scaled to fit this width
            let s = Math.min(1, el.clientWidth / 830);
            const content = grid.querySelector<HTMLElement>(".hero-content");
            if (mobileRef.current && content) {
                // phones: scene + intro text share one screen, so the scene also shrinks to fit the height
                const cs = getComputedStyle(grid);
                const gap = parseFloat(cs.rowGap) || 0;
                const inner = grid.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
                const room = inner - content.offsetHeight - gap;
                // closed: the scene (objects packed tighter round the card on phones, see PHONE_SCENE)
                // is as big as the screen allows, sitting in the middle; the text is hidden until opened
                const P = PHONE_SCENE;
                s = Math.max(0.2, Math.min(1, (el.clientWidth - 28) / (P.x1 - P.x0), inner / (P.y1 - P.y0)));
                el.style.setProperty("--hp-drop", `${Math.round((content.offsetHeight + gap) / 2)}px`);
                el.style.setProperty("--hp-tx", `${(el.clientWidth / 2 - ((P.x0 + P.x1) / 2) * s).toFixed(1)}px`);
                el.style.setProperty("--hp-ty", `${(-P.y0 * s).toFixed(1)}px`);
                el.style.setProperty("--hp-h1", `${Math.round((P.y1 - P.y0) * s)}px`);
                // opened: the objects slide off the sides and only the pass card (573×280) stays,
                // as wide as the text column and lifted to sit just above the intro
                const cw = content.clientWidth;
                const s2 = Math.max(0.2, Math.min(1, cw / 573, (room - 2 * LIFT) / 280));
                el.style.setProperty("--hp-s2", s2.toFixed(4));
                el.style.setProperty("--hp-tx2", `${((el.clientWidth - 573 * s2) / 2).toFixed(1)}px`);
                el.style.setProperty("--hp-h2", `${Math.round(280 * s2 + 2 * LIFT)}px`);
            } else {
                ["--hp-drop", "--hp-tx", "--hp-ty", "--hp-h1", "--hp-s2", "--hp-tx2", "--hp-h2"].forEach((p) => el.style.removeProperty(p));
            }
            el.style.setProperty("--hp-s", String(s));
        };
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(grid);
        const content = grid.querySelector(".hero-content");
        if (content) ro.observe(content);
        return () => ro.disconnect();
    }, [profile, mobile]);

    // Phones: the pass card already carries the social icons, so the floating ones step aside
    // while the hero fills the screen (they would sit on top of the intro text)
    useEffect(() => {
        const sec = passRef.current?.closest("section");
        const root = document.documentElement;
        if (!mobile || !sec) return;
        const io = new IntersectionObserver(([en]) => root.classList.toggle("hero-m-top", en.intersectionRatio > 0.6), {
            threshold: [0, 0.6, 1],
        });
        io.observe(sec);
        return () => {
            io.disconnect();
            root.classList.remove("hero-m-top");
        };
    }, [mobile, profile]);

    // Phones have no hover: the first tap on an object shows its hover look, the next tap opens it.
    // (The pass card handles its own stamps and icons the same way.)
    const tapRef = useRef<HTMLElement | null>(null);
    useEffect(() => {
        const root = passRef.current;
        if (!mobile || !root) return;
        const ITEMS = ".ghc, .ap-ticket, .ap-case, .laptop, .bk, .dossier";
        const clear = () => {
            const el = tapRef.current;
            if (!el) return;
            el.removeAttribute("data-tap");
            el.closest(".hero-pass-move > *")?.removeAttribute("data-tapw");
            tapRef.current = null;
        };
        // Picked on pointerdown (iOS Safari may swallow the first tap's click); the click only
        // goes through when the object had already been picked before this tap.
        let was: HTMLElement | null = null;
        const itemAt = (t: EventTarget | null) => {
            const item = (t as Element | null)?.closest?.<HTMLElement>(ITEMS);
            return item && root.contains(item) ? item : null;
        };
        const onPick = (e: PointerEvent) => {
            const item = itemAt(e.target);
            was = tapRef.current;
            if (!item || item === tapRef.current) return;
            clear();
            item.setAttribute("data-tap", "");
            item.closest(".hero-pass-move > *")?.setAttribute("data-tapw", "");
            tapRef.current = item;
        };
        const onClick = (e: MouseEvent) => {
            const item = itemAt(e.target);
            if (!item || was === item) return; // second tap: let it do its thing
            e.preventDefault();
            e.stopPropagation();
        };
        const onDown = (e: PointerEvent) => {
            const el = tapRef.current;
            if (el && !el.contains(e.target as Node)) clear();
        };
        root.addEventListener("pointerdown", onPick, true);
        root.addEventListener("click", onClick, true);
        document.addEventListener("pointerdown", onDown, true);
        return () => {
            root.removeEventListener("pointerdown", onPick, true);
            root.removeEventListener("click", onClick, true);
            document.removeEventListener("pointerdown", onDown, true);
            clear();
        };
    }, [mobile, profile]);

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

    const router = useRouter();
    const toggle = useCallback(() => {
        // tablets/phones show the intro already, so the card's button goes to the About page
        if (!intro) {
            router.push("/about");
            return;
        }
        setRevealed((r) => !r);
    }, [intro, router]);

    return (
        <section id="home" className={`hero hero-clean ${mobile ? "hero-m" : ""}`}>
            <div className="hero-bg" aria-hidden="true" />
            {!profile ? (
                // the nav bar shows the loading progress; keep the hero's space meanwhile
                <div className="container" style={{ minHeight: "600px" }} aria-busy="true" />
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
                        {/* paper slip from the same file as the résumé dossier */}
                        <Link href="/about" className="hero-journey" tabIndex={intro && !done ? -1 : undefined}>
                            <span className="hj-page" aria-hidden="true" />
                            <span className="hj-slip">
                                <span className="hj-text">
                                    <span className={`hj-kicker ${courier.className}`}>FILE:: N°02</span>
                                    <span className="hj-title">More About My Journey</span>
                                </span>
                                <span className={`hj-chip ${courier.className}`}>
                                    READ <span className="hj-arrow" aria-hidden="true">→</span>
                                </span>
                            </span>
                        </Link>
                    </div>

                    <div className="hero-pass" ref={passRef}>
                        <div
                            className="hero-pass-move"
                            style={{ transform: intro && !revealed ? `translateX(${shift}px)` : undefined }}
                        >
                            <div className="hero-gh">
                                <GithubCard href={profile.github_url} />
                            </div>
                            <PassCard
                                onAbout={toggle}
                                twoTap={mobile}
                                cue={mobile && !revealed}
                                aboutActive={mobile && revealed}
                                socials={{ linkedin: profile.linkedin_url, github: profile.github_url, instagram: profile.instagram_url }}
                                stats={{ projects: profile.projects_count, years: profile.experience_years, coffee: profile.coffee_consumed }}
                                route={{ from: profile.route_from, to: profile.route_to }}
                            />
                            <div className="hero-laptop">
                                <Laptop />
                            </div>
                            <div className="hero-earbuds">
                                <Earbuds />
                            </div>
                            <div className="hero-books">
                                <Books />
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
