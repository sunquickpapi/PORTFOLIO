"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Courier_Prime, JetBrains_Mono } from "next/font/google";
import { ArrowLeft, Check, ChevronDown, Copy, Maximize2, Search, X } from "lucide-react";
import PixelField from "@/components/Home/PixelField";
import { Snippet, getIntegrationCode, getPlaygroundUrl, highlight } from "./snippetCode";

const courier = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "600"], display: "swap" });

interface Note {
    id: string;
    title: string;
    content: string;
    type: string;
    color: string;
    pinned: boolean;
    created_at: string;
}

type CodeTab = "vanilla" | "react" | "raw";

const BW = 1180; // open notebook, both pages
const BH = 700;
const FLIP_MS = 900;

const pad2 = (n: number) => String(n).padStart(2, "0");
const monthYear = (d?: string) =>
    d ? new Date(d).toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase() : "";
const shortDate = (d?: string) => (d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase() : "");

function codeFor(s: Snippet, tab: CodeTab) {
    return tab === "raw" ? s.code : getIntegrationCode(s, {}, tab);
}

/** A live demo, rendered at 1200×630 and scaled to whatever width it is given. */
function DemoFrame({ src, title, interactive = false }: { src: string; title: string; interactive?: boolean }) {
    const box = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0);
    useLayoutEffect(() => {
        const el = box.current;
        if (!el) return;
        const fit = () => el.offsetWidth > 0 && setScale(el.offsetWidth / 1200);
        fit();
        const ro = new ResizeObserver(fit);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);
    return (
        <div ref={box} className="snb-frame">
            <iframe
                src={src}
                title={title}
                tabIndex={interactive ? 0 : -1}
                style={{
                    transform: `scale(${scale || 0.0001})`,
                    pointerEvents: interactive ? "auto" : "none",
                    opacity: scale ? 1 : 0,
                }}
            />
        </div>
    );
}

function Paperclip() {
    return (
        <svg className="snb-clip" viewBox="0 0 24 64" aria-hidden="true">
            <path
                d="M8 22 V10 a5 5 0 0 1 10 0 V48 a8 8 0 0 1 -16 0 V16 a3 3 0 0 1 6 0 V44"
                fill="none"
                stroke="url(#snbClipSteel)"
                strokeWidth="2.6"
                strokeLinecap="round"
            />
            <defs>
                <linearGradient id="snbClipSteel" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#c9d5de" />
                    <stop offset=".45" stopColor="#7d93a4" />
                    <stop offset="1" stopColor="#4f6577" />
                </linearGradient>
            </defs>
        </svg>
    );
}

/* ───────────── left page: the index + dev notes ───────────── */

function IndexPage({
    list,
    all,
    activeId,
    onPick,
    notes,
    onNote,
}: {
    list: Snippet[];
    all: Snippet[];
    activeId?: string;
    onPick: (s: Snippet) => void;
    notes: Note[];
    onNote: (n: Note) => void;
}) {
    return (
        <div className="snb-sheet snb-left">
            <span className="snb-holes" aria-hidden="true" />
            <div className="snb-body">
                <header className="snb-index-head">
                    <span className={`snb-kicker ${courier.className}`}>SNIPPET NOTEBOOK · VOL. 01</span>
                    <h1 className="snb-index-title">Index</h1>
                </header>

                <ol className="snb-index">
                    {list.map((s) => {
                        const no = all.indexOf(s) + 1;
                        return (
                            <li key={s.id}>
                                <button
                                    type="button"
                                    className={`snb-entry ${s.id === activeId ? "is-on" : ""}`}
                                    onClick={() => onPick(s)}
                                    aria-current={s.id === activeId}
                                >
                                    <span className={`snb-entry-no ${courier.className}`}>{pad2(no)}</span>
                                    <span className="snb-entry-title">{s.title}</span>
                                    <span className="snb-entry-dots" aria-hidden="true" />
                                    <span className={`snb-entry-lang ${courier.className}`}>{s.language.toUpperCase()}</span>
                                </button>
                            </li>
                        );
                    })}
                    {list.length === 0 && <li className={`snb-index-empty ${courier.className}`}>NOTHING MATCHES. TRY ANOTHER WORD.</li>}
                </ol>

                {notes.length > 0 && (
                    <div className="snb-notes" role="region" aria-label="Dev notes">
                        <span className={`snb-kicker ${courier.className}`}>DEV NOTES · {pad2(notes.length)}</span>
                        <div className="snb-postits">
                            {notes.slice(0, 4).map((n, i) => (
                                <button
                                    type="button"
                                    key={n.id}
                                    className="snb-postit"
                                    style={{ ["--pc" as string]: n.color || "#3A99C9", ["--rot" as string]: `${[-3, 2, -1.5, 3][i % 4]}deg` }}
                                    onClick={() => onNote(n)}
                                >
                                    <span className="snb-tape" aria-hidden="true" />
                                    <span className={`snb-postit-type ${courier.className}`}>{n.type.toUpperCase()}</span>
                                    <span className="snb-postit-title">{n.title}</span>
                                    <span className={`snb-postit-date ${courier.className}`}>{shortDate(n.created_at)}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ───────────── right page: one snippet entry ───────────── */

function EntryPage({
    snippet,
    no,
    view,
    setView,
    codeTab,
    setCodeTab,
    onCloseUp,
    copied,
    onCopy,
    still = false,
}: {
    snippet?: Snippet;
    no: number;
    view: "preview" | "code";
    setView?: (v: "preview" | "code") => void;
    codeTab: CodeTab;
    setCodeTab?: (t: CodeTab) => void;
    onCloseUp?: () => void;
    copied?: boolean;
    onCopy?: (text: string) => void;
    still?: boolean;
}) {
    const code = snippet ? codeFor(snippet, codeTab) : "";
    const html = useMemo(() => (view === "code" && code ? highlight(code) : ""), [view, code]);

    return (
        <div className="snb-sheet snb-right">
            <span className="snb-holes" aria-hidden="true" />
            {snippet ? (
                <div className="snb-body">
                    <div className={`snb-entry-meta ${courier.className}`}>
                        <span>ENTRY No. {pad2(no)}</span>
                        <span>{monthYear(snippet.created_at)}</span>
                    </div>
                    <h2 className="snb-title">{snippet.title}</h2>
                    <div className="snb-badges">
                        <span className="snb-lang">{snippet.language}</span>
                        <span className="snb-cat">{snippet.category || "Utility"}</span>
                        {snippet.tags
                            ?.split(",")
                            .slice(0, 3)
                            .map((t) => (
                                <span key={t} className="snb-tag">
                                    #{t.trim()}
                                </span>
                            ))}
                    </div>
                    <p className="snb-desc">{snippet.description}</p>

                    <div className="snb-tools">
                        <div className={`snb-switch ${courier.className}`} role="tablist">
                            {(["preview", "code"] as const).map((v) => (
                                <button
                                    key={v}
                                    type="button"
                                    role="tab"
                                    aria-selected={view === v}
                                    className={view === v ? "is-on" : ""}
                                    onClick={() => setView?.(v)}
                                    tabIndex={still ? -1 : 0}
                                >
                                    {v.toUpperCase()}
                                </button>
                            ))}
                        </div>
                        <button type="button" className="snb-closeup" onClick={onCloseUp} tabIndex={still ? -1 : 0}>
                            <Maximize2 size={14} strokeWidth={2.4} /> Close Up
                        </button>
                    </div>

                    <div className="snb-stage">
                        {view === "preview" ? (
                            <button type="button" className="snb-print" onClick={onCloseUp} tabIndex={still ? -1 : 0} aria-label="Open close up">
                                <DemoFrame src={getPlaygroundUrl(snippet)} title={`${snippet.title} preview`} />
                                <Paperclip />
                            </button>
                        ) : (
                            <div className="snb-code">
                                <div className="snb-code-bar">
                                    <div className={`snb-code-tabs ${courier.className}`}>
                                        {(
                                            [
                                                ["vanilla", "HTML/CSS/JS"],
                                                ["react", "REACT"],
                                                ["raw", "SOURCE"],
                                            ] as [CodeTab, string][]
                                        ).map(([k, label]) => (
                                            <button key={k} type="button" className={codeTab === k ? "is-on" : ""} onClick={() => setCodeTab?.(k)}>
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                    <button type="button" className={`snb-copy ${copied ? "is-done" : ""}`} onClick={() => onCopy?.(code)}>
                                        {copied ? <Check size={13} strokeWidth={2.6} /> : <Copy size={13} strokeWidth={2.4} />}
                                        {copied ? "Copied" : "Copy"}
                                    </button>
                                </div>
                                <pre className={mono.className}>
                                    <code dangerouslySetInnerHTML={{ __html: html }} />
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="snb-body snb-blank" />
            )}
        </div>
    );
}

/* ───────────── page ───────────── */

/**
 * The snippet vault as one big open spiral notebook (same notebook as the homepage section):
 * the left page is the index (plus dev notes as post-its), the right page is the open entry.
 * Picking another entry turns the right page over. Close Up opens the live demo full size.
 */
export default function SnippetsGalleryDetails() {
    const [snippets, setSnippets] = useState<Snippet[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [cat, setCat] = useState("all");
    const [menu, setMenu] = useState(false);
    const [activeId, setActiveId] = useState<string>();
    const [view, setView] = useState<"preview" | "code">("preview");
    const [codeTab, setCodeTab] = useState<CodeTab>("vanilla");
    const [copied, setCopied] = useState(false);
    const [closeUp, setCloseUp] = useState<Snippet | null>(null);
    const [note, setNote] = useState<Note | null>(null);
    const [turn, setTurn] = useState<{ id: number; dir: 1 | -1; from: Snippet; fromNo: number; to: Snippet; toNo: number; view: "preview" | "code"; codeTab: CodeTab } | null>(null);
    const [scale, setScale] = useState(1);
    const [stack, setStack] = useState(false);
    const fitRef = useRef<HTMLDivElement>(null);
    const entryRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const turnTimer = useRef<number | undefined>(undefined);

    useEffect(() => {
        Promise.all([
            fetch("/api/snippets").then((r) => (r.ok ? r.json() : [])),
            fetch("/api/notes").then((r) => (r.ok ? r.json() : [])),
        ])
            .then(([s, n]) => {
                if (Array.isArray(s)) {
                    setSnippets(s);
                    if (s[0]) setActiveId(s[0].id);
                }
                if (Array.isArray(n)) setNotes([...n].sort((a: Note, b: Note) => Number(b.pinned) - Number(a.pinned)));
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    // fit the notebook to the screen; narrow screens get the pages stacked instead
    useEffect(() => {
        const fit = () => {
            const narrow = window.innerWidth < 900;
            setStack(narrow);
            if (!narrow) {
                const w = (fitRef.current?.clientWidth || window.innerWidth) - 24;
                setScale(Math.min(1, w / (BW + 24), (window.innerHeight - 130) / (BH + 24)));
            }
        };
        fit();
        window.addEventListener("resize", fit);
        return () => window.removeEventListener("resize", fit);
    }, [loading]);

    // close the category menu on outside click / Esc
    useEffect(() => {
        if (!menu) return;
        const down = (e: PointerEvent) => !menuRef.current?.contains(e.target as Node) && setMenu(false);
        const key = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
        window.addEventListener("pointerdown", down);
        window.addEventListener("keydown", key);
        return () => {
            window.removeEventListener("pointerdown", down);
            window.removeEventListener("keydown", key);
        };
    }, [menu]);

    const cats = useMemo(() => Array.from(new Set(snippets.map((s) => s.category || "Utility"))).sort(), [snippets]);
    const shown = useMemo(() => {
        const q = search.trim().toLowerCase();
        return snippets.filter((s) => {
            const okC = cat === "all" || (s.category || "Utility") === cat;
            const okQ =
                !q ||
                s.title.toLowerCase().includes(q) ||
                s.language.toLowerCase().includes(q) ||
                (s.tags || "").toLowerCase().includes(q) ||
                (s.category || "").toLowerCase().includes(q);
            return okC && okQ;
        });
    }, [snippets, search, cat]);

    const active = snippets.find((s) => s.id === activeId);
    const activeNo = active ? snippets.indexOf(active) + 1 : 0;

    const pick = useCallback(
        (s: Snippet, dirHint?: 1 | -1) => {
            if (!active || s.id === active.id) return;
            const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            if (!stack && !reduce) {
                window.clearTimeout(turnTimer.current);
                const toNo = snippets.indexOf(s) + 1;
                // a later entry turns the page to the left; an earlier one turns it back to the right
                const dir = dirHint ?? (toNo > activeNo ? 1 : -1);
                setTurn({ id: Date.now(), dir, from: active, fromNo: activeNo, to: s, toNo, view, codeTab });
                turnTimer.current = window.setTimeout(() => setTurn(null), FLIP_MS);
            }
            setActiveId(s.id);
            setCopied(false);
            if (stack) entryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        },
        [active, activeNo, view, codeTab, stack, snippets]
    );

    // keep the open entry inside the filtered list
    useEffect(() => {
        if (shown.length && !shown.some((s) => s.id === activeId)) pick(shown[0]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shown]);

    // ← / → (or ↑ / ↓) walk through the index
    useEffect(() => {
        const key = (e: KeyboardEvent) => {
            if (closeUp || note || (e.target as HTMLElement)?.tagName === "INPUT") return;
            const i = shown.findIndex((s) => s.id === activeId);
            if (i < 0) return;
            if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                e.preventDefault();
                pick(shown[(i + 1) % shown.length], 1);
            } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault();
                pick(shown[(i - 1 + shown.length) % shown.length], -1);
            }
        };
        window.addEventListener("keydown", key);
        return () => window.removeEventListener("keydown", key);
    }, [shown, activeId, pick, closeUp, note]);

    const copy = (text: string) => {
        navigator.clipboard?.writeText(text).then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1800);
        });
    };

    return (
        <div className="snb-page">
            <PixelField />

            {/* top bar: back, search, category */}
            <div className="snb-bar">
                <Link href="/#snippets" className="snb-back" aria-label="Back to home">
                    <ArrowLeft size={16} strokeWidth={2.4} />
                    <span className={courier.className}>HOME</span>
                </Link>
                <div className="snb-search">
                    <Search size={16} strokeWidth={2.4} />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search snippets…" aria-label="Search snippets" />
                    {search && (
                        <button type="button" onClick={() => setSearch("")} aria-label="Clear search">
                            <X size={14} />
                        </button>
                    )}
                </div>
                <div className="snb-filter" ref={menuRef}>
                    <button type="button" className={`snb-filter-btn ${cat !== "all" ? "is-on" : ""}`} onClick={() => setMenu((m) => !m)} aria-expanded={menu}>
                        <span>{cat === "all" ? "All categories" : cat}</span>
                        <ChevronDown size={15} strokeWidth={2.4} />
                    </button>
                    {menu && (
                        <div className="snb-menu" role="listbox">
                            {["all", ...cats].map((c) => (
                                <button
                                    type="button"
                                    key={c}
                                    role="option"
                                    aria-selected={cat === c}
                                    className={cat === c ? "is-on" : ""}
                                    onClick={() => {
                                        setCat(c);
                                        setMenu(false);
                                    }}
                                >
                                    {c === "all" ? "All categories" : c}
                                    {cat === c && <Check size={14} strokeWidth={2.6} />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <span className={`snb-count ${courier.className}`}>
                    {pad2(shown.length)} / {pad2(snippets.length)}
                </span>
            </div>

            <main className="snb-main" ref={fitRef}>
                {loading ? (
                    <p className={`snb-loading ${courier.className}`}>OPENING THE NOTEBOOK…</p>
                ) : (
                    <div className={`snb-fit ${stack ? "is-stack" : ""}`} style={stack ? undefined : { height: (BH + 24) * scale, width: (BW + 24) * scale }}>
                        <div className="snb-book" data-no-ripple style={stack ? undefined : { transform: `scale(${scale})` }}>
                            {!stack && <div className="snb-cover" aria-hidden="true" />}

                            <div className="snb-side snb-side-l">
                                <IndexPage list={shown} all={snippets} activeId={activeId} onPick={pick} notes={notes} onNote={setNote} />
                            </div>
                            <div className="snb-side snb-side-r" ref={entryRef}>
                                <EntryPage
                                    snippet={active}
                                    no={activeNo}
                                    view={view}
                                    setView={setView}
                                    codeTab={codeTab}
                                    setCodeTab={setCodeTab}
                                    onCloseUp={() => active && setCloseUp(active)}
                                    copied={copied}
                                    onCopy={copy}
                                />
                            </div>

                            {/* turning back: the old entry stays on the right until the leaf lands on it */}
                            {turn?.dir === -1 && (
                                <div className="snb-side snb-side-r snb-under" key={`u${turn.id}`} aria-hidden="true">
                                    <EntryPage snippet={turn.from} no={turn.fromNo} view={turn.view} codeTab={turn.codeTab} still />
                                </div>
                            )}

                            {/* the turning leaf: forward = old entry lifts off to the left; back = new entry swings in from the left */}
                            {turn && (
                                <div className={`snb-leaf ${turn.dir === -1 ? "is-back" : ""}`} key={turn.id} aria-hidden="true">
                                    <div className="snb-face snb-face-front">
                                        {turn.dir === 1 ? (
                                            <EntryPage snippet={turn.from} no={turn.fromNo} view={turn.view} codeTab={turn.codeTab} still />
                                        ) : (
                                            <EntryPage snippet={turn.to} no={turn.toNo} view={view} codeTab={codeTab} still />
                                        )}
                                        <span className="snb-shade" />
                                    </div>
                                    <div className="snb-face snb-face-back">
                                        <div className="snb-sheet snb-left">
                                            <span className="snb-holes" />
                                        </div>
                                        <span className="snb-shade" />
                                    </div>
                                </div>
                            )}

                            {!stack && (
                                <div className="snb-spiral" aria-hidden="true">
                                    {Array.from({ length: 30 }).map((_, i) => (
                                        <span key={i} className="snb-coil" />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {closeUp && <CloseUp snippet={closeUp} no={snippets.indexOf(closeUp) + 1} onClose={() => setCloseUp(null)} />}
            {note && <NoteCard note={note} onClose={() => setNote(null)} />}

            <style jsx global>{STYLES}</style>
        </div>
    );
}

/* ───────────── overlays ───────────── */

function useOverlay(onClose: () => void) {
    const [leaving, setLeaving] = useState(false);
    const close = useCallback(() => {
        setLeaving(true);
        window.setTimeout(onClose, 260);
    }, [onClose]);
    useEffect(() => {
        const key = (e: KeyboardEvent) => e.key === "Escape" && close();
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", key);
        return () => {
            window.removeEventListener("keydown", key);
            document.body.style.overflow = prev;
        };
    }, [close]);
    return { leaving, close };
}

function CloseUp({ snippet, no, onClose }: { snippet: Snippet; no: number; onClose: () => void }) {
    const { leaving, close } = useOverlay(onClose);
    return createPortal(
        <div className={`snb-overlay ${leaving ? "is-leaving" : ""}`} onClick={close} data-no-ripple>
            <div className="snb-cu" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={`${snippet.title} close up`}>
                <header className="snb-cu-head">
                    <div>
                        <span className={`snb-kicker ${courier.className}`}>
                            CLOSE UP · ENTRY No. {pad2(no)} · {snippet.language.toUpperCase()}
                        </span>
                        <h3>{snippet.title}</h3>
                    </div>
                    <button type="button" className="snb-x" onClick={close} aria-label="Close">
                        <X size={18} strokeWidth={2.4} />
                    </button>
                </header>
                <div className="snb-cu-frame">
                    <DemoFrame src={getPlaygroundUrl(snippet)} title={`${snippet.title} live demo`} interactive />
                </div>
                <p className={`snb-cu-foot ${courier.className}`}>LIVE DEMO · TRY IT · ESC TO CLOSE</p>
            </div>
        </div>,
        document.body
    );
}

/** A round vintage postmark (with wavy cancellation lines) that copies the note. */
function Postmark({ date, done, onClick }: { date?: string; done: boolean; onClick: () => void }) {
    const d = date ? new Date(date) : null;
    const day = d ? d.toLocaleDateString("en-US", { day: "2-digit", month: "short" }).toUpperCase() : "";
    const year = d ? String(d.getFullYear()) : "";
    return (
        <button type="button" className={`snb-pm ${done ? "is-done" : ""}`} onClick={onClick} aria-label={done ? "Note copied" : "Copy note"}>
            <svg viewBox="0 0 210 112" aria-hidden="true" className={courier.className}>
                <defs>
                    <path id="snbPmArc" d="M154 56 m -40 0 a 40 40 0 1 1 80 0 a 40 40 0 1 1 -80 0" />
                </defs>
                <g className="snb-pm-waves">
                    {[30, 43, 56, 69, 82].map((y) => (
                        <path key={y} d={`M2 ${y} q 12 -7 24 0 t 24 0 t 24 0 t 24 0`} />
                    ))}
                </g>
                <g className="snb-pm-mark">
                    <circle cx="154" cy="56" r="50" className="snb-pm-ring" />
                    <circle cx="154" cy="56" r="31" className="snb-pm-ring thin" />
                    <text className="snb-pm-arc">
                        <textPath href="#snbPmArc" textLength="248" lengthAdjust="spacing">
                            DEV NOTES ✦ FVLNZM.MY ✦ KUALA LUMPUR ✦
                        </textPath>
                    </text>
                    <text x="154" y="51" textAnchor="middle" className="snb-pm-big">
                        {done ? "COPIED" : "COPY"}
                    </text>
                    <line x1="132" y1="57" x2="176" y2="57" className="snb-pm-rule" />
                    <text x="154" y="68" textAnchor="middle" className="snb-pm-small">
                        {done ? "✓ ✓ ✓" : `${day} ${year}`}
                    </text>
                </g>
            </svg>
        </button>
    );
}

function NoteCard({ note, onClose }: { note: Note; onClose: () => void }) {
    const { leaving, close } = useOverlay(onClose);
    const [copied, setCopied] = useState(false);
    const copy = () =>
        navigator.clipboard?.writeText(note.content || note.title).then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2200);
        });
    return createPortal(
        <div className={`snb-overlay ${leaving ? "is-leaving" : ""}`} onClick={close} data-no-ripple>
            <div
                className="snb-bignote"
                style={{ ["--pc" as string]: note.color || "#3A99C9" }}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={note.title}
            >
                <span className="snb-tape" aria-hidden="true" />
                <button type="button" className="snb-x" onClick={close} aria-label="Close">
                    <X size={16} strokeWidth={2.4} />
                </button>
                <span className={`snb-postit-type ${courier.className}`}>
                    {note.type.toUpperCase()} · {shortDate(note.created_at)}
                </span>
                <h3>{note.title}</h3>
                <p>{note.content}</p>
                <div className="snb-pm-row">
                    <Postmark date={note.created_at} done={copied} onClick={copy} />
                </div>
            </div>
        </div>,
        document.body
    );
}

/* ───────────── styles ───────────── */

const STYLES = `
.snb-page {
    position: relative;
    min-height: 100vh;
    background: transparent;
    --ink: #0d2a42;
    --navy: #1b4f72;
    --sky: #3a99c9;
    --paper: #fbfcfd;
    --rule: 28px;
}

/* ---- floating top bar (same as Projects) ---- */
.snb-bar {
    position: sticky;
    top: 18px;
    z-index: 50;
    width: fit-content;
    max-width: calc(100% - 32px);
    margin: 18px auto 0;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px;
    border-radius: 16px;
    background: rgba(251, 252, 253, 0.86);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.08), 0 16px 30px -18px rgba(13, 42, 66, 0.45);
}
.snb-back {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 38px;
    padding: 0 12px;
    border-radius: 11px;
    color: var(--ink);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-decoration: none;
    opacity: 1 !important;
    transition: background 0.2s ease;
}
.snb-back:hover { background: rgba(27, 79, 114, 0.08); }
.snb-search {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 38px;
    width: 300px;
    max-width: 40vw;
    padding: 0 10px 0 12px;
    border-radius: 11px;
    background: rgba(27, 79, 114, 0.07);
    color: var(--navy);
}
.snb-search input {
    flex: 1;
    min-width: 0;
    border: 0;
    outline: 0;
    background: transparent;
    font-size: 14px;
    font-weight: 600;
    color: var(--ink);
}
.snb-search input::placeholder { color: rgba(13, 42, 66, 0.45); }
.snb-search button { display: inline-flex; border: 0; background: none; color: var(--navy); cursor: pointer; }
.snb-filter { position: relative; }
.snb-filter-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 38px;
    padding: 0 12px;
    border: 0;
    border-radius: 11px;
    background: rgba(27, 79, 114, 0.07);
    color: var(--ink);
    font-size: 13.5px;
    font-weight: 700;
    cursor: pointer;
    max-width: 200px;
    white-space: nowrap;
}
.snb-filter-btn.is-on { background: var(--navy); color: #e9f4fa; }
.snb-menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: 220px;
    padding: 6px;
    border-radius: 12px;
    background: var(--paper);
    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.08), 0 20px 34px -16px rgba(13, 42, 66, 0.5);
}
.snb-menu button {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    padding: 8px 10px;
    border: 0;
    border-radius: 8px;
    background: none;
    color: var(--ink);
    font-size: 13.5px;
    font-weight: 600;
    text-align: left;
    cursor: pointer;
}
.snb-menu button:hover { background: rgba(27, 79, 114, 0.07); }
.snb-menu button.is-on { color: var(--navy); font-weight: 800; }
.snb-count {
    padding: 0 10px 0 4px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.14em;
    color: #3a7ca5;
    white-space: nowrap;
}

/* ---- the desk ---- */
.snb-main {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 34px 12px 40px;
}
.snb-loading, .snb-hint {
    margin: 0;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.24em;
    color: #3a7ca5;
}
.snb-loading { padding-top: 30vh; animation: snb-blink 1.2s ease-in-out infinite; }
@keyframes snb-blink { 50% { opacity: 0.35; } }
.snb-hint { margin-top: 18px; opacity: 0.8; }

.snb-fit { position: relative; animation: snb-in 0.8s cubic-bezier(0.22, 1, 0.36, 1) both; }
@keyframes snb-in { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: none; } }
.snb-book {
    position: absolute;
    left: 12px;
    top: 12px;
    width: ${BW}px;
    height: ${BH}px;
    transform-origin: 0 0;
    perspective: 2600px;
}
.snb-cover {
    position: absolute;
    inset: -10px -11px -12px;
    border-radius: 12px;
    background: linear-gradient(160deg, #1b3d57 0%, #0d2a42 60%, #0a2135 100%);
    box-shadow: 0 40px 60px -30px rgba(13, 42, 66, 0.6), 0 0 0 1px rgba(13, 42, 66, 0.2);
}
.snb-side, .snb-leaf {
    position: absolute;
    top: 0;
    width: ${(BW - 40) / 2}px;
    height: ${BH}px;
}
.snb-side-l { left: 0; }
.snb-side-r { right: 0; }
.snb-leaf {
    left: ${(BW + 40) / 2}px;
    z-index: 6;
    pointer-events: none;
    transform-style: preserve-3d;
    transform-origin: -20px 50%;
    animation: snb-turn ${FLIP_MS}ms cubic-bezier(0.45, 0.05, 0.25, 1) both;
}
@keyframes snb-turn { from { transform: rotateY(0deg); } to { transform: rotateY(-180deg); } }
.snb-leaf.is-back { animation-name: snb-turn-back; }
@keyframes snb-turn-back { from { transform: rotateY(-180deg); } to { transform: rotateY(0deg); } }
.snb-under { z-index: 5; pointer-events: none; }
.snb-leaf.is-back .snb-face-back { animation-name: snb-rise; }
@keyframes snb-rise { 0% { opacity: 0; } 20%, 100% { opacity: 1; } }
.snb-face { position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
.snb-face-back { transform: rotateY(180deg); animation: snb-settle ${FLIP_MS}ms linear both; }
@keyframes snb-settle { 0%, 80% { opacity: 1; } 100% { opacity: 0; } }
.snb-shade { position: absolute; inset: 0; pointer-events: none; animation: snb-shade ${FLIP_MS}ms ease-in-out both; }
.snb-face-front .snb-shade { background: linear-gradient(90deg, rgba(13, 42, 66, 0.3), rgba(13, 42, 66, 0) 60%); }
.snb-face-back .snb-shade { background: linear-gradient(270deg, rgba(13, 42, 66, 0.3), rgba(13, 42, 66, 0) 60%); }
@keyframes snb-shade { 0%, 100% { opacity: 0; } 50% { opacity: 1; } }

/* ---- a ruled sheet ---- */
.snb-sheet {
    position: absolute;
    inset: 0;
    overflow: hidden;
    --margin: 64px;
    background-color: var(--paper);
    background-image:
        linear-gradient(90deg, transparent 0, transparent var(--margin), rgba(58, 153, 201, 0.35) var(--margin), rgba(58, 153, 201, 0.35) calc(var(--margin) + 1px), transparent calc(var(--margin) + 1px)),
        repeating-linear-gradient(180deg, transparent 0 calc(var(--rule) - 1px), rgba(58, 153, 201, 0.17) calc(var(--rule) - 1px) var(--rule)),
        linear-gradient(180deg, #fdfefe 0%, #f1f5f8 100%);
    background-position: 0 0, 0 20px, 0 0;
}
.snb-left { border-radius: 5px 2px 2px 5px; box-shadow: inset -22px 0 26px -22px rgba(13, 42, 66, 0.38); }
.snb-right { border-radius: 2px 5px 5px 2px; box-shadow: inset 22px 0 26px -22px rgba(13, 42, 66, 0.38); }
.snb-holes {
    position: absolute;
    top: 14px;
    bottom: 14px;
    width: 8px;
    background: radial-gradient(circle, #c9d6df 0 3px, transparent 3.5px) 0 0 / 8px 22.6px repeat-y;
}
.snb-left .snb-holes { right: 9px; }
.snb-right .snb-holes { left: 9px; }
.snb-body {
    position: absolute;
    inset: 36px 40px 30px 84px;
    display: flex;
    flex-direction: column;
    min-height: 0;
}
.snb-right .snb-body { inset: 36px 36px 30px 90px; }
.snb-kicker {
    display: block;
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: 0.22em;
    color: #3a7ca5;
}

/* ---- index ---- */
.snb-index-head { margin-bottom: 10px; }
.snb-index-title {
    margin: 2px 0 0;
    font-size: 46px;
    line-height: 56px;
    font-weight: 800;
    letter-spacing: -0.03em;
    color: var(--ink);
}
.snb-index {
    list-style: none;
    margin: 0 -10px;
    padding: 0;
    flex: 0 1 auto;
    min-height: 0;
    overflow-y: auto;
    scrollbar-width: thin;
}
.snb-entry {
    position: relative;
    display: flex;
    align-items: baseline;
    gap: 12px;
    width: 100%;
    height: 38px;
    padding: 0 10px;
    border: 0;
    background: none;
    color: var(--ink);
    text-align: left;
    cursor: pointer;
    isolation: isolate;
}
.snb-entry::before {
    content: "";
    position: absolute;
    inset: 8px 2px 6px;
    z-index: -1;
    border-radius: 6px 12px 8px 14px;
    background: rgba(58, 153, 201, 0.24);
    transform: scaleX(0) skewX(-8deg);
    transform-origin: left center;
    transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}
.snb-entry:hover::before { transform: scaleX(1) skewX(-8deg); background: rgba(58, 153, 201, 0.12); }
.snb-entry.is-on::before { transform: scaleX(1) skewX(-8deg); background: rgba(58, 153, 201, 0.26); }
.snb-entry { align-items: center; }
.snb-entry-no { font-size: 13px; font-weight: 700; color: #3a7ca5; width: 22px; flex: none; }
.snb-entry-title {
    font-size: 16px;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
}
.snb-entry.is-on .snb-entry-title { font-weight: 800; }
.snb-entry-dots {
    flex: 1;
    min-width: 16px;
    height: 2px;
    align-self: center;
    margin-top: 6px;
    background: radial-gradient(circle, rgba(27, 79, 114, 0.35) 1px, transparent 1.4px) 0 0 / 7px 2px repeat-x;
}
.snb-entry-lang { font-size: 11.5px; font-weight: 700; letter-spacing: 0.12em; color: var(--navy); flex: none; }
.snb-index-empty { padding: 16px 10px; font-size: 12px; letter-spacing: 0.18em; color: #3a7ca5; }

/* ---- dev notes ---- */
.snb-notes { padding-top: 16px; border-top: 2px dashed rgba(27, 79, 114, 0.2); margin-top: auto; }
.snb-postits { display: flex; gap: 14px; margin-top: 14px; }
.snb-postit {
    --pc: #3a99c9;
    position: relative;
    flex: 1 1 0;
    min-width: 0;
    max-width: 150px;
    height: 118px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 16px 12px 10px;
    border: 0;
    border-radius: 2px 2px 14px 2px;
    background: color-mix(in srgb, var(--pc) 20%, #fffdf6);
    box-shadow: 0 10px 16px -10px rgba(13, 42, 66, 0.45), inset 0 -10px 14px -12px rgba(13, 42, 66, 0.25);
    color: var(--ink);
    text-align: left;
    cursor: pointer;
    transform: rotate(var(--rot, -2deg));
    transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease;
}
.snb-postit:hover { transform: rotate(0deg) translateY(-6px); box-shadow: 0 18px 24px -14px rgba(13, 42, 66, 0.5); }
.snb-tape {
    position: absolute;
    top: -9px;
    left: 50%;
    width: 52px;
    height: 18px;
    margin-left: -26px;
    background: rgba(255, 255, 255, 0.62);
    box-shadow: 0 1px 2px rgba(13, 42, 66, 0.12);
    transform: rotate(-4deg);
}
.snb-postit-type { font-size: 10px; font-weight: 700; letter-spacing: 0.18em; color: color-mix(in srgb, var(--pc) 70%, #0d2a42); }
.snb-postit-title {
    font-size: 13.5px;
    font-weight: 800;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
.snb-postit-date { margin-top: auto; font-size: 10px; font-weight: 700; letter-spacing: 0.14em; color: rgba(13, 42, 66, 0.5); }

/* ---- entry ---- */
.snb-entry-meta {
    display: flex;
    justify-content: space-between;
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: 0.2em;
    color: #3a7ca5;
    line-height: var(--rule);
}
.snb-title {
    margin: 4px 0 8px;
    font-size: 30px;
    line-height: 36px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--ink);
}
.snb-badges { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 8px; }
.snb-lang {
    font-size: 10.5px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 3px 9px;
    border-radius: 6px;
    background: var(--navy);
    color: #e9f4fa;
}
.snb-cat { font-size: 10.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(13, 42, 66, 0.5); margin-right: 4px; }
.snb-tag {
    padding: 2px 9px;
    border: 1.5px solid rgba(27, 79, 114, 0.3);
    border-radius: 999px;
    font-size: 11.5px;
    font-weight: 600;
    color: var(--navy);
    background: rgba(255, 255, 255, 0.7);
}
.snb-desc {
    margin: 12px 0 0;
    font-size: 15px;
    line-height: var(--rule);
    color: #2d4a60;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
.snb-tools { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin: 16px 0 14px; }
.snb-switch { display: inline-flex; padding: 3px; border-radius: 999px; background: rgba(27, 79, 114, 0.08); }
.snb-switch button {
    height: 30px;
    padding: 0 16px;
    border: 0;
    border-radius: 999px;
    background: transparent;
    color: var(--navy);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.16em;
    cursor: pointer;
    transition: background 0.25s ease, color 0.25s ease;
}
.snb-switch button.is-on { background: var(--ink); color: #e9f4fa; }
.snb-closeup {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    height: 36px;
    padding: 0 16px;
    border: 2px solid var(--ink);
    border-radius: 999px;
    background: #fff;
    color: var(--ink);
    font-size: 14px;
    font-weight: 800;
    cursor: pointer;
    transition: background 0.25s ease, color 0.25s ease, transform 0.25s ease;
}
.snb-closeup:hover { background: var(--ink); color: #e9f4fa; transform: translateY(-1px); }
.snb-stage { position: relative; flex: 1; min-height: 0; display: flex; flex-direction: column; }
.snb-print {
    position: relative;
    display: block;
    width: 100%;
    margin-top: 8px;
    padding: 8px;
    border: 0;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.08), 0 14px 22px -14px rgba(13, 42, 66, 0.45);
    transform: rotate(0.8deg);
    cursor: zoom-in;
    transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.45s ease;
}
.snb-print:hover { transform: rotate(0deg) translateY(-3px); box-shadow: 0 0 0 2px var(--sky), 0 20px 28px -16px rgba(13, 42, 66, 0.5); }
.snb-clip { position: absolute; top: -20px; left: 40px; width: 16px; height: 46px; z-index: 3; transform: rotate(-6deg); filter: drop-shadow(1px 1px 0.5px rgba(13, 42, 66, 0.25)); }
.snb-frame { position: relative; width: 100%; aspect-ratio: 1200 / 630; overflow: hidden; border-radius: 2px; background: #f4f7fa; }
.snb-frame iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 1200px;
    height: 630px;
    border: 0;
    transform-origin: 0 0;
    transition: opacity 0.3s ease;
}

/* ---- code card ---- */
.snb-code {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    border-radius: 10px;
    background: #0d2a42;
    box-shadow: 0 14px 22px -14px rgba(13, 42, 66, 0.55);
    overflow: hidden;
    animation: snb-fade 0.35s ease both;
}
@keyframes snb-fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.snb-code-bar { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 10px; border-bottom: 1px solid rgba(233, 244, 250, 0.1); }
.snb-code-tabs { display: flex; gap: 4px; }
.snb-code-tabs button {
    height: 26px;
    padding: 0 10px;
    border: 0;
    border-radius: 7px;
    background: transparent;
    color: rgba(233, 244, 250, 0.55);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.12em;
    cursor: pointer;
}
.snb-code-tabs button.is-on { background: rgba(233, 244, 250, 0.12); color: #e9f4fa; }
.snb-copy {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 26px;
    padding: 0 11px;
    border: 0;
    border-radius: 999px;
    background: #e9f4fa;
    color: var(--ink);
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
}
.snb-copy.is-done { background: #8fd3b0; }
.snb-code pre {
    flex: 1;
    min-height: 0;
    margin: 0;
    padding: 12px 14px 16px;
    overflow: auto;
    font-size: 12px;
    line-height: 1.65;
    color: #dce9f2;
    white-space: pre;
    scrollbar-width: thin;
    scrollbar-color: rgba(233, 244, 250, 0.25) transparent;
}
.snb-code .tok-keyword { color: #7cc4ea; }
.snb-code .tok-string { color: #f2c48d; }
.snb-code .tok-function { color: #a5e3c1; }
.snb-code .tok-number { color: #f29e8d; }
.snb-code .tok-comment { color: #6f8ea6; font-style: italic; }

/* ---- spiral ---- */
.snb-spiral {
    position: absolute;
    left: 50%;
    top: 16px;
    bottom: 16px;
    width: 54px;
    margin-left: -27px;
    z-index: 8;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    pointer-events: none;
}
.snb-coil {
    display: block;
    height: 10px;
    border-radius: 7px;
    border: 2.6px solid #2c4356;
    border-left-color: #5d7487;
    border-right-color: #5d7487;
    box-shadow: 0 2px 2px rgba(13, 42, 66, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.25);
    transform: rotate(-8deg);
}

/* ---- stacked (phones / small tablets) ---- */
.snb-fit.is-stack { width: 100%; max-width: 600px; }
.snb-fit.is-stack .snb-book { position: relative; left: 0; top: 0; width: 100%; height: auto; display: flex; flex-direction: column; gap: 18px; }
.snb-fit.is-stack .snb-side { position: relative; width: 100%; height: auto; scroll-margin-top: 90px; }
.snb-fit.is-stack .snb-sheet { position: relative; border-radius: 8px; box-shadow: 0 24px 36px -24px rgba(13, 42, 66, 0.5), 0 0 0 1px rgba(13, 42, 66, 0.08); --margin: 38px; }
.snb-fit.is-stack .snb-holes { display: none; }
.snb-fit.is-stack .snb-body, .snb-fit.is-stack .snb-right .snb-body { position: relative; inset: auto; padding: 26px 20px 24px 52px; }
.snb-fit.is-stack .snb-index { overflow: visible; }
.snb-fit.is-stack .snb-index-title { font-size: 38px; }
.snb-fit.is-stack .snb-title { font-size: 24px; line-height: 30px; }
.snb-fit.is-stack .snb-code pre { max-height: 360px; }
.snb-fit.is-stack .snb-postits { flex-wrap: wrap; }
.snb-fit.is-stack .snb-postit { flex: 1 1 120px; }
@media (max-width: 600px) {
    .snb-bar { flex-wrap: wrap; justify-content: center; }
    .snb-search { order: 3; width: 100%; max-width: none; }
    .snb-tools { flex-wrap: wrap; }
}

/* ---- overlays ---- */
.snb-overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: rgba(13, 42, 66, 0.42);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    animation: snb-ov-in 0.3s ease both;
}
.snb-overlay.is-leaving { animation: snb-ov-out 0.26s ease both; }
@keyframes snb-ov-in { from { opacity: 0; } }
@keyframes snb-ov-out { to { opacity: 0; } }
.snb-overlay > * { animation: snb-pop 0.45s cubic-bezier(0.22, 1, 0.36, 1) both; }
.snb-overlay.is-leaving > * { animation: snb-pop-out 0.26s ease both; }
@keyframes snb-pop { from { opacity: 0; transform: translateY(24px) scale(0.97); } }
@keyframes snb-pop-out { to { opacity: 0; transform: translateY(14px) scale(0.98); } }
.snb-x {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    flex: none;
    border: 0;
    border-radius: 50%;
    background: rgba(27, 79, 114, 0.1);
    color: var(--ink, #0d2a42);
    cursor: pointer;
    transition: transform 0.35s ease, background 0.25s ease;
}
.snb-x:hover { transform: rotate(90deg); background: rgba(27, 79, 114, 0.18); }
.snb-cu {
    width: min(1120px, 100%);
    max-height: 100%;
    display: flex;
    flex-direction: column;
    padding: 18px 20px 14px;
    border-radius: 22px;
    background: #fbfcfd;
    box-shadow: 0 40px 80px -30px rgba(13, 42, 66, 0.7);
    color: #0d2a42;
}
.snb-cu-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 2px 2px 14px; }
.snb-cu-head h3 { margin: 4px 0 0; font-size: 24px; font-weight: 800; letter-spacing: -0.02em; }
.snb-cu-frame { padding: 8px; border-radius: 14px; background: #fff; box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.1); }
.snb-cu-frame .snb-frame { border-radius: 8px; }
.snb-cu-foot { margin: 12px 0 0; text-align: center; font-size: 11px; font-weight: 700; letter-spacing: 0.24em; color: #3a7ca5; }
.snb-bignote {
    --pc: #3a99c9;
    position: relative;
    width: min(460px, 100%);
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 30px 26px 26px;
    border-radius: 3px 3px 22px 3px;
    background: color-mix(in srgb, var(--pc) 20%, #fffdf6);
    box-shadow: 0 40px 70px -30px rgba(13, 42, 66, 0.7);
    color: #0d2a42;
    transform: rotate(-1deg);
}
.snb-bignote .snb-x { position: absolute; top: 12px; right: 12px; width: 32px; height: 32px; background: rgba(255, 255, 255, 0.55); }
.snb-bignote .snb-tape { width: 84px; margin-left: -42px; height: 22px; top: -11px; }
.snb-bignote h3 { margin: 0; padding-right: 30px; font-size: 22px; font-weight: 800; line-height: 1.25; }
.snb-bignote p { margin: 6px 0 0; overflow-y: auto; white-space: pre-wrap; word-break: break-word; font-size: 14px; line-height: 1.65; color: #24425a; }

/* ---- postmark copy button ---- */
.snb-pm-row { display: flex; justify-content: flex-end; margin: 6px -8px -12px 0; flex: none; }
.snb-pm {
    --stamp: rgba(27, 64, 96, 0.82);
    width: 176px;
    padding: 0;
    border: 0;
    background: none;
    cursor: pointer;
    transform: rotate(-9deg);
    transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.snb-pm:hover { transform: rotate(-4deg) scale(1.04); }
.snb-pm:active { transform: rotate(-6deg) scale(0.96); }
.snb-pm:focus-visible { outline: 2px dashed var(--stamp); outline-offset: 4px; border-radius: 12px; }
.snb-pm svg { display: block; width: 100%; height: auto; overflow: visible; }
.snb-pm-waves path { fill: none; stroke: var(--stamp); stroke-width: 2.4; stroke-linecap: round; opacity: 0.75; }
.snb-pm-ring { fill: none; stroke: var(--stamp); stroke-width: 3; }
.snb-pm-ring.thin { stroke-width: 1.6; }
.snb-pm-arc { fill: var(--stamp); font-size: 9.5px; font-weight: 700; letter-spacing: 1px; }
.snb-pm-big { fill: var(--stamp); font-size: 15px; font-weight: 700; letter-spacing: 2px; }
.snb-pm-small { fill: var(--stamp); font-size: 8.5px; font-weight: 700; letter-spacing: 1.5px; }
.snb-pm-rule { stroke: var(--stamp); stroke-width: 1.2; }
/* the ink looks worn: a faint speckle knocked out of it */
.snb-pm svg { -webkit-mask: radial-gradient(circle at 30% 40%, #000 0 60%, rgba(0,0,0,0.82) 100%) , repeating-radial-gradient(circle at 63% 37%, #000 0 1.6px, rgba(0,0,0,0.75) 2px 3px); -webkit-mask-composite: source-in; mask-composite: intersect; }
.snb-pm.is-done .snb-pm-mark { animation: snb-stamp 0.5s cubic-bezier(0.3, 1.6, 0.5, 1) both; transform-origin: 154px 56px; }
.snb-pm.is-done { --stamp: rgba(150, 38, 38, 0.82); }
@keyframes snb-stamp { 0% { transform: scale(1.35); opacity: 0.2; } 100% { transform: scale(1); opacity: 1; } }

@media (prefers-reduced-motion: reduce) {
    .snb-leaf, .snb-shade, .snb-face-back { animation-duration: 0.01ms !important; }
}
`;
